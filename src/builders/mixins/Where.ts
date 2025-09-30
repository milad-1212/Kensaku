import type { QuerySelect, QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'
import { WhereClauseHelper } from '@builders/helpers/index'

/**
 * Helper class for WHERE clause operations.
 * @description Provides reusable WHERE functionality for query builders.
 */
export class WhereMixin {
  /**
   * Adds a WHERE condition to the query.
   * @param query - Query object to modify
   * @param columnOrCondition - Column name or condition object
   * @param operatorOrValue - Operator or value
   * @param value - Value (if operator is provided)
   */
  static addWhereCondition(
    query: QuerySelect,
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): void {
    query.where ??= []
    if (typeof columnOrCondition === 'string' && typeof operatorOrValue === 'string') {
      this.validateOperator(operatorOrValue)
    }
    query.where.push(
      WhereClauseHelper.createWhereCondition(columnOrCondition, operatorOrValue, value)
    )
  }

  /**
   * Adds an AND WHERE condition to the query.
   * @param query - Query object to modify
   * @param columnOrCondition - Column name or condition object
   * @param operatorOrValue - Operator or value
   * @param value - Value (if operator is provided)
   */
  static addAndWhereCondition(
    query: QuerySelect,
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): void {
    query.where ??= []
    query.where.push(
      WhereClauseHelper.createAndWhereCondition(columnOrCondition, operatorOrValue, value)
    )
  }

  /**
   * Adds an OR WHERE condition to the query.
   * @param query - Query object to modify
   * @param columnOrCondition - Column name or condition object
   * @param operatorOrValue - Operator or value
   * @param value - Value (if operator is provided)
   */
  static addOrWhereCondition(
    query: QuerySelect,
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): void {
    query.where ??= []
    query.where.push(
      WhereClauseHelper.createOrWhereCondition(columnOrCondition, operatorOrValue, value)
    )
  }

  /**
   * Validates that the operator is supported.
   * @param operator - Operator to validate
   * @throws {Error} If operator is not supported
   */
  static validateOperator(operator: string): void {
    const validOperators: QueryComparisonOperator[] = [
      '=',
      '!=',
      '<>',
      '>',
      '<',
      '>=',
      '<=',
      'LIKE',
      'ILIKE',
      'NOT LIKE',
      'IN',
      'NOT IN',
      'BETWEEN',
      'NOT BETWEEN',
      'IS NULL',
      'IS NOT NULL',
      'EXISTS',
      'NOT EXISTS'
    ]
    if (!validOperators.includes(operator as QueryComparisonOperator)) {
      throw new Error(
        `Unsupported operator: ${operator}. Valid operators are: ${validOperators.join(', ')}`
      )
    }
  }
}
