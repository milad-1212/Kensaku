import type {
  QuerySelect,
  QueryWhereCondition,
  QueryComparisonOperator,
  QueryDirectionType,
  QuerySubQuery,
  QueryWindowSpec,
  QueryWindowFunction,
  QueryAggregationExpression
} from '@interfaces/index'
import { WhereConditionHelper } from '@builders/helpers/index'
import {
  AggregationMixin,
  CteMixin,
  HavingMixin,
  JoinMixin,
  SelectMixin,
  UnionMixin,
  WhereMixin,
  WindowMixin
} from '@builders/mixins/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'
import { Base } from '@core/dialects/index'
import { errorMessages } from '@constants/index'

/**
 * Query builder for SELECT operations with fluent interface.
 * @description Provides a fluent interface for building complex SELECT SQL queries with support for JOINs, WHERE conditions, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET, window functions, CTEs, and UNIONs.
 * @template T - Return type of query results
 */
export class SelectBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the SELECT query structure */
  private readonly query: QuerySelect = {}

  /**
   * Specifies columns to select from the table.
   * @param columns - Column names as individual parameters
   * @returns This builder instance for method chaining
   */
  select(...columns: string[]): this {
    SelectMixin.setColumns(this.query, ...columns)
    return this
  }

  /**
   * Selects all columns from the table.
   * @returns This builder instance for method chaining
   */
  selectAll(): this {
    SelectMixin.setSelectAll(this.query)
    return this
  }

  /**
   * Adds DISTINCT clause to the query.
   * @returns This builder instance for method chaining
   */
  distinct(): this {
    SelectMixin.setDistinct(this.query)
    return this
  }

  /**
   * Specifies the table to select from.
   * @param table - Table name or subquery
   * @returns This builder instance for method chaining
   * @throws {Error} When table name is empty or subquery is invalid
   */
  from(table: string | QuerySubQuery | SelectBuilder): this {
    if (table instanceof SelectBuilder) {
      const subquery: QuerySubQuery = {
        query: table.toSQL(),
        params: table.toParams(),
        alias: 'subquery'
      }
      SelectMixin.setFrom(this.query, subquery)
    } else {
      SelectMixin.setFrom(this.query, table)
    }
    return this
  }

  /**
   * Adds a WHERE condition to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  where(column: string, operator: QueryComparisonOperator, value: unknown): this
  /**
   * Adds a WHERE condition to the query.
   * @param condition - Complete WHERE condition object
   * @returns This builder instance for method chaining
   */
  where(condition: QueryWhereCondition): this
  /**
   * Adds a WHERE condition to the query.
   * @param column - Column name
   * @param value - Value to compare against (uses '=' operator)
   * @returns This builder instance for method chaining
   */
  where(column: string, value: unknown): this
  where(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): this {
    WhereMixin.addWhereCondition(this.query, columnOrCondition, operatorOrValue, value)
    return this
  }

  /**
   * Adds an AND WHERE condition to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  andWhere(column: string, operator: QueryComparisonOperator, value: unknown): this
  /**
   * Adds an AND WHERE condition to the query.
   * @param condition - Complete WHERE condition object
   * @returns This builder instance for method chaining
   */
  andWhere(condition: QueryWhereCondition): this
  /**
   * Adds an AND WHERE condition to the query.
   * @param column - Column name
   * @param value - Value to compare against (uses '=' operator)
   * @returns This builder instance for method chaining
   */
  andWhere(column: string, value: unknown): this
  andWhere(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): this {
    WhereMixin.addAndWhereCondition(this.query, columnOrCondition, operatorOrValue, value)
    return this
  }

  /**
   * Adds an OR WHERE condition to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  orWhere(column: string, operator: QueryComparisonOperator, value: unknown): this
  /**
   * Adds an OR WHERE condition to the query.
   * @param condition - Complete WHERE condition object
   * @returns This builder instance for method chaining
   */
  orWhere(condition: QueryWhereCondition): this
  /**
   * Adds an OR WHERE condition to the query.
   * @param column - Column name
   * @param value - Value to compare against (uses '=' operator)
   * @returns This builder instance for method chaining
   */
  orWhere(column: string, value: unknown): this
  orWhere(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): this {
    WhereMixin.addOrWhereCondition(this.query, columnOrCondition, operatorOrValue, value)
    return this
  }

  /**
   * Adds a raw SQL WHERE condition to the query.
   * @param sql - Raw SQL condition
   * @param params - Optional parameters for the SQL
   * @returns This builder instance for method chaining
   */
  whereRaw(sql: string, params?: unknown[]): this {
    if (sql == null || sql === '') {
      throw new Error(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    }
    WhereMixin.addRawWhereCondition(this.query, sql, params)
    return this
  }

  /**
   * Adds a raw SQL AND WHERE condition to the query.
   * @param sql - Raw SQL condition
   * @param params - Optional parameters for the SQL
   * @returns This builder instance for method chaining
   */
  andWhereRaw(sql: string, params?: unknown[]): this {
    if (sql == null || sql === '') {
      throw new Error(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    }
    WhereMixin.addRawAndWhereCondition(this.query, sql, params)
    return this
  }

  /**
   * Adds a raw SQL OR WHERE condition to the query.
   * @param sql - Raw SQL condition
   * @param params - Optional parameters for the SQL
   * @returns This builder instance for method chaining
   */
  orWhereRaw(sql: string, params?: unknown[]): this {
    if (sql == null || sql === '') {
      throw new Error(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    }
    WhereMixin.addRawOrWhereCondition(this.query, sql, params)
    return this
  }

  /**
   * Adds an INNER JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  join(table: string, on: QueryWhereCondition[]): this {
    JoinMixin.addInnerJoin(this.query, table, on)
    return this
  }

  /**
   * Adds an INNER JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  innerJoin(table: string, on: QueryWhereCondition[]): this {
    JoinMixin.addInnerJoin(this.query, table, on)
    return this
  }

  /**
   * Adds a LEFT JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  leftJoin(table: string, on: QueryWhereCondition[]): this {
    JoinMixin.addLeftJoin(this.query, table, on)
    return this
  }

  /**
   * Adds a RIGHT JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  rightJoin(table: string, on: QueryWhereCondition[]): this {
    JoinMixin.addRightJoin(this.query, table, on)
    return this
  }

  /**
   * Adds a FULL JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  fullJoin(table: string, on: QueryWhereCondition[]): this {
    JoinMixin.addFullJoin(this.query, table, on)
    return this
  }

  /**
   * Adds a CROSS JOIN to the query.
   * @param table - Table to join
   * @returns This builder instance for method chaining
   */
  crossJoin(table: string): this {
    JoinMixin.addCrossJoin(this.query, table)
    return this
  }

  /**
   * Adds a GROUP BY clause to the query.
   * @param columns - Columns to group by
   * @returns This builder instance for method chaining
   */
  groupBy(columns: string | string[]): this {
    SelectMixin.setGroupBy(this.query, columns)
    return this
  }

  /**
   * Adds a HAVING clause to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  having(column: string, operator: QueryComparisonOperator, value: unknown): this {
    HavingMixin.addHavingCondition(this.query, column, operator, value)
    return this
  }

  /**
   * Adds an ORDER BY clause to the query.
   * @param column - Column to order by
   * @param direction - Sort direction
   * @returns This builder instance for method chaining
   */
  orderBy(column: string, direction: QueryDirectionType = 'ASC'): this {
    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new Error(errorMessages.VALIDATION.INVALID_ORDER_DIRECTION)
    }
    SelectMixin.addOrderBy(this.query, column, direction)
    return this
  }

  /**
   * Adds an ORDER BY expression to the query.
   * @param expression - SQL expression to order by
   * @param direction - Sort direction
   * @returns This builder instance for method chaining
   */
  orderByExpression(expression: string, direction: QueryDirectionType = 'ASC'): this {
    SelectMixin.addOrderByExpression(this.query, expression, direction)
    return this
  }

  /**
   * Adds a LIMIT clause to the query.
   * @param count - Number of rows to limit
   * @returns This builder instance for method chaining
   */
  limit(count: number): this {
    SelectMixin.setLimit(this.query, count)
    return this
  }

  /**
   * Adds an OFFSET clause to the query.
   * @param count - Number of rows to skip
   * @returns This builder instance for method chaining
   */
  offset(count: number): this {
    SelectMixin.setOffset(this.query, count)
    return this
  }

  /**
   * Builds the final SQL query and parameters.
   * @returns Object containing SQL string and parameters
   */
  protected buildQuery(): { sql: string; params: unknown[] } {
    QueryValidator.validateSelectQuery(this.query)
    const parts: string[] = []
    this.params = []
    this.buildCteClause(parts)
    this.buildSelectClause(parts)
    this.buildFromClause(parts)
    this.buildJoinClauses(parts)
    this.buildWhereClause(parts)
    this.buildGroupByClause(parts)
    this.buildHavingClause(parts)
    this.buildOrderByClause(parts)
    this.buildLimitClause(parts)
    this.buildOffsetClause(parts)
    this.buildUnionClause(parts)
    return {
      sql: parts.join(' '),
      params: this.params
    }
  }

  /**
   * Builds the SELECT clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildSelectClause(parts: string[]): void {
    parts.push('SELECT')
    if (this.query.distinct === true) {
      parts.push('DISTINCT')
    }
    const selectParts: string[] = []
    if (this.query.columns != null && this.query.columns.length > 0) {
      const columns: string = this.escapeColumnExpressionList(this.query.columns)
      selectParts.push(columns)
    } else if (this.query.aggregations == null || this.query.aggregations.length === 0) {
      selectParts.push('*')
    }
    if (this.query.aggregations != null && this.query.aggregations.length > 0) {
      const aggregations: string = this.query.aggregations
        .map((agg: QueryAggregationExpression) => this.buildAggregationExpression(agg))
        .join(', ')
      selectParts.push(aggregations)
    }
    if (this.query.windowFunctions != null && this.query.windowFunctions.length > 0) {
      const windowFunctions: string = this.query.windowFunctions
        .map((wf: QueryWindowFunction) => this.buildWindowFunction(wf))
        .join(', ')
      selectParts.push(windowFunctions)
    }
    parts.push(selectParts.join(', '))
  }

  /**
   * Builds the FROM clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildFromClause(parts: string[]): void {
    if (this.query.from != null) {
      if (typeof this.query.from === 'string') {
        parts.push('FROM', this.escapeIdentifier(this.query.from))
      } else {
        const subquery: QuerySubQuery = this.query.from
        const alias: string = subquery.alias ?? 'subquery'
        parts.push('FROM', `(${subquery.query}) AS ${this.escapeIdentifier(alias)}`)
      }
    }
  }

  /**
   * Builds the JOIN clauses of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildJoinClauses(parts: string[]): void {
    if (this.query.joins != null) {
      for (const join of this.query.joins) {
        const tableName: string =
          typeof join.table === 'string' ? join.table : join.table.alias ?? 'subquery'
        parts.push(join.type, 'JOIN', this.escapeIdentifier(tableName))
        if (join.on != null && join.on.length > 0) {
          parts.push('ON', this.buildWhereConditions(join.on))
        }
      }
    }
  }

  /**
   * Builds the WHERE clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildWhereClause(parts: string[]): void {
    if (this.query.where != null && this.query.where.length > 0) {
      parts.push('WHERE', this.buildWhereConditions(this.query.where))
    }
  }

  /**
   * Builds the GROUP BY clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildGroupByClause(parts: string[]): void {
    if (this.query.groupBy != null && this.query.groupBy.length > 0) {
      const columns: string = this.escapeIdentifierList(this.query.groupBy)
      parts.push('GROUP BY', columns)
    }
  }

  /**
   * Builds the HAVING clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildHavingClause(parts: string[]): void {
    const havingClause: string = HavingMixin.buildHavingClause(
      this.query,
      this.buildWhereConditions.bind(this)
    )
    if (havingClause) {
      parts.push(havingClause)
    }
  }

  /**
   * Builds the ORDER BY clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildOrderByClause(parts: string[]): void {
    if (this.query.orderBy != null && this.query.orderBy.length > 0) {
      const orders: string = this.query.orderBy
        .map((order: { column: string; direction: string; isExpression?: boolean }) => {
          const columnExpr: string =
            order.isExpression === true ? order.column : this.escapeIdentifier(order.column)
          return `${columnExpr} ${order.direction}`
        })
        .join(', ')
      parts.push('ORDER BY', orders)
    }
  }

  /**
   * Builds the LIMIT clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildLimitClause(parts: string[]): void {
    if (this.query.limit != null && this.query.limit > 0) {
      parts.push('LIMIT', this.query.limit.toString())
    }
  }

  /**
   * Builds the OFFSET clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildOffsetClause(parts: string[]): void {
    if (this.query.offset != null && this.query.offset > 0) {
      parts.push('OFFSET', this.query.offset.toString())
    }
  }

  /**
   * Builds WHERE conditions into SQL string.
   * @param conditions - Array of WHERE conditions
   * @returns SQL string for WHERE conditions
   */
  private buildWhereConditions(conditions: QueryWhereCondition[]): string {
    return WhereConditionHelper.buildWhereConditions(
      conditions,
      this.escapeIdentifier.bind(this),
      this.addParam.bind(this),
      this.isColumnReference.bind(this)
    )
  }

  /**
   * Checks if a value is a column reference (contains dot notation).
   * @param value - Value to check
   * @returns True if value is a column reference
   */
  private isColumnReference(value: unknown): boolean {
    return (
      typeof value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_.]*\.[a-zA-Z_][a-zA-Z0-9_.]*$/.test(value)
    )
  }

  /**
   * Builds a window function SQL string.
   * @param windowFunction - Window function object
   * @returns SQL string for the window function
   */
  private buildWindowFunction(windowFunction: QueryWindowFunction): string {
    const {
      function: func,
      args,
      over
    }: {
      function: string
      args?: string[]
      over?: { partitionBy?: string[]; orderBy?: { column: string; direction: string }[] }
    } = windowFunction
    let sql: string = func
    if (args != null && args.length > 0) {
      const escapedArgs: string = args
        .map((arg: string): string => this.escapeIdentifier(arg))
        .join(', ')
      sql += `(${escapedArgs})`
    } else {
      sql += '()'
    }
    if (over != null) {
      sql += ' OVER ('
      if (over.partitionBy != null && over.partitionBy.length > 0) {
        const partitionBy: string = over.partitionBy
          .map((col: string) => this.escapeIdentifier(col))
          .join(', ')
        sql += `PARTITION BY ${partitionBy}`
      }
      if (over.orderBy != null && over.orderBy.length > 0) {
        if (over.partitionBy != null && over.partitionBy.length > 0) {
          sql += ' '
        }
        const orderBy: string = over.orderBy
          .map(
            (order: { column: string; direction: string }) =>
              `${this.escapeIdentifier(order.column)} ${order.direction}`
          )
          .join(', ')
        sql += `ORDER BY ${orderBy}`
      }
      sql += ')'
    }
    return sql
  }

  /**
   * Builds an aggregation expression SQL string.
   * @param aggregation - Aggregation expression object
   * @returns SQL string for the aggregation expression
   */
  private buildAggregationExpression(aggregation: QueryAggregationExpression): string {
    let sql: string = aggregation.function
    if (this.isPercentileFunction(aggregation.function)) {
      sql += this.buildPercentileExpression(aggregation)
    } else if (this.isStringAggregationFunction(aggregation.function)) {
      sql += this.buildStringAggregationExpression(aggregation)
    } else if (this.isArrayAggregationFunction(aggregation.function)) {
      sql += this.buildArrayAggregationExpression(aggregation)
    } else {
      sql += this.buildStandardAggregationExpression(aggregation)
    }
    if (aggregation.alias != null) {
      sql += ` AS ${this.escapeIdentifier(aggregation.alias)}`
    }
    return sql
  }

  /**
   * Checks if the function is a percentile function.
   * @param func - Function name
   * @returns True if it's a percentile function
   */
  private isPercentileFunction(func: string): boolean {
    return func === 'PERCENTILE_CONT' || func === 'PERCENTILE_DISC'
  }

  /**
   * Checks if the function is a string aggregation function.
   * @param func - Function name
   * @returns True if it's a string aggregation function
   */
  private isStringAggregationFunction(func: string): boolean {
    return func === 'GROUP_CONCAT' || func === 'STRING_AGG'
  }

  /**
   * Checks if the function is an array aggregation function.
   * @param func - Function name
   * @returns True if it's an array aggregation function
   */
  private isArrayAggregationFunction(func: string): boolean {
    return func === 'ARRAY_AGG' || func === 'JSON_AGG'
  }

  /**
   * Builds percentile expression SQL.
   * @param aggregation - Aggregation expression object
   * @returns SQL string for percentile expression
   */
  private buildPercentileExpression(aggregation: QueryAggregationExpression): string {
    if (aggregation.percentile == null) {
      throw new Error(errorMessages.AGGREGATION.PERCENTILE_REQUIRED)
    }
    return `(${aggregation.percentile}) WITHIN GROUP (ORDER BY ${this.escapeIdentifier(aggregation.column)})`
  }

  /**
   * Builds string aggregation expression SQL.
   * @param aggregation - Aggregation expression object
   * @returns SQL string for string aggregation expression
   */
  private buildStringAggregationExpression(aggregation: QueryAggregationExpression): string {
    const distinctModifier: string = aggregation.distinct === true ? 'DISTINCT ' : ''
    const columnExpr: string = `${distinctModifier}${this.escapeIdentifier(aggregation.column)}`
    const separatorClause: string =
      aggregation.separator != null ? ` SEPARATOR '${aggregation.separator}'` : ''
    if (aggregation.orderBy != null && aggregation.orderBy.length > 0) {
      const orderBy: string = this.buildAggregationOrderByClause(aggregation.orderBy)
      return `(${columnExpr} ORDER BY ${orderBy}${separatorClause})`
    }
    return `(${columnExpr}${separatorClause})`
  }

  /**
   * Builds array aggregation expression SQL.
   * @param aggregation - Aggregation expression object
   * @returns SQL string for array aggregation expression
   */
  private buildArrayAggregationExpression(aggregation: QueryAggregationExpression): string {
    const distinctModifier: string = aggregation.distinct === true ? 'DISTINCT ' : ''
    const columnExpr: string = `${distinctModifier}${this.escapeIdentifier(aggregation.column)}`
    if (aggregation.orderBy != null && aggregation.orderBy.length > 0) {
      const orderBy: string = this.buildAggregationOrderByClause(aggregation.orderBy)
      return `(${columnExpr} ORDER BY ${orderBy})`
    }
    return `(${columnExpr})`
  }

  /**
   * Builds standard aggregation expression SQL.
   * @param aggregation - Aggregation expression object
   * @returns SQL string for standard aggregation expression
   */
  private buildStandardAggregationExpression(aggregation: QueryAggregationExpression): string {
    const distinctModifier: string = aggregation.distinct === true ? 'DISTINCT ' : ''
    const columnExpr: string =
      aggregation.column === '*'
        ? '*'
        : `${distinctModifier}${this.escapeIdentifier(aggregation.column)}`
    return `(${columnExpr})`
  }

  /**
   * Builds ORDER BY clause for aggregations.
   * @param orderBy - Order by clauses
   * @returns SQL string for ORDER BY clause
   */
  private buildAggregationOrderByClause(orderBy: { column: string; direction: string }[]): string {
    return orderBy
      .map(
        (order: { column: string; direction: string }) =>
          `${this.escapeIdentifier(order.column)} ${order.direction}`
      )
      .join(', ')
  }

  /**
   * Adds a UNION clause to the query.
   * @param query - Query to union with
   * @returns This builder instance for method chaining
   */
  union(query: SelectBuilder): this {
    UnionMixin.addUnion(this.query, query.toQuery())
    return this
  }

  /**
   * Adds a UNION ALL clause to the query.
   * @param query - Query to union with
   * @returns This builder instance for method chaining
   */
  unionAll(query: SelectBuilder): this {
    UnionMixin.addUnionAll(this.query, query.toQuery())
    return this
  }

  /**
   * Adds a Common Table Expression (CTE) to the query.
   * @param name - CTE name
   * @param query - CTE query
   * @returns This builder instance for method chaining
   */
  with(name: string, query: SelectBuilder): this {
    CteMixin.addCte(this.query, name, query.toQuery())
    return this
  }

  /**
   * Adds a recursive Common Table Expression (CTE) to the query.
   * @param name - CTE name
   * @param query - CTE query
   * @returns This builder instance for method chaining
   */
  withRecursive(name: string, query: SelectBuilder): this {
    CteMixin.addRecursiveCte(this.query, name, query.toQuery())
    return this
  }

  /**
   * Adds a ROW_NUMBER() window function to the query.
   * @param over - Window specification
   * @returns This builder instance for method chaining
   */
  rowNumber(over?: QueryWindowSpec): this {
    WindowMixin.addRowNumber(this.query, over)
    return this
  }

  /**
   * Adds a RANK() window function to the query.
   * @param over - Window specification
   * @returns This builder instance for method chaining
   */
  rank(over?: QueryWindowSpec): this {
    WindowMixin.addRank(this.query, over)
    return this
  }

  /**
   * Adds a DENSE_RANK() window function to the query.
   * @param over - Window specification
   * @returns This builder instance for method chaining
   */
  denseRank(over?: QueryWindowSpec): this {
    WindowMixin.addDenseRank(this.query, over)
    return this
  }

  /**
   * Adds a LAG() window function to the query.
   * @param column - Column to lag
   * @param offset - Offset value
   * @param over - Window specification
   * @returns This builder instance for method chaining
   */
  lag(column: string, offset: number = 1, over?: QueryWindowSpec): this {
    WindowMixin.addLag(this.query, column, offset, over)
    return this
  }

  /**
   * Adds a LEAD() window function to the query.
   * @param column - Column to lead
   * @param offset - Offset value
   * @param over - Window specification
   * @returns This builder instance for method chaining
   */
  lead(column: string, offset: number = 1, over?: QueryWindowSpec): this {
    WindowMixin.addLead(this.query, column, offset, over)
    return this
  }

  /**
   * Error message for empty column names.
   */

  /**
   * Validates column name for aggregations.
   * @param column - Column name to validate
   * @throws {Error} If column name is invalid
   */
  private validateAggregationColumn(column: string): void {
    if (column == null || column === '') {
      throw new Error(errorMessages.VALIDATION.EMPTY_COLUMN)
    }
  }

  /**
   * Adds a COUNT aggregation to the query.
   * @param column - Column to count (use '*' for all rows)
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to count distinct values
   * @returns This builder instance for method chaining
   */
  count(column: string = '*', alias?: string, distinct?: boolean): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addCount(this.query, column, alias, distinct)
    return this
  }

  /**
   * Adds a SUM aggregation to the query.
   * @param column - Column to sum
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to sum distinct values
   * @returns This builder instance for method chaining
   */
  sum(column: string, alias?: string, distinct?: boolean): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addSum(this.query, column, alias, distinct)
    return this
  }

  /**
   * Adds an AVG aggregation to the query.
   * @param column - Column to average
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to average distinct values
   * @returns This builder instance for method chaining
   */
  avg(column: string, alias?: string, distinct?: boolean): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addAvg(this.query, column, alias, distinct)
    return this
  }

  /**
   * Adds a MAX aggregation to the query.
   * @param column - Column to find maximum of
   * @param alias - Optional alias for the aggregation
   * @returns This builder instance for method chaining
   */
  max(column: string, alias?: string): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addMax(this.query, column, alias)
    return this
  }

  /**
   * Adds a MIN aggregation to the query.
   * @param column - Column to find minimum of
   * @param alias - Optional alias for the aggregation
   * @returns This builder instance for method chaining
   */
  min(column: string, alias?: string): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addMin(this.query, column, alias)
    return this
  }

  /**
   * Adds a STDDEV aggregation to the query.
   * @param column - Column to calculate standard deviation of
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to calculate standard deviation of distinct values
   * @returns This builder instance for method chaining
   */
  stdDev(column: string, alias?: string, distinct?: boolean): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addStdDev(this.query, column, alias, distinct)
    return this
  }

  /**
   * Adds a VARIANCE aggregation to the query.
   * @param column - Column to calculate variance of
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to calculate variance of distinct values
   * @returns This builder instance for method chaining
   */
  variance(column: string, alias?: string, distinct?: boolean): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addVariance(this.query, column, alias, distinct)
    return this
  }

  /**
   * Adds a PERCENTILE_CONT aggregation to the query.
   * @param column - Column to calculate percentile of
   * @param percentile - Percentile value (0-1)
   * @param alias - Optional alias for the aggregation
   * @returns This builder instance for method chaining
   */
  percentileCont(column: string, percentile: number, alias?: string): this {
    this.validateAggregationColumn(column)
    if (typeof percentile !== 'number' || isNaN(percentile) || percentile < 0 || percentile > 1) {
      throw new Error(errorMessages.VALIDATION.INVALID_PERCENTILE)
    }
    AggregationMixin.addPercentileCont(this.query, column, percentile, alias)
    return this
  }

  /**
   * Adds a GROUP_CONCAT aggregation to the query.
   * @param column - Column to concatenate
   * @param alias - Optional alias for the aggregation
   * @param separator - Optional separator for concatenation
   * @param orderBy - Optional ordering for concatenation
   * @param distinct - Whether to concatenate distinct values
   * @returns This builder instance for method chaining
   */
  groupConcat(
    column: string,
    alias?: string,
    separator?: string,
    orderBy?: { column: string; direction: 'ASC' | 'DESC' }[],
    distinct?: boolean
  ): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addGroupConcat(this.query, column, alias, separator, orderBy, distinct)
    return this
  }

  /**
   * Adds a STRING_AGG aggregation to the query (PostgreSQL).
   * @param column - Column to aggregate
   * @param alias - Optional alias for the aggregation
   * @param separator - Optional separator for aggregation
   * @param orderBy - Optional ordering for aggregation
   * @param distinct - Whether to aggregate distinct values
   * @returns This builder instance for method chaining
   */
  stringAgg(
    column: string,
    alias?: string,
    separator?: string,
    orderBy?: { column: string; direction: 'ASC' | 'DESC' }[],
    distinct?: boolean
  ): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addStringAgg(this.query, column, alias, separator, orderBy, distinct)
    return this
  }

  /**
   * Adds an ARRAY_AGG aggregation to the query.
   * @param column - Column to aggregate into array
   * @param alias - Optional alias for the aggregation
   * @param orderBy - Optional ordering for aggregation
   * @param distinct - Whether to aggregate distinct values
   * @returns This builder instance for method chaining
   */
  arrayAgg(
    column: string,
    alias?: string,
    orderBy?: { column: string; direction: 'ASC' | 'DESC' }[],
    distinct?: boolean
  ): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addArrayAgg(this.query, column, alias, orderBy, distinct)
    return this
  }

  /**
   * Adds a JSON_AGG aggregation to the query.
   * @param column - Column to aggregate into JSON array
   * @param alias - Optional alias for the aggregation
   * @param orderBy - Optional ordering for aggregation
   * @param distinct - Whether to aggregate distinct values
   * @returns This builder instance for method chaining
   */
  jsonAgg(
    column: string,
    alias?: string,
    orderBy?: { column: string; direction: 'ASC' | 'DESC' }[],
    distinct?: boolean
  ): this {
    this.validateAggregationColumn(column)
    AggregationMixin.addJsonAgg(this.query, column, alias, orderBy, distinct)
    return this
  }

  /**
   * Converts the query to a QuerySelect object.
   * @returns QuerySelect object
   */
  toQuery(): QuerySelect {
    return { ...this.query }
  }

  /**
   * Builds the CTE clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildCteClause(parts: string[]): void {
    if (this.query.ctes != null && this.query.ctes.length > 0) {
      const dialect: Base = this.connectionManager.getDialect()
      dialect.buildCTEClause(this.query, parts, this.params)
    }
  }

  /**
   * Builds the UNION clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildUnionClause(parts: string[]): void {
    if (this.query.unions != null && this.query.unions.length > 0) {
      const dialect: Base = this.connectionManager.getDialect()
      dialect.buildUnionClauses(this.query, parts, this.params)
    }
  }
}
