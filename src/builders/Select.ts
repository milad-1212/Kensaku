import type {
  QuerySelect,
  QueryWhereCondition,
  QueryComparisonOperator,
  QueryDirectionType,
  QuerySubQuery,
  QueryWindowSpec,
  QueryWindowFunction
} from '@interfaces/index'
import { WhereConditionHelper } from '@builders/helpers/index'
import {
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
    SelectMixin.addOrderBy(this.query, column, direction)
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
    if (this.query.columns != null && this.query.columns.length > 0) {
      const columns: string = this.escapeColumnExpressionList(this.query.columns)
      parts.push(columns)
    } else {
      parts.push('*')
    }
    if (this.query.windowFunctions != null && this.query.windowFunctions.length > 0) {
      const windowFunctions: string = this.query.windowFunctions
        .map((wf: QueryWindowFunction) => this.buildWindowFunction(wf))
        .join(', ')
      parts.push(',', windowFunctions)
    }
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
        .map(
          (order: { column: string; direction: string }) =>
            `${this.escapeIdentifier(order.column)} ${order.direction}`
        )
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
