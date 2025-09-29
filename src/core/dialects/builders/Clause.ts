import type { QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'

/**
 * Complex clause building utilities for database dialects.
 * @description Provides clause builders that require dialect-specific parameter handling and escaping.
 */
export class ClauseBuilders {
  /**
   * Builds WHERE conditions into SQL string for any dialect.
   * @param conditions - Array of WHERE conditions
   * @param params - Array to store query parameters
   * @param escapeFn - Dialect-specific escape function
   * @param addParamFn - Dialect-specific parameter adder function
   * @returns SQL string for WHERE clause
   */
  static buildWhereConditions(
    conditions: QueryWhereCondition[],
    params: unknown[],
    escapeFn: (name: string) => string,
    addParamFn: (value: unknown, params: unknown[]) => string
  ): string {
    return conditions
      .map((condition: QueryWhereCondition, index: number) => {
        const column: string = escapeFn(condition.column)
        const { operator }: { operator: QueryComparisonOperator } = condition
        const value: string = addParamFn(condition.value, params)
        const logical: string = condition.logical ?? 'AND'
        if (index === 0) {
          return `${column} ${operator} ${value}`
        }
        return `${logical} ${column} ${operator} ${value}`
      })
      .join(' ')
  }
}
