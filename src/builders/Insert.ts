import type { QueryInsert } from '@interfaces/index'
import { ReturningClauseHelper } from '@builders/helpers/index'
import { InsertMixin } from '@builders/mixins/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'

/**
 * Query builder for INSERT operations with fluent interface.
 * @description Provides a fluent interface for building INSERT SQL queries with support for single and batch inserts with RETURNING clauses.
 * @template T - Return type of query results
 */
export class InsertBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the INSERT query structure */
  private readonly query: QueryInsert = {} as QueryInsert

  /**
   * Specifies the table to insert into.
   * @param table - Table name
   * @returns This builder instance for method chaining
   */
  into(table: string): this {
    InsertMixin.setIntoTable(this.query, table)
    return this
  }

  /**
   * Specifies the values to insert.
   * @param data - Data to insert as object or array of objects
   * @returns This builder instance for method chaining
   */
  values(data: Record<string, unknown> | Record<string, unknown>[]): this {
    InsertMixin.setValues(this.query, data)
    return this
  }

  /**
   * Specifies columns to return after insert.
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
  protected buildQuery(): { sql: string; params: unknown[] } {
    QueryValidator.validateInsertQuery(this.query)
    const parts: string[] = []
    this.params = []
    parts.push(InsertMixin.buildInsertClause(this.query, this.escapeIdentifier.bind(this)))
    parts.push(
      InsertMixin.buildValuesClause(
        this.query,
        this.escapeIdentifier.bind(this),
        this.addParam.bind(this)
      )
    )
    if (this.query.returning !== undefined && this.query.returning.length > 0) {
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
