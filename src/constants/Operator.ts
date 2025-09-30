import type { QueryComparisonOperator } from '@interfaces/index'

/**
 * Valid operators for the query comparison.
 */
export const validOperators: QueryComparisonOperator[] = [
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
  'NOT EXISTS',
  'IS DISTINCT FROM',
  'SIMILAR TO',
  'REGEXP',
  'RLIKE',
  'GLOB'
]
