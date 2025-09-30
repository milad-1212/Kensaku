import type {
  QuerySelect,
  QueryCaseExpression,
  QueryConditionalExpression
} from '@interfaces/index'
import { errorMessages } from '@constants/index'

/**
 * Helper class for conditional expression operations.
 * @description Provides reusable conditional expression functionality for query builders.
 */
export class ConditionalMixin {
  /**
   * Adds a CASE expression to the query.
   * @param query - Query object to modify
   * @param cases - Array of CASE expressions
   * @param elseValue - Optional ELSE value
   * @param alias - Optional alias for the expression
   */
  static addCase(
    query: QuerySelect,
    cases: QueryCaseExpression[],
    elseValue?: string | number,
    alias?: string
  ): void {
    if (cases.length === 0) {
      throw new Error(errorMessages.CONDITIONAL.EMPTY_CASE_EXPRESSION)
    }
    for (const caseExpr of cases) {
      if (caseExpr.when.trim() === '') {
        throw new Error(errorMessages.CONDITIONAL.INVALID_CASE_WHEN)
      }
      if (caseExpr.then == null) {
        throw new Error(errorMessages.CONDITIONAL.INVALID_CASE_THEN)
      }
    }
    query.conditionals ??= []
    const conditional: QueryConditionalExpression = {
      type: 'CASE',
      case: cases,
      ...elseValue !== undefined && { case: [...cases, { when: '1=1', then: elseValue }] },
      ...alias !== undefined && { alias }
    }
    query.conditionals.push(conditional)
  }

  /**
   * Adds a COALESCE expression to the query.
   * @param query - Query object to modify
   * @param columns - Array of columns to coalesce
   * @param alias - Optional alias for the expression
   */
  static addCoalesce(query: QuerySelect, columns: string[], alias?: string): void {
    if (columns.length === 0) {
      throw new Error(errorMessages.CONDITIONAL.COALESCE_REQUIRES_COLUMNS)
    }
    query.conditionals ??= []
    const conditional: QueryConditionalExpression = {
      type: 'COALESCE',
      columns,
      ...alias !== undefined && { alias }
    }
    query.conditionals.push(conditional)
  }

  /**
   * Adds a NULLIF expression to the query.
   * @param query - Query object to modify
   * @param column1 - First column
   * @param column2 - Second column
   * @param alias - Optional alias for the expression
   */
  static addNullIf(query: QuerySelect, column1: string, column2: string, alias?: string): void {
    if (column1 == null || column2 == null || column1 === '' || column2 === '') {
      throw new Error(errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS)
    }
    query.conditionals ??= []
    const conditional: QueryConditionalExpression = {
      type: 'NULLIF',
      column1,
      column2,
      ...alias !== undefined && { alias }
    }
    query.conditionals.push(conditional)
  }
}
