import type {
  QuerySelect,
  QueryWhereCondition,
  QueryComparisonOperator,
  QueryDirectionType,
  QuerySubQuery,
  QueryWindowSpec,
  QueryCaseExpression
} from '@interfaces/index'
import {
  ConditionalMixin,
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
    const dialect: Base = this.connectionManager.getDialect()
    return dialect.buildSelectQuery(this.query)
  }

  /**
   * Converts the query to a QuerySelect object.
   * @returns QuerySelect object
   */
  toQuery(): QuerySelect {
    return { ...this.query }
  }

  /**
   * Adds a FIRST_VALUE() window function to the query.
   * @param column - Column to get first value of
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  firstValue(column: string, over?: QueryWindowSpec): this {
    WindowMixin.addFirstValue(this.query, column, over)
    return this
  }

  /**
   * Adds a LAST_VALUE() window function to the query.
   * @param column - Column to get last value of
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  lastValue(column: string, over?: QueryWindowSpec): this {
    WindowMixin.addLastValue(this.query, column, over)
    return this
  }

  /**
   * Adds an NTILE() window function to the query.
   * @param buckets - Number of buckets to divide rows into
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  ntile(buckets: number, over?: QueryWindowSpec): this {
    if (buckets <= 0) {
      throw new Error(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE)
    }
    WindowMixin.addNtile(this.query, buckets, over)
    return this
  }

  /**
   * Adds a CUME_DIST() window function to the query.
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  cumeDist(over?: QueryWindowSpec): this {
    WindowMixin.addCumeDist(this.query, over)
    return this
  }

  /**
   * Adds a PERCENT_RANK() window function to the query.
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  percentRank(over?: QueryWindowSpec): this {
    WindowMixin.addPercentRank(this.query, over)
    return this
  }

  /**
   * Adds an NTH_VALUE() window function to the query.
   * @param column - Column to get nth value of
   * @param n - Position of the value to return
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  nthValue(column: string, n: number, over?: QueryWindowSpec): this {
    WindowMixin.addNthValue(this.query, column, n, over)
    return this
  }

  /**
   * Adds a CASE expression to the query.
   * @param cases - Array of case conditions and values
   * @param elseValue - Optional else value
   * @param alias - Optional alias for the expression
   * @returns This builder instance for method chaining
   */
  caseWhen(cases: QueryCaseExpression[], elseValue?: string | number, alias?: string): this {
    ConditionalMixin.addCase(this.query, cases, elseValue, alias)
    return this
  }

  /**
   * Adds a COALESCE expression to the query.
   * @param columns - Array of columns to coalesce
   * @param alias - Optional alias for the expression
   * @returns This builder instance for method chaining
   */
  coalesce(columns: string[], alias?: string): this {
    ConditionalMixin.addCoalesce(this.query, columns, alias)
    return this
  }

  /**
   * Adds a NULLIF expression to the query.
   * @param column1 - First column to compare
   * @param column2 - Second column to compare
   * @param alias - Optional alias for the expression
   * @returns This builder instance for method chaining
   */
  nullIf(column1: string, column2: string, alias?: string): this {
    ConditionalMixin.addNullIf(this.query, column1, column2, alias)
    return this
  }

  // ===== SET OPERATIONS =====

  /**
   * Adds an INTERSECT clause to the query.
   * @param query - Query to intersect with
   * @returns This builder instance for method chaining
   */
  intersect(query: QuerySelect | SelectBuilder): this {
    const intersectQuery: QuerySelect = query instanceof SelectBuilder ? query.toQuery() : query
    UnionMixin.addIntersect(this.query, intersectQuery)
    return this
  }

  /**
   * Adds an EXCEPT clause to the query.
   * @param query - Query to except with
   * @returns This builder instance for method chaining
   */
  except(query: QuerySelect | SelectBuilder): this {
    const exceptQuery: QuerySelect = query instanceof SelectBuilder ? query.toQuery() : query
    UnionMixin.addExcept(this.query, exceptQuery)
    return this
  }

  /**
   * Adds a MINUS clause to the query (MySQL alias for EXCEPT).
   * @param query - Query to minus with
   * @returns This builder instance for method chaining
   */
  minus(query: QuerySelect | SelectBuilder): this {
    const minusQuery: QuerySelect = query instanceof SelectBuilder ? query.toQuery() : query
    UnionMixin.addMinus(this.query, minusQuery)
    return this
  }
}
