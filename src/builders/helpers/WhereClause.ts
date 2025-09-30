import type { QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'

/**
 * Utility class for WHERE clause operations.
 * @description Provides helper methods for creating WHERE condition objects.
 */
export class WhereClauseHelper {
  /**
   * Creates a WHERE condition object from the provided parameters.
   * @param columnOrCondition - Column name or condition object
   * @param operatorOrValue - Operator or value
   * @param value - Value (if operator is provided)
   * @returns WHERE condition object
   */
  static createWhereCondition(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): QueryWhereCondition {
    if (typeof columnOrCondition === 'string') {
      if (typeof operatorOrValue === 'string') {
        if (operatorOrValue === 'BETWEEN' && value !== undefined) {
          return {
            column: columnOrCondition,
            operator: operatorOrValue,
            value: Array.isArray(value) ? value : [value, value]
          }
        }
        return {
          column: columnOrCondition,
          operator: operatorOrValue,
          value: value ?? null
        }
      } else {
        return {
          column: columnOrCondition,
          operator: '=',
          value: operatorOrValue
        }
      }
    } else {
      return columnOrCondition
    }
  }

  /**
   * Creates an AND WHERE condition object from the provided parameters.
   * @param columnOrCondition - Column name or condition object
   * @param operatorOrValue - Operator or value
   * @param value - Value (if operator is provided)
   * @returns WHERE condition object with AND logical operator
   */
  static createAndWhereCondition(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): QueryWhereCondition {
    const condition: QueryWhereCondition = this.createWhereCondition(
      columnOrCondition,
      operatorOrValue,
      value
    )
    condition.logical = 'AND'
    return condition
  }

  /**
   * Creates an OR WHERE condition object from the provided parameters.
   * @param columnOrCondition - Column name or condition object
   * @param operatorOrValue - Operator or value
   * @param value - Value (if operator is provided)
   * @returns WHERE condition object with OR logical operator
   */
  static createOrWhereCondition(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): QueryWhereCondition {
    const condition: QueryWhereCondition = this.createWhereCondition(
      columnOrCondition,
      operatorOrValue,
      value
    )
    condition.logical = 'OR'
    return condition
  }
}
