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
   * Builds the SELECT clause for MySQL.
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
   * Builds the FROM clause for MySQL.
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
   * Builds JOIN clauses for MySQL.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  private buildJoinClauses(query: QuerySelect, parts: string[], params: unknown[]): void {
    if (query.joins != null) {
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
   * Builds the WHERE clause for MySQL.
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
   * Builds the GROUP BY clause for MySQL.
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
   * Builds the HAVING clause for MySQL.
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
   * Builds the ORDER BY clause for MySQL.
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
   * Builds the LIMIT clause for MySQL.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildLimitClause(query: QuerySelect, parts: string[]): void {
    if (query.limit !== undefined && query.limit > 0) {
      parts.push('LIMIT', query.limit.toString())
    }
  }

  /**
   * Builds the OFFSET clause for MySQL.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  private buildOffsetClause(query: QuerySelect, parts: string[]): void {
    if (query.offset !== undefined && query.offset > 0) {
      parts.push('OFFSET', query.offset.toString())
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
    const typeMap: Record<string, string> = {
      VARCHAR: 'VARCHAR(255)',
      TEXT: 'TEXT',
      CHAR: 'CHAR(1)',
      INT: 'INT',
      BIGINT: 'BIGINT',
      SMALLINT: 'SMALLINT',
      TINYINT: 'TINYINT',
      DECIMAL: 'DECIMAL(10,2)',
      FLOAT: 'FLOAT',
      DOUBLE: 'DOUBLE',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      TIME: 'TIME',
      TIMESTAMP: 'TIMESTAMP',
      DATETIME: 'DATETIME',
      JSON: 'JSON',
      UUID: 'CHAR(36)',
      ARRAY: 'JSON'
    }
    return typeMap[type.toUpperCase()] ?? type.toUpperCase()
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
   * Adds a parameter to the params array and returns placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns Parameter placeholder string
   */
  private addParam(value: unknown, params: unknown[]): string {
    params.push(value)
    return '?'
  }

  /**
   * Builds WHERE conditions into SQL string for MySQL.
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
}
