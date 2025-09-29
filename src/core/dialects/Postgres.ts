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
import { Base } from '@core/dialects/Base'
import { ParameterBuilders, DialectFactory } from '@core/dialects/builders/index'

/**
 * PostgreSQL database dialect implementation.
 * @description Provides PostgreSQL-specific database operations and query building.
 */
export class Postgres extends Base {
  /**
   * Creates a PostgreSQL database connection.
   * @param config - Database configuration
   * @returns Promise that resolves to a PostgreSQL connection
   */
  async createConnection(config: DatabaseConfig): Promise<ConnectionBase> {
    const { Client: pgClient }: { Client: typeof import('pg').Client } = await import('pg')
    const client: import('pg').Client = new pgClient({
      host: config.host ?? 'localhost',
      port: config.port ?? 5432,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl === true ? { rejectUnauthorized: false } : false
    })
    await client.connect()
    return {
      async query(sql: string, params?: unknown[]): Promise<DatabaseQueryResult> {
        const result: import('pg').QueryResult = await client.query(sql, params)
        return {
          rows: result.rows,
          rowCount: result.rowCount ?? 0,
          fields:
            result.fields?.map((field: import('pg').FieldDef) => ({
              name: field.name,
              type: field.dataTypeID.toString(),
              nullable: true
            })) ?? []
        }
      },
      async transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
        await client.query('BEGIN')
        try {
          const tx: DatabaseTransaction = {
            query: async (sql: string, params?: unknown[]) => {
              const result: import('pg').QueryResult = await client.query(sql, params)
              return {
                rows: result.rows,
                rowCount: result.rowCount ?? 0,
                fields:
                  result.fields?.map((field: import('pg').FieldDef) => ({
                    name: field.name,
                    type: field.dataTypeID.toString(),
                    nullable: true
                  })) ?? []
              }
            },
            commit: async () => {
              await client.query('COMMIT')
            },
            rollback: async () => {
              await client.query('ROLLBACK')
            }
          }
          const result: T = await callback(tx)
          await client.query('COMMIT')
          return result
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        }
      },
      async close(): Promise<void> {
        await client.end()
      }
    }
  }

  /**
   * Builds a SELECT query for PostgreSQL.
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
   * Builds an INSERT query for PostgreSQL.
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
    if (query.returning !== undefined && query.returning.length > 0) {
      const columns: string = query.returning
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push('RETURNING', columns)
    }
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Builds an UPDATE query for PostgreSQL.
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
    if (query.returning != null && query.returning.length > 0) {
      const columns: string = query.returning
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push('RETURNING', columns)
    }
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Builds a DELETE query for PostgreSQL.
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
    if (query.returning != null && query.returning.length > 0) {
      const columns: string = query.returning
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push('RETURNING', columns)
    }
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Escapes a PostgreSQL identifier.
   * @param name - Identifier to escape
   * @returns Escaped identifier string
   */
  escapeIdentifier(name: string): string {
    return `"${name.replace(/"/g, '""')}"`
  }

  /**
   * Escapes a value for PostgreSQL.
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
      return value ? 'TRUE' : 'FALSE'
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`
    }
    if (Array.isArray(value)) {
      const items: string = value.map((v: unknown) => this.escapeValue(v)).join(', ')
      return `ARRAY[${items}]`
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
   * Maps a generic data type to PostgreSQL-specific type.
   * @param type - Generic data type
   * @returns PostgreSQL-specific data type
   */
  getDataType(type: string): string {
    return DialectFactory.createGetDataTypeMethod('postgres')(type)
  }

  /**
   * Gets the LIMIT/OFFSET syntax for PostgreSQL.
   * @param limit - Number of rows to limit
   * @param offset - Number of rows to skip
   * @returns PostgreSQL LIMIT/OFFSET SQL syntax
   */
  getLimitSyntax(limit?: number, offset?: number): string {
    const parts: string[] = []
    if (limit !== undefined && limit > 0) {
      parts.push(`LIMIT ${limit}`)
    }
    if (offset !== undefined && offset > 0) {
      parts.push(`OFFSET ${offset}`)
    }
    return parts.join(' ')
  }

  /**
   * Adds a parameter to the params array and returns PostgreSQL placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns PostgreSQL parameter placeholder string
   */
  protected override addParam(value: unknown, params: unknown[]): string {
    return ParameterBuilders.addParamPostgres(value, params)
  }
}
