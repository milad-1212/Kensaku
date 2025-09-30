import type { FieldPacket } from 'mysql2'
import type {
  ConnectionBase,
  DatabaseConfig,
  DatabaseQueryResult,
  DatabaseTransaction,
  QueryDelete,
  QueryInsert,
  QuerySelect,
  QueryUpdate,
  QueryStatement
} from '@interfaces/index'
import { Base } from '@core/dialects/index'
import { DialectFactory, QueryBuilders } from '@core/dialects/builders/index'

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
  buildSelectQuery(query: QuerySelect): QueryStatement {
    const parts: string[] = []
    const params: unknown[] = []
    this.buildBasicSelectClauses(query, parts, params)
    this.buildAdvancedClauses(query, parts)
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
   * Builds basic SELECT clauses (CTE, SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET).
   * @param query - SELECT query object
   * @param parts - SQL parts array
   * @param params - Parameters array
   */
  private buildBasicSelectClauses(query: QuerySelect, parts: string[], params: unknown[]): void {
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
  }

  /**
   * Builds advanced SELECT clauses (PIVOT, UNPIVOT, ORDINALITY, JSON, Array operations).
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildAdvancedClauses(query: QuerySelect, parts: string[]): void {
    this.buildPivotClauses(query, parts)
    this.buildUnpivotClauses(query, parts)
    this.buildOrdinalityClauses(query, parts)
    this.buildJsonClauses(query, parts)
    this.buildArrayClauses(query, parts)
  }

  /**
   * Builds PIVOT clauses.
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildPivotClauses(query: QuerySelect, parts: string[]): void {
    if (query.pivot) {
      const pivotClause: string = this.buildPivotClause(query)
      if (pivotClause) {
        parts.push(pivotClause)
      }
    }
  }

  /**
   * Builds UNPIVOT clauses.
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildUnpivotClauses(query: QuerySelect, parts: string[]): void {
    if (query.unpivot) {
      const unpivotClause: string = this.buildUnpivotClause(query)
      if (unpivotClause) {
        parts.push(unpivotClause)
      }
    }
  }

  /**
   * Builds WITH ORDINALITY clauses.
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildOrdinalityClauses(query: QuerySelect, parts: string[]): void {
    if (query.ordinality) {
      const ordinalityClause: string = this.buildOrdinalityClause(query)
      if (ordinalityClause) {
        parts.push(ordinalityClause)
      }
    }
  }

  /**
   * Builds JSON operation clauses.
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildJsonClauses(query: QuerySelect, parts: string[]): void {
    if (query.jsonPaths && query.jsonPaths.length > 0) {
      const jsonPathClause: string = this.buildJsonPathClause(query)
      if (jsonPathClause) {
        parts.push(jsonPathClause)
      }
    }
    if (query.jsonFunctions && query.jsonFunctions.length > 0) {
      const jsonFunctionClause: string = this.buildJsonFunctionClause(query)
      if (jsonFunctionClause) {
        parts.push(jsonFunctionClause)
      }
    }
  }

  /**
   * Builds Array operation clauses.
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildArrayClauses(query: QuerySelect, parts: string[]): void {
    if (query.arrayOperations && query.arrayOperations.length > 0) {
      const arrayOperationClause: string = this.buildArrayOperationClause(query)
      if (arrayOperationClause) {
        parts.push(arrayOperationClause)
      }
    }
    if (query.arrayFunctions && query.arrayFunctions.length > 0) {
      const arrayFunctionClause: string = this.buildArrayFunctionClause(query)
      if (arrayFunctionClause) {
        parts.push(arrayFunctionClause)
      }
    }
    if (query.arraySlices && query.arraySlices.length > 0) {
      this.buildArraySliceClause(query)
    }
  }

  /**
   * Builds an INSERT query for MySQL.
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
   * Builds an UPDATE query for MySQL.
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
   * Builds a DELETE query for MySQL.
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
   * Escapes a MySQL identifier.
   * @param name - Identifier to escape
   * @returns Escaped identifier string
   */
  override escapeIdentifier(name: string): string {
    if (name.includes('.')) {
      return name
        .split('.')
        .map((part: string) => `\`${part.replace(/`/g, '``')}\``)
        .join('.')
    }
    return `\`${name.replace(/`/g, '``')}\``
  }

  /**
   * Escapes a value for MySQL.
   * @param value - Value to escape
   * @returns Escaped value string
   */
  override escapeValue(value: unknown): string {
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
  override getLimitSyntax(limit?: number, offset?: number): string {
    if (limit !== undefined && limit >= 0 && offset !== undefined && offset > 0) {
      const safeLimit: number = Math.min(limit, Base.MAX_LIMIT)
      return `LIMIT ${offset}, ${safeLimit}`
    } else if (limit !== undefined && limit >= 0) {
      const safeLimit: number = Math.min(limit, Base.MAX_LIMIT)
      return `LIMIT ${safeLimit}`
    } else if (offset !== undefined && offset > 0) {
      return `LIMIT ${offset}, ${Base.MAX_LIMIT}`
    }
    return ''
  }
}
