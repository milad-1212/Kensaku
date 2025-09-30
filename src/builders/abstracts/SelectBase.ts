import type { QuerySelect, QuerySubQuery } from '@interfaces/index'
import { BaseQueryBuilder } from '@builders/Query'
import { SelectMixin } from '@builders/mixins/index'
import { Base } from '@core/dialects/index'
import { QueryValidator } from '@core/security/index'

/**
 * Base abstract class for SELECT query building.
 * @description Provides core SELECT functionality including column selection, FROM clause, and basic query building.
 * @template T - Return type of query results
 */
export abstract class SelectBaseBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the SELECT query structure */
  protected readonly query: QuerySelect = {}

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
  from(table: string | QuerySubQuery | SelectBaseBuilder): this {
    if (table instanceof SelectBaseBuilder) {
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
}
