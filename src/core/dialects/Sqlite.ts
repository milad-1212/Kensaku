import { createRequire } from 'node:module'
import type {
  ConnectionBase,
  DatabaseConfig,
  DatabaseQueryResult,
  DatabaseTransaction,
  QuerySelect,
  QueryInsert,
  QueryUpdate,
  QueryDelete
} from '@interfaces/index'
import { Base } from '@core/dialects/index'
import { ParameterBuilders, DialectFactory } from '@core/dialects/builders'

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
  buildSelectQuery(query: QuerySelect): { sql: string; params: unknown[] } {
    const parts: string[] = []
    const params: unknown[] = []
    if (query.ctes !== undefined && query.ctes.length > 0) {
      this.buildCTEClause(query, parts, params)
    }
    this.buildSelectClause(query, parts)
    this.buildFromClause(query, parts)
    this.buildJoinClauses(query, parts, params)
    this.buildWhereClause(query, parts, params)
    this.buildGroupByClause(query, parts)
    this.buildHavingClause(query, parts, params)
    this.buildOrderByClause(query, parts)
    this.buildLimitClause(query, parts)
    this.buildOffsetClause(query, parts)
    if (query.unions !== undefined && query.unions.length > 0) {
      this.buildUnionClauses(query, parts, params)
    }
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
  buildInsertQuery(query: QueryInsert): { sql: string; params: unknown[] } {
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
  buildUpdateQuery(query: QueryUpdate): { sql: string; params: unknown[] } {
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
  buildDeleteQuery(query: QueryDelete): { sql: string; params: unknown[] } {
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
   * Escapes a SQLite identifier.
   * @param name - Identifier to escape
   * @returns Escaped identifier string
   */
  escapeIdentifier(name: string): string {
    return `"${name.replace(/"/g, '""')}"`
  }

  /**
   * Escapes a value for SQLite.
   * @param value - Value to escape
   * @returns Escaped value string
   */
  escapeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL'
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`
    }
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`
  }

  /**
   * Maps a generic data type to SQLite-specific type.
   * @param type - Generic data type
   * @returns SQLite-specific data type
   */
  getDataType(type: string): string {
    return DialectFactory.createGetDataTypeMethod('sqlite')(type)
  }

  /**
   * Gets the LIMIT/OFFSET syntax for SQLite.
   * @param limit - Number of rows to limit
   * @param offset - Number of rows to skip
   * @returns SQLite LIMIT/OFFSET SQL syntax
   */
  getLimitSyntax(limit?: number, offset?: number): string {
    if (limit === undefined) {
      return ''
    }
    if (offset === undefined || offset === 0) {
      return `LIMIT ${limit}`
    }
    return `LIMIT ${limit} OFFSET ${offset}`
  }

  /**
   * Adds a parameter to the params array and returns SQLite placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns SQLite parameter placeholder string
   */
  protected override addParam(value: unknown, params: unknown[]): string {
    return ParameterBuilders.addParam(value, params)
  }
}
