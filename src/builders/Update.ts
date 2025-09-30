import type {
  QueryUpdate,
  QueryWhereCondition,
  QueryComparisonOperator,
  QueryStatement
} from '@interfaces/index'
import { ReturningClauseHelper, WhereConditionHelper } from '@builders/helpers/index'
import { UpdateMixin, WhereMixin } from '@builders/mixins/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'

/**
 * Query builder for UPDATE operations with fluent interface.
 * @description Provides a fluent interface for building UPDATE SQL queries with support for WHERE conditions and RETURNING clauses.
 * @template T - Return type of query results
 */
export class UpdateBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the UPDATE query structure */
  private readonly query: QueryUpdate = {} as QueryUpdate

  /**
   * Specifies the table to update.
   * @param table - Table name
   * @returns This builder instance for method chaining
   */
  table(table: string): this {
    UpdateMixin.setUpdateTable(this.query, table)
    return this
  }

  /**
   * Specifies the data to update.
   * @param data - Data to update as key-value pairs
   * @returns This builder instance for method chaining
   */
  set(data: Record<string, unknown>): this {
    UpdateMixin.setUpdateData(this.query, data)
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
   * Specifies columns to return after update.
   * @param columns - Columns to return
   * @returns This builder instance for method chaining
   */
  returning(columns: string | string[]): this {
    ReturningClauseHelper.setReturningColumns(this.query, columns)
    return this
  }

  /**
   * Builds the final SQL query and parameters.
   * @returns Object containing SQL string and parameters
   * @throws {Error} When query validation fails
   */
  protected buildQuery(): QueryStatement {
    QueryValidator.validateUpdateQuery(this.query)
    const parts: string[] = []
    this.params = []
    parts.push(UpdateMixin.buildUpdateClause(this.query, this.escapeIdentifier.bind(this)))
    parts.push(
      UpdateMixin.buildSetClause(
        this.query,
        this.escapeIdentifier.bind(this),
        this.addParam.bind(this)
      )
    )
    if (this.query.where && this.query.where.length > 0) {
      parts.push(
        'WHERE',
        WhereConditionHelper.buildWhereConditions(
          this.query.where,
          this.escapeIdentifier.bind(this),
          this.addParam.bind(this)
        )
      )
    }
    if (this.query.returning && this.query.returning.length > 0) {
      parts.push(
        ReturningClauseHelper.buildReturningClause(
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
