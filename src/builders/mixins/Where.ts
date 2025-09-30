import type { QuerySelect, QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'
import { WhereClauseHelper } from '@builders/helpers/index'
import { getInvalidOperatorError, validOperators } from '@constants/index'

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
   * Adds a raw SQL WHERE condition to the query.
   * @param query - Query object to modify
   * @param sql - Raw SQL condition
   * @param params - Optional parameters for the SQL
   */
  static addRawWhereCondition(query: QuerySelect, sql: string, params?: unknown[]): void {
    query.where ??= []
    query.where.push({
      column: sql,
      operator: 'RAW',
      value: params ?? []
    })
  }

  /**
   * Adds a raw SQL AND WHERE condition to the query.
   * @param query - Query object to modify
   * @param sql - Raw SQL condition
   * @param params - Optional parameters for the SQL
   */
  static addRawAndWhereCondition(query: QuerySelect, sql: string, params?: unknown[]): void {
    query.where ??= []
    query.where.push({
      column: sql,
      operator: 'RAW',
      value: params ?? [],
      logical: 'AND'
    })
  }

  /**
   * Adds a raw SQL OR WHERE condition to the query.
   * @param query - Query object to modify
   * @param sql - Raw SQL condition
   * @param params - Optional parameters for the SQL
   */
  static addRawOrWhereCondition(query: QuerySelect, sql: string, params?: unknown[]): void {
    query.where ??= []
    query.where.push({
      column: sql,
      operator: 'RAW',
      value: params ?? [],
      logical: 'OR'
    })
  }

  /**
   * Validates that the operator is supported.
   * @param operator - Operator to validate
   * @throws {Error} If operator is not supported
   */
  static validateOperator(operator: string): void {
    if (!validOperators.includes(operator as QueryComparisonOperator)) {
      throw new Error(getInvalidOperatorError(operator))
    }
  }
}
