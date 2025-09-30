import type {
  QueryMerge,
  QueryWhereCondition,
  QuerySubQuery,
  QueryStatement
} from '@interfaces/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'
import { Base } from '@core/dialects/index'

/**
 * Query builder for MERGE operations with fluent interface.
 * @description Provides a fluent interface for building MERGE SQL queries with support for WHEN MATCHED and WHEN NOT MATCHED clauses.
 * @template T - Return type of query results
 */
export class MergeBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the MERGE query structure */
  private readonly query: QueryMerge = {} as QueryMerge

  /**
   * Specifies the target table for the merge operation.
   * @param table - Target table name
   * @returns This builder instance for method chaining
   */
  into(table: string): this {
    this.query.into = table
    return this
  }

  /**
   * Specifies the source table or subquery for the merge operation.
   * @param source - Source table name or subquery
   * @returns This builder instance for method chaining
   */
  using(source: string | QuerySubQuery): this {
    this.query.using = source
    return this
  }

  /**
   * Specifies the join conditions for the merge operation.
   * @param conditions - Join conditions
   * @returns This builder instance for method chaining
   */
  on(conditions: QueryWhereCondition[]): this {
    this.query.on = conditions
    return this
  }

  /**
   * Specifies the WHEN MATCHED UPDATE clause.
   * @param data - Data to update when matched
   * @returns This builder instance for method chaining
   */
  whenMatchedUpdate(data: Record<string, unknown>): this {
    this.query.whenMatched = { update: data }
    return this
  }

  /**
   * Specifies the WHEN MATCHED DELETE clause.
   * @returns This builder instance for method chaining
   */
  whenMatchedDelete(): this {
    this.query.whenMatched = { delete: true }
    return this
  }

  /**
   * Specifies the WHEN NOT MATCHED INSERT clause.
   * @param data - Data to insert when not matched
   * @returns This builder instance for method chaining
   */
  whenNotMatchedInsert(data: Record<string, unknown>): this {
    this.query.whenNotMatched = { insert: data }
    return this
  }

  /**
   * Specifies columns to return after merge operation.
   * @param columns - Columns to return
   * @returns This builder instance for method chaining
   */
  returning(...columns: string[]): this {
    this.query.returning = columns
    return this
  }

  /**
   * Builds the final SQL query and parameters.
   * @returns Object containing SQL string and parameters
   * @throws {Error} When query validation fails
   */
  protected buildQuery(): QueryStatement {
    QueryValidator.validateMergeQuery(this.query)
    const dialect: Base = this.connectionManager.getDialect()
    return dialect.buildMergeQuery(this.query)
  }

  /**
   * Converts the query to SQL string.
   * @returns SQL query string
   */
  override toSQL(): string {
    return this.buildQuery().sql
  }

  /**
   * Converts the query to parameters array.
   * @returns Array of query parameters
   */
  override toParams(): unknown[] {
    return this.buildQuery().params
  }
}
