/**
 * Utility class for RETURNING clause operations.
 * @description Provides helper methods for building RETURNING clauses in SQL queries.
 */
export class ReturningClauseHelpers {
  /**
   * Sets the RETURNING columns for a query.
   * @param query - Query object with returning property
   * @param columns - Columns to return
   */
  static setReturningColumns(query: { returning?: string[] }, columns: string | string[]): void {
    query.returning = Array.isArray(columns) ? columns : [columns]
  }

  /**
   * Builds the RETURNING clause SQL string.
   * @param returning - Array of column names to return
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @returns SQL string for RETURNING clause
   */
  static buildReturningClause(
    returning: string[],
    escapeIdentifier: (identifier: string) => string
  ): string {
    const columns: string = returning.map((col: string) => escapeIdentifier(col)).join(', ')
    return `RETURNING ${columns}`
  }
}
