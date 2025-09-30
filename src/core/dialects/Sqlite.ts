import { createRequire } from 'node:module'
import type {
  ConnectionBase,
  DatabaseConfig,
  DatabaseQueryResult,
  DatabaseTransaction,
  QueryDelete,
  QueryInsert,
  QuerySelect,
  QueryStatement,
  QueryUpdate
} from '@interfaces/index'
import { Base } from '@core/dialects/index'
import { DialectFactory, QueryBuilders } from '@core/dialects/builders'

/**
 * SQLite database dialect implementation.
 * @description Provides SQLite-specific database operations and query building.
 */
export class Sqlite extends Base {
  /**
   * Creates a SQLite database connection.
   * @param config - Database configuration
   * @returns Promise that resolves to a SQLite connection
   */
  async createConnection(config: DatabaseConfig): Promise<ConnectionBase> {
    const require: ReturnType<typeof createRequire> = createRequire(import.meta.url)
    const sqlite3: typeof import('sqlite3') = require('sqlite3') as typeof import('sqlite3')
    const { open }: { open: typeof import('sqlite').open } = require('sqlite') as {
      open: typeof import('sqlite').open
    }
    const db: import('sqlite').Database = await open({
      filename: config.database,
      driver: sqlite3.Database
    })
    return {
      async query(sql: string, params?: unknown[]): Promise<DatabaseQueryResult> {
        const rows: unknown[] = await db.all(sql, params)
        const info: { changes: number } | undefined = await db.get('SELECT changes() as changes')
        return {
          rows,
          rowCount: info?.changes ?? 0,
          fields: []
        }
      },
      async transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
        await db.exec('BEGIN TRANSACTION')
        try {
          const tx: DatabaseTransaction = {
            query: async (sql: string, params?: unknown[]) => {
              const rows: unknown[] = await db.all(sql, params)
              const info: { changes: number } | undefined = await db.get(
                'SELECT changes() as changes'
              )
              return {
                rows,
                rowCount: info?.changes ?? 0,
                fields: []
              }
            },
            commit: async () => {
              await db.exec('COMMIT')
            },
            rollback: async () => {
              await db.exec('ROLLBACK')
            }
          }
          const result: T = await callback(tx)
          await db.exec('COMMIT')
          return result
        } catch (error) {
          await db.exec('ROLLBACK')
          throw error
        }
      },
      async close(): Promise<void> {
        await db.close()
      }
    }
  }

  /**
   * Builds a SELECT query for SQLite.
   * @param query - SELECT query object
   * @returns Object containing SQL string and parameters
   */
  buildSelectQuery(query: QuerySelect): QueryStatement {
    const parts: string[] = []
    const params: unknown[] = []
    if (query.ctes !== undefined && query.ctes.length > 0) {
      this.buildCTEClause(query, parts, params)
    }
    this.buildSelectClause(query, parts)
    this.buildFromClause(query, parts)
    this.buildJoinClauses(query, parts)
    this.buildWhereClause(query, parts, params)
    this.buildGroupByClause(query, parts)
    this.buildHavingClause(query, parts, params)
    this.buildOrderByClause(query, parts, params)
    this.buildLimitClause(query, parts, params)
    this.buildOffsetClause(query, parts, params)
    if (query.pivot) {
      const pivotClause: string = this.buildPivotClause(query)
      if (pivotClause) {
        parts.push(pivotClause)
      }
    }
    if (query.unpivot) {
      const unpivotClause: string = this.buildUnpivotClause(query)
      if (unpivotClause) {
        parts.push(unpivotClause)
      }
    }
    if (query.ordinality) {
      const ordinalityClause: string = this.buildOrdinalityClause(query)
      if (ordinalityClause) {
        parts.push(ordinalityClause)
      }
    }
    QueryBuilders.buildSetOperations(
      query,
      parts,
      params,
      this.escapeIdentifier.bind(this),
      this.buildSelectQuery.bind(this)
    )
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Builds an INSERT query for SQLite.
   * @param query - INSERT query object
   * @returns Object containing SQL string and parameters
   */
  buildInsertQuery(query: QueryInsert): QueryStatement {
    const parts: string[] = []
    const params: unknown[] = []
    parts.push('INSERT INTO', this.escapeIdentifier(query.into))
    if (Array.isArray(query.values) && query.values.length > 0 && query.values[0] !== undefined) {
      const columns: string[] = Object.keys(query.values[0])
      const columnList: string = columns.map((col: string) => this.escapeIdentifier(col)).join(', ')
      parts.push(`(${columnList})`)
      const valueRows: string[] = query.values.map((row: Record<string, unknown>) => {
        const values: string = columns
          .map((col: string) => this.addParam(row[col], params))
          .join(', ')
        return `(${values})`
      })
      parts.push('VALUES', valueRows.join(', '))
    } else if (query.values != null && !Array.isArray(query.values)) {
      const columns: string[] = Object.keys(query.values)
      const columnList: string = columns.map((col: string) => this.escapeIdentifier(col)).join(', ')
      const values: string = columns
        .map((col: string) => this.addParam((query.values as Record<string, unknown>)[col], params))
        .join(', ')
      parts.push(`(${columnList})`, 'VALUES', `(${values})`)
    }
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Builds an UPDATE query for SQLite.
   * @param query - UPDATE query object
   * @returns Object containing SQL string and parameters
   */
  buildUpdateQuery(query: QueryUpdate): QueryStatement {
    const parts: string[] = []
    const params: unknown[] = []
    parts.push('UPDATE', this.escapeIdentifier(query.table))
    const setClauses: string[] = Object.entries(query.set).map(
      ([column, value]: [string, unknown]) => {
        const escapedColumn: string = this.escapeIdentifier(column)
        const param: string = this.addParam(value, params)
        return `${escapedColumn} = ${param}`
      }
    )
    parts.push('SET', setClauses.join(', '))
    if (query.where !== undefined && query.where.length > 0) {
      parts.push('WHERE', this.buildWhereConditions(query.where, params))
    }
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Builds a DELETE query for SQLite.
   * @param query - DELETE query object
   * @returns Object containing SQL string and parameters
   */
  buildDeleteQuery(query: QueryDelete): QueryStatement {
    const parts: string[] = []
    const params: unknown[] = []
    parts.push('DELETE FROM', this.escapeIdentifier(query.from))
    if (query.where !== undefined && query.where.length > 0) {
      parts.push('WHERE', this.buildWhereConditions(query.where, params))
    }
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Maps a generic data type to SQLite-specific type.
   * @param type - Generic data type
   * @returns SQLite-specific data type
   */
  getDataType(type: string): string {
    return DialectFactory.createGetDataTypeMethod('sqlite')(type)
  }
}
