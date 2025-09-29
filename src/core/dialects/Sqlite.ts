import type {
  ConnectionBase,
  DatabaseConfig,
  DatabaseQueryResult,
  DatabaseTransaction,
  QuerySelect,
  QueryInsert,
  QueryUpdate,
  QueryDelete,
  QueryWhereCondition,
  QueryComparisonOperator
} from '@interfaces/index'
import { Base } from '@core/dialects/index'

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
    const sqlite3: typeof import('sqlite3') = await import('sqlite3')
    const { open }: { open: typeof import('sqlite').open } = await import('sqlite')
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
    this.buildSelectClause(query, parts)
    this.buildFromClause(query, parts)
    this.buildJoinClauses(query, parts, params)
    this.buildWhereClause(query, parts, params)
    this.buildGroupByClause(query, parts)
    this.buildHavingClause(query, parts, params)
    this.buildOrderByClause(query, parts)
    this.buildLimitClause(query, parts)
    this.buildOffsetClause(query, parts)
    return {
      sql: parts.join(' '),
      params
    }
  }

  /**
   * Builds the SELECT clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildSelectClause(query: QuerySelect, parts: string[]): void {
    parts.push('SELECT')
    if (query.distinct === true) {
      parts.push('DISTINCT')
    }
    if (query.columns !== undefined && query.columns.length > 0) {
      const columns: string = query.columns
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push(columns)
    } else {
      parts.push('*')
    }
  }

  /**
   * Builds the FROM clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildFromClause(query: QuerySelect, parts: string[]): void {
    if (query.from !== undefined) {
      const fromTable: string =
        typeof query.from === 'string' ? query.from : query.from.alias ?? 'subquery'
      parts.push('FROM', this.escapeIdentifier(fromTable))
    }
  }

  /**
   * Builds JOIN clauses for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  private buildJoinClauses(query: QuerySelect, parts: string[], params: unknown[]): void {
    if (query.joins !== undefined) {
      for (const join of query.joins) {
        const tableName: string =
          typeof join.table === 'string' ? join.table : join.table.alias ?? 'subquery'
        parts.push(join.type, 'JOIN', this.escapeIdentifier(tableName))
        if (join.on != null && join.on.length > 0) {
          parts.push('ON', this.buildWhereConditions(join.on, params))
        }
      }
    }
  }

  /**
   * Builds the WHERE clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  private buildWhereClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    if (query.where !== undefined && query.where.length > 0) {
      parts.push('WHERE', this.buildWhereConditions(query.where, params))
    }
  }

  /**
   * Builds the GROUP BY clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildGroupByClause(query: QuerySelect, parts: string[]): void {
    if (query.groupBy !== undefined && query.groupBy.length > 0) {
      const columns: string = query.groupBy
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push('GROUP BY', columns)
    }
  }

  /**
   * Builds the HAVING clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  private buildHavingClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    if (query.having !== undefined && query.having.length > 0) {
      parts.push('HAVING', this.buildWhereConditions(query.having, params))
    }
  }

  /**
   * Builds the ORDER BY clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildOrderByClause(query: QuerySelect, parts: string[]): void {
    if (query.orderBy !== undefined && query.orderBy.length > 0) {
      const orders: string = query.orderBy
        .map(
          (order: { column: string; direction: string }) =>
            `${this.escapeIdentifier(order.column)} ${order.direction}`
        )
        .join(', ')
      parts.push('ORDER BY', orders)
    }
  }

  /**
   * Builds the LIMIT clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildLimitClause(query: QuerySelect, parts: string[]): void {
    if (query.limit !== undefined && query.limit > 0) {
      parts.push('LIMIT', query.limit.toString())
    }
  }

  /**
   * Builds the OFFSET clause for SQLite.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildOffsetClause(query: QuerySelect, parts: string[]): void {
    if (query.offset !== undefined && query.offset > 0) {
      parts.push('OFFSET', query.offset.toString())
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
   * Adds a parameter to the params array and returns SQLite placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns SQLite parameter placeholder string
   */
  private addParam(value: unknown, params: unknown[]): string {
    params.push(value)
    return '?'
  }

  /**
   * Builds WHERE conditions into SQL string for SQLite.
   * @param conditions - Array of WHERE conditions
   * @param params - Array to store query parameters
   * @returns SQL string for WHERE clause
   */
  private buildWhereConditions(conditions: QueryWhereCondition[], params: unknown[]): string {
    return conditions
      .map((condition: QueryWhereCondition, index: number) => {
        const column: string = this.escapeIdentifier(condition.column)
        const { operator }: { operator: QueryComparisonOperator } = condition
        const value: string = this.addParam(condition.value, params)
        const logical: string = condition.logical ?? 'AND'
        if (index === 0) {
          return `${column} ${operator} ${value}`
        }
        return `${logical} ${column} ${operator} ${value}`
      })
      .join(' ')
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
      return `'${value.replace(/'/g, '\'\'')}'`
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`
    }
    return `'${JSON.stringify(value).replace(/'/g, '\'\'')}'`
  }

  /**
   * Maps a generic data type to SQLite-specific type.
   * @param type - Generic data type
   * @returns SQLite-specific data type
   */
  getDataType(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'TEXT',
      number: 'INTEGER',
      boolean: 'INTEGER',
      date: 'DATETIME',
      text: 'TEXT',
      varchar: 'TEXT',
      int: 'INTEGER',
      integer: 'INTEGER',
      float: 'REAL',
      real: 'REAL',
      double: 'REAL',
      decimal: 'REAL',
      numeric: 'REAL',
      blob: 'BLOB',
      json: 'TEXT'
    }
    return typeMap[type.toLowerCase()] ?? 'TEXT'
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
}
