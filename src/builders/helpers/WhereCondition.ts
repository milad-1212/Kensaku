import type { QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'
import { SqlSanitizer } from '@core/security/index'

/**
 * Utility class for building WHERE conditions into SQL strings.
 * @description Provides helper methods for converting WHERE condition objects to SQL.
 */
export class WhereConditionHelper {
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
        const column: string =
          condition.operator === 'RAW' ? condition.column : escapeIdentifier(condition.column)
        const { operator }: { operator: QueryComparisonOperator } = condition
        const logical: string = condition.logical ?? 'AND'
        return this.buildSingleCondition(
          condition,
          column,
          operator,
          addParam,
          isColumnReference,
          index,
          logical,
          escapeIdentifier
        )
      })
      .join(' ')
  }

  /**
   * Builds a single WHERE condition to reduce cognitive complexity.
   * @param condition - The condition to build
   * @param column - The escaped column name
   * @param operator - The operator
   * @param addParam - Function to add parameters
   * @param isColumnReference - Function to check if value is a column reference
   * @param index - Index of the condition
   * @param logical - Logical operator (AND/OR)
   * @param escapeIdentifier - Function to escape identifiers
   * @returns SQL string for the condition
   */
  private static buildSingleCondition(
    condition: QueryWhereCondition,
    column: string,
    operator: QueryComparisonOperator,
    addParam: (value: unknown) => string,
    isColumnReference: ((value: unknown) => boolean) | undefined,
    index: number,
    logical: string,
    escapeIdentifier: (identifier: string) => string
  ): string {
    const conditionSql: string = this.buildConditionSql(
      condition,
      column,
      operator,
      addParam,
      isColumnReference,
      escapeIdentifier
    )
    if (index === 0) {
      return conditionSql
    }
    return `${logical} ${conditionSql}`
  }

  /**
   * Builds the SQL for a single condition without logical operators.
   * @param condition - The condition to build
   * @param column - The escaped column name
   * @param operator - The operator
   * @param addParam - Function to add parameters
   * @param isColumnReference - Function to check if value is a column reference
   * @param escapeIdentifier - Function to escape identifiers
   * @returns SQL string for the condition
   */
  private static buildConditionSql(
    condition: QueryWhereCondition,
    column: string,
    operator: QueryComparisonOperator,
    addParam: (value: unknown) => string,
    isColumnReference: ((value: unknown) => boolean) | undefined,
    escapeIdentifier: (identifier: string) => string
  ): string {
    if (operator === 'RAW') {
      const rawSql: string = condition.column
      const params: unknown[] = Array.isArray(condition.value) ? condition.value : []
      let processedSql: string = rawSql
      params.forEach((param: unknown) => {
        const placeholder: string = addParam(param)
        processedSql = processedSql.replace('?', placeholder)
      })
      return processedSql
    }
    if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
      return `${column} ${operator}`
    }
    if (operator === 'BETWEEN' && Array.isArray(condition.value) && condition.value.length === 2) {
      const [start, end]: [unknown, unknown] = condition.value as [unknown, unknown]
      const startParam: string = addParam(start)
      const endParam: string = addParam(end)
      return `${column} ${operator} ${startParam} AND ${endParam}`
    }
    if (['IN', 'NOT IN'].includes(operator) && Array.isArray(condition.value)) {
      const params: string = condition.value.map((val: unknown) => addParam(val)).join(', ')
      return `${column} ${operator} (${params})`
    }
    if (['LIKE', 'ILIKE', 'NOT LIKE'].includes(operator) && typeof condition.value === 'string') {
      const escapedPattern: string = SqlSanitizer.escapeLikePattern(condition.value)
      const value: string = addParam(escapedPattern)
      return `${column} ${operator} ${value}`
    }
    const value: string =
      isColumnReference?.(condition.value) === true
        ? escapeIdentifier(condition.value as string)
        : addParam(condition.value)
    return `${column} ${operator} ${value}`
  }
}
