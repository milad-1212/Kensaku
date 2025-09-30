import type { QuerySelect, QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'

/**
 * Mixin for HAVING clause operations.
 * @description Provides static helper methods for building HAVING clauses in SELECT queries.
 */
export class HavingMixin {
  /**
   * Adds a HAVING condition to the query.
   * @param query - Query object to modify
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   */
  static addHavingCondition(
    query: QuerySelect,
    column: string,
    operator: QueryComparisonOperator,
    value: unknown
  ): void {
    query.having ??= []
    query.having.push({
      column,
      operator,
      value
    })
  }

  /**
   * Builds the HAVING clause.
   * @param query - Query object
   * @param buildWhereConditions - Function to build WHERE conditions
   * @returns HAVING clause string or empty string
   */
  static buildHavingClause(
    query: QuerySelect,
    buildWhereConditions: (conditions: QueryWhereCondition[]) => string
  ): string {
    if (query.having != null && query.having.length > 0) {
      return `HAVING ${buildWhereConditions(query.having)}`
    }
    return ''
  }
}
