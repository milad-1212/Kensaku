import type { QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'
import { SelectBaseBuilder } from '@builders/abstracts/SelectBase'
import { WhereMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'

/**
 * Abstract class for SELECT query building with conditional logic (WHERE clauses).
 * @description Extends SelectBaseBuilder with WHERE condition functionality.
 * @template T - Return type of query results
 */
export abstract class SelectConditionalBuilder<T = unknown> extends SelectBaseBuilder<T> {
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
}
