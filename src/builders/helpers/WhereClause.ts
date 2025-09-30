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
      return this.createStringCondition(columnOrCondition, operatorOrValue, value)
    }
    return columnOrCondition
  }

  /**
   * Creates a WHERE condition from string column.
   * @param column - Column name
   * @param operatorOrValue - Operator or value
   * @param value - Value (if operator is provided)
   * @returns WHERE condition object
   */
  private static createStringCondition(
    column: string,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): QueryWhereCondition {
    if (typeof operatorOrValue === 'string') {
      return this.createOperatorCondition(column, operatorOrValue, value)
    }
    return {
      column,
      operator: '=',
      value: operatorOrValue
    }
  }

  /**
   * Creates a WHERE condition with operator.
   * @param column - Column name
   * @param operator - Operator
   * @param value - Value
   * @returns WHERE condition object
   */
  private static createOperatorCondition(
    column: string,
    operator: QueryComparisonOperator,
    value?: unknown
  ): QueryWhereCondition {
    if (operator === 'BETWEEN' && value !== undefined) {
      return {
        column,
        operator,
        value: Array.isArray(value) ? value : [value, value]
      }
    }
    if (operator === 'RAW') {
      return {
        column,
        operator,
        value: value ?? []
      }
    }
    return {
      column,
      operator,
      value: value ?? null
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
