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
import { ParameterBuilders, DialectFactory } from '@core/dialects/builders/index'
import type { FieldPacket } from 'mysql2'

/**
 * MySQL result interface for internal use.
 */
interface MySqlResult {
  affectedRows?: number
}

/**
 * MySQL database dialect implementation.
 * @description Provides MySQL-specific database operations and query building.
 */
export class MySql extends Base {
  /**
   * Creates a MySQL database connection.
   * @param config - Database configuration
   * @returns Promise that resolves to a MySQL connection
   */
  async createConnection(config: DatabaseConfig): Promise<ConnectionBase> {
    const mysql: typeof import('mysql2/promise') = await import('mysql2/promise')
    const connection: Awaited<ReturnType<typeof mysql.createConnection>> =
      await mysql.createConnection({
        host: config.host ?? 'localhost',
        port: config.port ?? 3306,
        database: config.database,
        user: config.username ?? 'root',
        password: config.password ?? ''
      })
    return {
      async query(sql: string, params?: unknown[]): Promise<DatabaseQueryResult> {
        const [rows, fields]: [unknown, FieldPacket[] | undefined] = await connection.execute(
          sql,
          params
        )
        const result: MySqlResult[] = rows as MySqlResult[]
        return {
          rows: result as unknown[],
          rowCount: result[0]?.affectedRows ?? 0,
          fields:
            fields?.map((field: FieldPacket) => ({
              name: field.name,
              type: (field.type ?? 0).toString(),
              nullable: !((field.flags as number) & 1)
            })) ?? []
        }
      },
      async transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
        await connection.beginTransaction()
        try {
          const tx: DatabaseTransaction = {
            query: async (sql: string, params?: unknown[]) => {
              const [rows, fields]: [unknown, FieldPacket[] | undefined] = await connection.execute(
                sql,
                params
              )
              const result: MySqlResult[] = rows as MySqlResult[]
              return {
                rows: result as unknown[],
                rowCount: result[0]?.affectedRows ?? 0,
                fields:
                  fields?.map((field: FieldPacket) => ({
                    name: field.name,
                    type: (field.type ?? 0).toString(),
                    nullable: !((field.flags as number) & 1)
                  })) ?? []
              }
            },
            commit: async () => {
              await connection.commit()
            },
            rollback: async () => {
              await connection.rollback()
            }
          }
          const result: T = await callback(tx)
          await connection.commit()
          return result
        } catch (error) {
          await connection.rollback()
          throw error
        }
      },
      async close(): Promise<void> {
        await connection.end()
      }
    }
  }

  /**
   * Builds a SELECT query for MySQL.
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
   * Builds an INSERT query for MySQL.
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
   * Builds an UPDATE query for MySQL.
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
   * Builds a DELETE query for MySQL.
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
   * Escapes a MySQL identifier.
   * @param name - Identifier to escape
   * @returns Escaped identifier string
   */
  escapeIdentifier(name: string): string {
    return `\`${name.replace(/`/g, '``')}\``
  }

  /**
   * Escapes a value for MySQL.
   * @param value - Value to escape
   * @returns Escaped value string
   */
  escapeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL'
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, '\'\'')}'`
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0'
    }
    if (value instanceof Date) {
      return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
    }
    if (Array.isArray(value)) {
      const items: string = value.map((v: unknown) => this.escapeValue(v)).join(', ')
      return `(${items})`
    }
    if (typeof value === 'object' && value != null) {
      const jsonString: string = JSON.stringify(value)
      return `'${jsonString.replace(/'/g, '\'\'')}'`
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (typeof value === 'symbol' || typeof value === 'bigint') {
      return String(value)
    }
    return String(value as string | number | boolean | symbol | bigint)
  }

  /**
   * Maps a generic data type to MySQL-specific type.
   * @param type - Generic data type
   * @returns MySQL-specific data type
   */
  getDataType(type: string): string {
    return DialectFactory.createGetDataTypeMethod('mysql')(type)
  }

  /**
   * Gets the LIMIT/OFFSET syntax for MySQL.
   * @param limit - Number of rows to limit
   * @param offset - Number of rows to skip
   * @returns MySQL LIMIT/OFFSET SQL syntax
   */
  getLimitSyntax(limit?: number, offset?: number): string {
    if (limit !== undefined && limit > 0 && offset !== undefined && offset > 0) {
      return `LIMIT ${offset}, ${limit}`
    } else if (limit !== undefined && limit > 0) {
      return `LIMIT ${limit}`
    } else if (offset !== undefined && offset > 0) {
      return `LIMIT ${offset}, 18446744073709551615`
    }
    return ''
  }

  /**
   * Adds a parameter to the params array and returns MySQL placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns Parameter placeholder string
   */
  protected override addParam(value: unknown, params: unknown[]): string {
    return ParameterBuilders.addParam(value, params)
  }
}
