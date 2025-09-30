import type { QuerySelect } from '@interfaces/index'

/**
 * Mixin for PIVOT, UNPIVOT, and WITH ORDINALITY operations.
 * @description Provides reusable functionality for data transformation operations.
 */
export class PivotMixin {
  /**
   * Adds a PIVOT clause to the query.
   * @param query - SELECT query object
   * @param column - Column to pivot on
   * @param values - Values to create columns for
   * @param aggregate - Aggregation function and column
   * @param alias - Optional alias for the pivot result
   */
  static addPivot(
    query: QuerySelect,
    column: string,
    values: string[],
    aggregate: string,
    alias?: string
  ): void {
    query.pivot = {
      column,
      values,
      aggregate,
      ...alias !== undefined && { alias }
    }
  }

  /**
   * Adds an UNPIVOT clause to the query.
   * @param query - SELECT query object
   * @param columns - Columns to unpivot
   * @param valueColumn - Name of the value column in the result
   * @param nameColumn - Name of the column containing the original column names
   */
  static addUnpivot(
    query: QuerySelect,
    columns: string[],
    valueColumn: string,
    nameColumn: string
  ): void {
    query.unpivot = {
      columns,
      valueColumn,
      nameColumn
    }
  }

  /**
   * Adds a WITH ORDINALITY clause to the query.
   * @param query - SELECT query object
   * @param valueColumn - Name of the value column
   * @param ordinalityColumn - Name of the ordinality column
   */
  static addOrdinality(query: QuerySelect, valueColumn: string, ordinalityColumn: string): void {
    query.ordinality = {
      valueColumn,
      ordinalityColumn
    }
  }
}
