import type {
  QueryJsonOperator,
  QuerySelect,
  QueryStatement,
  QuerySubQuery
} from '@interfaces/index'
import { BaseQueryBuilder } from '@builders/Query'
import {
  ArrayMixin,
  ArraySliceMixin,
  JsonMixin,
  PivotMixin,
  SelectMixin
} from '@builders/mixins/index'
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

  /**
   * Adds a JSON path operation to access JSON data.
   * @param column - Column containing JSON data
   * @param path - JSON path expression
   * @param operator - JSON path operator ('->' or '->>')
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  jsonPath(
    column: string,
    path: string,
    operator: QueryJsonOperator = '->>',
    alias?: string
  ): this {
    JsonMixin.addJsonPath(this.query, column, path, operator, alias)
    return this
  }

  /**
   * Adds a JSON extract function operation.
   * @param column - Column containing JSON data
   * @param path - JSON path expression
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  jsonExtract(column: string, path: string, alias?: string): this {
    JsonMixin.addJsonFunction(this.query, 'json_extract', column, path, undefined, alias)
    return this
  }

  /**
   * Adds a JSON set function operation.
   * @param column - Column containing JSON data
   * @param path - JSON path expression
   * @param value - Value to set
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  jsonSet(column: string, path: string, value: unknown, alias?: string): this {
    JsonMixin.addJsonFunction(this.query, 'json_set', column, path, value, alias)
    return this
  }

  /**
   * Adds a JSON remove function operation.
   * @param column - Column containing JSON data
   * @param path - JSON path expression
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  jsonRemove(column: string, path: string, alias?: string): this {
    JsonMixin.addJsonFunction(this.query, 'json_remove', column, path, undefined, alias)
    return this
  }

  /**
   * Adds a JSON validation function operation.
   * @param column - Column containing JSON data
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  jsonValid(column: string, alias?: string): this {
    JsonMixin.addJsonFunction(this.query, 'json_valid', column, '', undefined, alias)
    return this
  }

  /**
   * Adds an array contains operation.
   * @param column - Column containing array data
   * @param value - Array to check if column contains
   * @returns This builder instance for method chaining
   */
  arrayContains(column: string, value: unknown[]): this {
    ArrayMixin.addArrayOperation(this.query, column, '@>', value)
    return this
  }

  /**
   * Adds an array contained by operation.
   * @param column - Column containing array data
   * @param value - Array to check if column is contained by
   * @returns This builder instance for method chaining
   */
  arrayContainedBy(column: string, value: unknown[]): this {
    ArrayMixin.addArrayOperation(this.query, column, '<@', value)
    return this
  }

  /**
   * Adds an array overlaps operation.
   * @param column - Column containing array data
   * @param value - Array to check for overlap
   * @returns This builder instance for method chaining
   */
  arrayOverlaps(column: string, value: unknown[]): this {
    ArrayMixin.addArrayOperation(this.query, column, '&&', value)
    return this
  }

  /**
   * Adds an array concatenation operation.
   * @param column - Column containing array data
   * @param value - Array to concatenate
   * @returns This builder instance for method chaining
   */
  arrayConcat(column: string, value: unknown[]): this {
    ArrayMixin.addArrayOperation(this.query, column, '||', value)
    return this
  }

  /**
   * Adds an array aggregation function.
   * @param column - Column to aggregate
   * @param alias - Optional alias for the result
   * @param orderBy - Order by columns for aggregation
   * @returns This builder instance for method chaining
   */
  arrayAgg(column: string, alias?: string, orderBy?: string[]): this {
    ArrayMixin.addArrayFunction(this.query, 'array_agg', column, alias, orderBy)
    return this
  }

  /**
   * Adds an unnest function operation.
   * @param column - Column containing array data
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  unnest(column: string, alias?: string): this {
    ArrayMixin.addArrayFunction(this.query, 'unnest', column, alias)
    return this
  }

  /**
   * Adds an array length function operation.
   * @param column - Column containing array data
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  arrayLength(column: string, alias?: string): this {
    ArrayMixin.addArrayFunction(this.query, 'array_length', column, alias)
    return this
  }

  /**
   * Adds an array slice operation to extract a portion of an array.
   * @param column - Column containing array data
   * @param start - Start index (1-based, inclusive)
   * @param end - End index (1-based, inclusive)
   * @param alias - Optional alias for the result
   * @returns This builder instance for method chaining
   */
  arraySlice(column: string, start: number, end: number, alias?: string): this {
    ArraySliceMixin.addArraySlice(this.query, column, start, end, alias)
    return this
  }
}
