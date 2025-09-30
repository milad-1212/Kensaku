import type {
  ConnectionBase,
  DatabaseConfig,
  DatabaseQueryResult,
  DatabaseTransaction,
  QueryAggregationExpression,
  QueryArrayFunction,
  QueryArrayOperation,
  QueryArraySlice,
  QueryDelete,
  QueryInsert,
  QueryJsonFunction,
  QueryJsonPath,
  QueryMerge,
  QuerySelect,
  QueryStatement,
  QueryUpdate
} from '@interfaces/index'
import { Base } from '@core/dialects/Base'
import { ParameterBuilders, DialectFactory, QueryBuilders } from '@core/dialects/builders/index'
import { errorMessages } from '@constants/index'

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
    this.buildSelectClauseWithJsonAndArray(query, parts)
    this.buildFromClause(query, parts)
    this.buildJoinClauses(query, parts)
    this.buildWhereClauseWithArrayOperations(query, parts, params)
    this.buildGroupByClause(query, parts)
    this.buildHavingClause(query, parts, params)
    this.buildOrderByClause(query, parts, params)
    this.buildLimitClause(query, parts, params)
    this.buildOffsetClause(query, parts, params)
  }

  /**
   * Builds SELECT clause with integrated JSON and Array operations.
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildSelectClauseWithJsonAndArray(query: QuerySelect, parts: string[]): void {
    parts.push('SELECT')
    if (query.distinct === true) {
      parts.push('DISTINCT')
    }
    const selectParts: string[] = []
    this.addBasicSelectParts(query, selectParts)
    this.addAdvancedSelectParts(query, selectParts)
    if (selectParts.length > 0) {
      parts.push(selectParts.join(', '))
    }
  }

  /**
   * Adds basic SELECT parts (columns and aggregations).
   * @param query - SELECT query object
   * @param selectParts - SELECT parts array
   */
  private addBasicSelectParts(query: QuerySelect, selectParts: string[]): void {
    if (query.columns !== undefined && query.columns.length > 0) {
      const columns: string = query.columns
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      selectParts.push(columns)
    } else if (query.aggregations === undefined || query.aggregations.length === 0) {
      selectParts.push('*')
    }
    if (query.aggregations !== undefined && query.aggregations.length > 0) {
      const aggregations: string = query.aggregations
        .map((agg: QueryAggregationExpression): string => this.buildAggregationExpression(agg))
        .join(', ')
      selectParts.push(aggregations)
    }
  }

  /**
   * Adds advanced SELECT parts (JSON and Array operations).
   * @param query - SELECT query object
   * @param selectParts - SELECT parts array
   */
  private addAdvancedSelectParts(query: QuerySelect, selectParts: string[]): void {
    this.addJsonSelectParts(query, selectParts)
    this.addArraySelectParts(query, selectParts)
  }

  /**
   * Adds JSON SELECT parts.
   * @param query - SELECT query object
   * @param selectParts - SELECT parts array
   */
  private addJsonSelectParts(query: QuerySelect, selectParts: string[]): void {
    if (query.jsonPaths && query.jsonPaths.length > 0) {
      const jsonPathClause: string = this.buildJsonPathClause(query)
      if (jsonPathClause) {
        selectParts.push(jsonPathClause)
      }
    }
    if (query.jsonFunctions && query.jsonFunctions.length > 0) {
      const jsonFunctionClause: string = this.buildJsonFunctionClause(query)
      if (jsonFunctionClause) {
        selectParts.push(jsonFunctionClause)
      }
    }
  }

  /**
   * Adds Array SELECT parts.
   * @param query - SELECT query object
   * @param selectParts - SELECT parts array
   */
  private addArraySelectParts(query: QuerySelect, selectParts: string[]): void {
    if (query.arrayFunctions && query.arrayFunctions.length > 0) {
      const arrayFunctionClause: string = this.buildArrayFunctionClause(query)
      if (arrayFunctionClause) {
        selectParts.push(arrayFunctionClause)
      }
    }
    if (query.arraySlices && query.arraySlices.length > 0) {
      const arraySliceClause: string = this.buildArraySliceClause(query)
      if (arraySliceClause) {
        selectParts.push(arraySliceClause)
      }
    }
  }

  /**
   * Builds aggregation expression.
   * @param agg - Aggregation expression
   * @returns SQL string for aggregation
   */
  private buildAggregationExpression(agg: QueryAggregationExpression): string {
    let sql: string
    if (agg.function === 'PERCENTILE_CONT' || agg.function === 'PERCENTILE_DISC') {
      const percentile: number = agg.percentile ?? 0.5
      sql = `${agg.function}(${percentile}) WITHIN GROUP (ORDER BY ${this.escapeIdentifier(agg.column)})`
    } else {
      sql = `${agg.function}(${agg.distinct === true ? 'DISTINCT ' : ''}${this.escapeIdentifier(agg.column)})`
    }
    if (agg.alias !== undefined) {
      sql += ` AS ${this.escapeIdentifier(agg.alias)}`
    }
    return sql
  }

  /**
   * Escapes a value for PostgreSQL.
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
      return value ? 'true' : 'false'
    }
    if (typeof value === 'number') {
      return String(value)
    }
    if (typeof value === 'bigint') {
      return String(value)
    }
    if (typeof value === 'symbol') {
      return `'${String(value).replace(/'/g, '\'\'')}'`
    }
    if (typeof value === 'function') {
      return `'${String(value).replace(/'/g, '\'\'')}'`
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
    const stringValue: string = typeof value === 'string' ? value : JSON.stringify(value)
    return `'${stringValue.replace(/'/g, '\'\'')}'`
  }

  /**
   * Builds advanced SELECT clauses (PIVOT, UNPIVOT, ORDINALITY).
   * @param query - SELECT query object
   * @param parts - SQL parts array
   */
  private buildAdvancedClauses(query: QuerySelect, parts: string[]): void {
    this.buildPivotClauses(query, parts)
    this.buildUnpivotClauses(query, parts)
    this.buildOrdinalityClauses(query, parts)
  }

  /**
   * Builds WHERE clause with integrated Array operations.
   * @param query - SELECT query object
   * @param parts - SQL parts array
   * @param params - Parameters array
   */
  private buildWhereClauseWithArrayOperations(
    query: QuerySelect,
    parts: string[],
    params: unknown[]
  ): void {
    this.buildWhereClause(query, parts, params)
    if (query.arrayOperations && query.arrayOperations.length > 0) {
      const arrayConditions: string[] = query.arrayOperations.map(
        (arrayOp: QueryArrayOperation) => {
          const column: string = this.escapeIdentifier(arrayOp.column)
          const value: string = Array.isArray(arrayOp.value)
            ? `ARRAY[${arrayOp.value.map((v: unknown) => this.escapeValue(v)).join(', ')}]`
            : this.escapeValue(arrayOp.value)
          return `${column} ${arrayOp.operator} ${value}`
        }
      )
      if (arrayConditions.length > 0) {
        if (query.where && query.where.length > 0) {
          parts.push('AND', `(${arrayConditions.join(' AND ')})`)
        } else {
          parts.push('WHERE', arrayConditions.join(' AND '))
        }
      }
    }
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
   * Builds an INSERT query for PostgreSQL.
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
    if (query.conflict) {
      const target: string = query.conflict.target
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push('ON CONFLICT', `(${target})`)
      if (query.conflict.action === 'DO_UPDATE' && query.conflict.update) {
        const setClauses: string[] = Object.entries(query.conflict.update).map(
          ([col, val]: [string, unknown]) =>
            `${this.escapeIdentifier(col)} = ${this.addParam(val, params)}`
        )
        parts.push('DO UPDATE SET', setClauses.join(', '))
        if (query.conflict.where) {
          parts.push('WHERE', this.buildWhereConditions(query.conflict.where, params))
        }
      } else {
        parts.push('DO NOTHING')
      }
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
  buildDeleteQuery(query: QueryDelete): QueryStatement {
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
   * Maps a generic data type to PostgreSQL-specific type.
   * @param type - Generic data type
   * @returns PostgreSQL-specific data type
   */
  getDataType(type: string): string {
    return DialectFactory.createGetDataTypeMethod('postgres')(type)
  }

  /**
   * Builds a MERGE query for PostgreSQL.
   * @param query - MERGE query object
   * @returns Object containing SQL string and parameters
   */
  override buildMergeQuery(query: QueryMerge): QueryStatement {
    const parts: string[] = []
    const params: unknown[] = []
    parts.push('MERGE INTO', this.escapeIdentifier(query.into))
    if (typeof query.using === 'string') {
      parts.push('USING', this.escapeIdentifier(query.using))
    } else {
      parts.push('USING', `(${query.using.query})`)
      params.push(...query.using.params)
    }
    parts.push('ON', this.buildWhereConditions(query.on, params))
    if (query.whenMatched?.update) {
      const setClauses: string[] = Object.entries(query.whenMatched.update).map(
        ([col, val]: [string, unknown]) =>
          `${this.escapeIdentifier(col)} = ${this.addParam(val, params)}`
      )
      parts.push('WHEN MATCHED THEN UPDATE SET', setClauses.join(', '))
    }
    if (query.whenMatched?.delete === true) {
      parts.push('WHEN MATCHED THEN DELETE')
    }
    if (query.whenNotMatched?.insert) {
      const columns: string[] = Object.keys(query.whenNotMatched.insert)
      const values: string[] = columns.map((col: string) => {
        const insertData: Record<string, unknown> | undefined = query.whenNotMatched?.insert
        if (!insertData) {
          throw new Error(errorMessages.QUERY.MERGE_INSERT_DATA_REQUIRED)
        }
        return this.addParam(insertData[col], params)
      })
      parts.push(
        'WHEN NOT MATCHED THEN INSERT',
        `(${columns.map((col: string) => this.escapeIdentifier(col)).join(', ')})`,
        'VALUES',
        `(${values.join(', ')})`
      )
    }
    if (query.returning && query.returning.length > 0) {
      parts.push(
        'RETURNING',
        query.returning.map((col: string) => this.escapeIdentifier(col)).join(', ')
      )
    }
    return { sql: parts.join(' '), params }
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

  /**
   * Builds a PIVOT clause for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for PIVOT clause
   */
  override buildPivotClause(query: QuerySelect): string {
    if (!query.pivot) {
      return ''
    }
    const {
      column,
      values,
      aggregate,
      alias
    }: { column: string; values: string[]; aggregate: string; alias?: string } = query.pivot
    const pivotColumns: string = values
      .map((value: string) => this.escapeIdentifier(value))
      .join(', ')
    const pivotAlias: string = alias !== undefined ? ` AS ${this.escapeIdentifier(alias)}` : ''
    return `PIVOT (${aggregate} FOR ${this.escapeIdentifier(column)} IN (${pivotColumns}))${pivotAlias}`
  }

  /**
   * Builds an UNPIVOT clause for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for UNPIVOT clause
   */
  override buildUnpivotClause(query: QuerySelect): string {
    if (!query.unpivot) {
      return ''
    }
    const {
      columns,
      valueColumn,
      nameColumn
    }: { columns: string[]; valueColumn: string; nameColumn: string } = query.unpivot
    const unpivotColumns: string = columns
      .map((col: string) => this.escapeIdentifier(col))
      .join(', ')
    return `UNPIVOT (${this.escapeIdentifier(valueColumn)} FOR ${this.escapeIdentifier(nameColumn)} IN (${unpivotColumns}))`
  }

  /**
   * Builds a WITH ORDINALITY clause for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for WITH ORDINALITY clause
   */
  override buildOrdinalityClause(query: QuerySelect): string {
    if (!query.ordinality) {
      return ''
    }
    const { valueColumn, ordinalityColumn }: { valueColumn: string; ordinalityColumn: string } =
      query.ordinality
    return `WITH ORDINALITY AS ${this.escapeIdentifier(valueColumn)}, ${this.escapeIdentifier(ordinalityColumn)}`
  }

  /**
   * Builds JSON path clauses for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for JSON path clauses
   */
  override buildJsonPathClause(query: QuerySelect): string {
    if (!query.jsonPaths || query.jsonPaths.length === 0) {
      return ''
    }
    const jsonPathClauses: string[] = query.jsonPaths.map((jsonPath: QueryJsonPath) => {
      const column: string = this.escapeIdentifier(jsonPath.column)
      const path: string = `'${jsonPath.path}'`
      const alias: string =
        jsonPath.alias !== undefined ? ` AS ${this.escapeIdentifier(jsonPath.alias)}` : ''
      return `${column}${jsonPath.operator}${path}${alias}`
    })
    return jsonPathClauses.join(', ')
  }

  /**
   * Builds JSON function clauses for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for JSON function clauses
   */
  override buildJsonFunctionClause(query: QuerySelect): string {
    if (!query.jsonFunctions || query.jsonFunctions.length === 0) {
      return ''
    }
    const jsonFunctionClauses: string[] = query.jsonFunctions.map((jsonFunc: QueryJsonFunction) => {
      const column: string = this.escapeIdentifier(jsonFunc.column)
      const path: string = `'${jsonFunc.path}'`
      const alias: string =
        jsonFunc.alias !== undefined ? ` AS ${this.escapeIdentifier(jsonFunc.alias)}` : ''
      switch (jsonFunc.function) {
        case 'json_extract':
          return `json_extract(${column}, ${path})${alias}`
        case 'json_set':
          return `json_set(${column}, ${path}, ${this.escapeValue(jsonFunc.value ?? null)})${alias}`
        case 'json_remove':
          return `json_remove(${column}, ${path})${alias}`
        case 'json_insert':
          return `json_insert(${column}, ${path}, ${this.escapeValue(jsonFunc.value ?? null)})${alias}`
        case 'json_replace':
          return `json_replace(${column}, ${path}, ${this.escapeValue(jsonFunc.value ?? null)})${alias}`
        case 'json_valid':
          return `json_valid(${column})${alias}`
      }
    })
    return jsonFunctionClauses.join(', ')
  }

  /**
   * Builds array operation clauses for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for array operation clauses
   */
  override buildArrayOperationClause(query: QuerySelect): string {
    if (!query.arrayOperations || query.arrayOperations.length === 0) {
      return ''
    }
    const arrayOperationClauses: string[] = query.arrayOperations.map(
      (arrayOp: QueryArrayOperation) => {
        const column: string = this.escapeIdentifier(arrayOp.column)
        const value: string = Array.isArray(arrayOp.value)
          ? `ARRAY[${arrayOp.value.map((v: unknown) => this.escapeValue(v)).join(', ')}]`
          : this.escapeValue(arrayOp.value)
        return `${column} ${arrayOp.operator} ${value}`
      }
    )
    return arrayOperationClauses.join(' AND ')
  }

  /**
   * Builds array function clauses for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for array function clauses
   */
  override buildArrayFunctionClause(query: QuerySelect): string {
    if (!query.arrayFunctions || query.arrayFunctions.length === 0) {
      return ''
    }
    const arrayFunctionClauses: string[] = query.arrayFunctions.map(
      (arrayFunc: QueryArrayFunction) => {
        const column: string = this.escapeIdentifier(arrayFunc.column)
        const alias: string =
          arrayFunc.alias !== undefined ? ` AS ${this.escapeIdentifier(arrayFunc.alias)}` : ''
        const orderBy: string =
          arrayFunc.orderBy !== undefined && arrayFunc.orderBy.length > 0
            ? ` ORDER BY ${arrayFunc.orderBy.map((col: string) => this.escapeIdentifier(col)).join(', ')}`
            : ''
        switch (arrayFunc.function) {
          case 'array_agg':
            return `array_agg(${column}${orderBy})${alias}`
          case 'unnest':
            return `unnest(${column})${alias}`
          case 'array_length':
            return `array_length(${column}, 1)${alias}`
          case 'array_append':
            return `array_append(${column}, ${this.escapeValue(arrayFunc.value ?? null)})${alias}`
          case 'array_prepend':
            return `array_prepend(${column}, ${this.escapeValue(arrayFunc.value ?? null)})${alias}`
          case 'array_cat':
            return `array_cat(${column}, ${this.escapeValue(arrayFunc.value ?? null)})${alias}`
        }
      }
    )
    return arrayFunctionClauses.join(', ')
  }

  /**
   * Builds array slice clause for PostgreSQL.
   * @param query - SELECT query object
   * @returns SQL string for array slice
   */
  override buildArraySliceClause(query: QuerySelect): string {
    if (!query.arraySlices || query.arraySlices.length === 0) {
      return ''
    }
    const arraySliceClauses: string[] = query.arraySlices.map((arraySlice: QueryArraySlice) => {
      const column: string = this.escapeIdentifier(arraySlice.column)
      const alias: string =
        arraySlice.alias !== undefined ? ` AS ${this.escapeIdentifier(arraySlice.alias)}` : ''
      return `${column}[${arraySlice.start}:${arraySlice.end}]${alias}`
    })
    return arraySliceClauses.join(', ')
  }
}
