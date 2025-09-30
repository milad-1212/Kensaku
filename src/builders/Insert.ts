import type {
  QueryInsert,
  QueryStatement,
  QueryWhereCondition,
  QueryConflictAction
} from '@interfaces/index'
import { ReturningClauseHelper } from '@builders/helpers/index'
import { InsertMixin } from '@builders/mixins/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'
import { Base } from '@core/dialects/index'

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
   * Adds ON CONFLICT clause to the query.
   * @param target - Target columns or constraint name
   * @param action - Conflict action
   * @returns This builder instance for method chaining
   */
  onConflict(target: string | string[], action: QueryConflictAction = 'DO_NOTHING'): this {
    this.query.conflict = {
      target: Array.isArray(target) ? target : [target],
      action
    }
    return this
  }

  /**
   * Adds ON CONFLICT DO UPDATE clause to the query.
   * @param data - Data to update on conflict
   * @param where - Optional WHERE conditions for the update
   * @returns This builder instance for method chaining
   */
  onConflictUpdate(data: Record<string, unknown>, where?: QueryWhereCondition[]): this {
    this.query.conflict = {
      target: this.query.conflict?.target ?? [],
      action: 'DO_UPDATE',
      update: data,
      ...where !== undefined && { where }
    }
    return this
  }

  /**
   * Builds the final SQL query and parameters.
   * @returns Object containing SQL string and parameters
   * @throws {Error} When query validation fails
   */
  protected buildQuery(): QueryStatement {
    QueryValidator.validateInsertQuery(this.query)
    const dialect: Base = this.connectionManager.getDialect()
    return dialect.buildInsertQuery(this.query)
  }
}
