import type { QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'

/**
 * Utility class for building WHERE conditions into SQL strings.
 * @description Provides helper methods for converting WHERE condition objects to SQL.
 */
export class WhereConditionHelpers {
  /**
   * Builds WHERE conditions into SQL string.
   * @param conditions - Array of WHERE conditions
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @param addParam - Function to add parameters and get placeholder
   * @param isColumnReference - Optional function to check if value is a column reference
   * @returns SQL string for WHERE conditions
   */
  static buildWhereConditions(
    conditions: QueryWhereCondition[],
    escapeIdentifier: (identifier: string) => string,
    addParam: (value: unknown) => string,
    isColumnReference?: (value: unknown) => boolean
  ): string {
    return conditions
      .map((condition: QueryWhereCondition, index: number) => {
        const column: string = escapeIdentifier(condition.column)
        const { operator }: { operator: QueryComparisonOperator } = condition
        const value: string =
          isColumnReference?.(condition.value) === true
            ? escapeIdentifier(condition.value as string)
            : addParam(condition.value)
        const logical: string = condition.logical ?? 'AND'
        if (index === 0) {
          return `${column} ${operator} ${value}`
        }
        return `${logical} ${column} ${operator} ${value}`
      })
      .join(' ')
  }
}
