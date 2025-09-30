import type { QuerySelect, QuerySubQuery, QueryStatement } from '@interfaces/index'
import { BaseQueryBuilder } from '@builders/Query'
import { SelectMixin, PivotMixin } from '@builders/mixins/index'
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
  protected buildQuery(): QueryStatement {
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
   * Adds a PIVOT operation to transform rows to columns.
   * @param column - Column to pivot on
   * @param values - Values to create columns for
   * @param aggregate - Aggregation function and column
   * @param alias - Optional alias for the pivot result
   * @returns This builder instance for method chaining
   */
  pivot(column: string, values: string[], aggregate: string, alias?: string): this {
    PivotMixin.addPivot(this.query, column, values, aggregate, alias)
    return this
  }

  /**
   * Adds an UNPIVOT operation to transform columns to rows.
   * @param columns - Columns to unpivot
   * @param valueColumn - Name of the value column in the result
   * @param nameColumn - Name of the column containing the original column names
   * @returns This builder instance for method chaining
   */
  unpivot(columns: string[], valueColumn: string, nameColumn: string): this {
    PivotMixin.addUnpivot(this.query, columns, valueColumn, nameColumn)
    return this
  }

  /**
   * Adds a WITH ORDINALITY clause for table functions.
   * @param valueColumn - Name of the value column
   * @param ordinalityColumn - Name of the ordinality column
   * @returns This builder instance for method chaining
   */
  withOrdinality(valueColumn: string, ordinalityColumn: string): this {
    PivotMixin.addOrdinality(this.query, valueColumn, ordinalityColumn)
    return this
  }
}
