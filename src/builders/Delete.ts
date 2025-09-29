import type { QueryDelete, QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'
import {
  ReturningClauseHelpers,
  WhereConditionHelpers,
  WhereClauseHelpers
} from '@builders/helpers/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'

/**
 * Query builder for DELETE operations with fluent interface.
 * @description Provides a fluent interface for building DELETE SQL queries with support for WHERE conditions and RETURNING clauses.
 * @template T - Return type of query results
 */
export class DeleteBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the DELETE query structure */
  private readonly query: QueryDelete = {} as QueryDelete

  /**
   * Specifies the table to delete from.
   * @param table - Table name
   * @returns This builder instance for method chaining
   */
  from(table: string): this {
    this.query.from = table
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
    this.query.where ??= []
    this.query.where.push(
      WhereClauseHelpers.createWhereCondition(columnOrCondition, operatorOrValue, value)
    )
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
    this.query.where ??= []
    this.query.where.push(
      WhereClauseHelpers.createAndWhereCondition(columnOrCondition, operatorOrValue, value)
    )
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
    this.query.where ??= []
    this.query.where.push(
      WhereClauseHelpers.createOrWhereCondition(columnOrCondition, operatorOrValue, value)
    )
    return this
  }

  /**
   * Specifies columns to return after delete.
   * @param columns - Columns to return
   * @returns This builder instance for method chaining
   */
  returning(columns: string | string[]): this {
    ReturningClauseHelpers.setReturningColumns(this.query, columns)
    return this
  }

  /**
   * Builds the final SQL query and parameters.
   * @returns Object containing SQL string and parameters
   * @throws {Error} When query validation fails
   */
  protected buildQuery(): { sql: string; params: unknown[] } {
    QueryValidator.validateDeleteQuery(this.query)
    const parts: string[] = []
    this.params = []
    parts.push('DELETE FROM', this.escapeIdentifier(this.query.from))
    if (this.query.where && this.query.where.length > 0) {
      parts.push(
        'WHERE',
        WhereConditionHelpers.buildWhereConditions(
          this.query.where,
          this.escapeIdentifier.bind(this),
          this.addParam.bind(this)
        )
      )
    }
    if (this.query.returning && this.query.returning.length > 0) {
      parts.push(
        ReturningClauseHelpers.buildReturningClause(
          this.query.returning,
          this.escapeIdentifier.bind(this)
        )
      )
    }
    return {
      sql: parts.join(' '),
      params: this.params
    }
  }
}
