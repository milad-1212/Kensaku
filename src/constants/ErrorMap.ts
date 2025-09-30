import type { ErrorMap } from '@interfaces/index'

/**
 * Centralized error messages for Kensaku query builder.
 */
export const errorMessages: ErrorMap = {
  VALIDATION: {
    EMPTY_COLUMN: 'Column name cannot be empty or null',
    EMPTY_RAW_SQL: 'Raw SQL cannot be empty or null',
    EMPTY_TABLE: 'Table name cannot be empty',
    EMPTY_SUBQUERY: 'Subquery cannot be empty',
    INVALID_PERCENTILE: 'Percentile value must be a number between 0 and 1',
    INVALID_ORDER_DIRECTION: 'Order direction must be ASC or DESC',
    INVALID_IDENTIFIER: 'Invalid identifier',
    INVALID_FUNCTION_PARAMETER: 'Invalid function parameter',
    INVALID_COLUMN_ALIAS: 'Invalid column alias',
    INVALID_COLUMN_ALIAS_FORMAT: 'Invalid column alias format',
    INVALID_COLUMN_NAME: 'Invalid column name',
    INVALID_OPERATOR: 'Unsupported operator',
    INVALID_DATABASE_TYPE: 'Unsupported database type',
    INVALID_DATABASE: 'Unsupported database'
  },
  QUERY: {
    SELECT_MISSING_FROM: 'SELECT query must have a FROM clause',
    INSERT_MISSING_INTO: 'INSERT query must have an INTO clause',
    INSERT_MISSING_VALUES: 'INSERT query must have values',
    INSERT_NO_VALUES: 'No values provided for INSERT query',
    INSERT_SINGLE_ROW_VALUES: 'Expected single row values for single VALUES clause',
    INSERT_BATCH_VALUES: 'Expected array of values for batch VALUES clause',
    UPDATE_MISSING_TABLE: 'UPDATE query must have a table',
    UPDATE_MISSING_SET: 'UPDATE query must have a SET clause',
    DELETE_MISSING_FROM: 'DELETE query must have a FROM clause',
    DELETE_MISSING_WHERE: 'DELETE query must have a WHERE clause for safety',
    CONFLICT_EMPTY_TARGET: 'ON CONFLICT target cannot be empty',
    CONFLICT_UPDATE_REQUIRED: 'ON CONFLICT DO UPDATE requires update data',
    MERGE_MISSING_INTO: 'MERGE query must have an INTO clause',
    MERGE_MISSING_USING: 'MERGE query must have a USING clause',
    MERGE_MISSING_ON: 'MERGE query must have ON conditions',
    MERGE_MISSING_WHEN: 'MERGE query must have WHEN MATCHED or WHEN NOT MATCHED clause',
    MERGE_INSERT_DATA_REQUIRED: 'Insert data is required for WHEN NOT MATCHED',
    MERGE_NOT_SUPPORTED:
      'MERGE queries are not supported in this dialect. Use dialect-specific alternatives',
    PIVOT_MISSING_COLUMN: 'PIVOT clause must have a column',
    PIVOT_MISSING_VALUES: 'PIVOT clause must have values',
    PIVOT_MISSING_AGGREGATE: 'PIVOT clause must have an aggregate function',
    UNPIVOT_MISSING_COLUMNS: 'UNPIVOT clause must have columns',
    UNPIVOT_MISSING_VALUE_COLUMN: 'UNPIVOT clause must have a value column name',
    UNPIVOT_MISSING_NAME_COLUMN: 'UNPIVOT clause must have a name column name',
    ORDINALITY_MISSING_VALUE_COLUMN: 'WITH ORDINALITY must have a value column name',
    ORDINALITY_MISSING_ORDINALITY_COLUMN: 'WITH ORDINALITY must have an ordinality column name',
    PIVOT_NOT_SUPPORTED:
      'PIVOT operations are not supported in this dialect. Use CASE statements instead.',
    UNPIVOT_NOT_SUPPORTED:
      'UNPIVOT operations are not supported in this dialect. Use UNION ALL with CASE statements instead.',
    ORDINALITY_NOT_SUPPORTED:
      'WITH ORDINALITY is not supported in this dialect. Use ROW_NUMBER() window function instead.'
  },
  WHERE: {
    INVALID_RAW_CONDITION: 'RAW WHERE condition must have a valid SQL string',
    INVALID_COLUMN_NAME: 'WHERE condition must have a valid column name',
    INVALID_OPERATOR: 'WHERE condition must have an operator',
    INVALID_VALUE: 'WHERE condition must have a value',
    COLUMN_NAMES_MUST_BE_STRINGS: 'Column names must be strings'
  },
  JOIN: {
    MISSING_TABLE: 'JOIN must have a table',
    MISSING_ON_CONDITIONS: 'JOIN must have ON conditions'
  },

  AGGREGATION: {
    PERCENTILE_REQUIRED: 'Percentile function requires a percentile value'
  },
  CONDITIONAL: {
    EMPTY_CASE_EXPRESSION: 'CASE expression cannot be empty',
    INVALID_CASE_WHEN: 'CASE WHEN condition cannot be empty',
    INVALID_CASE_THEN: 'CASE THEN value cannot be empty',
    COALESCE_REQUIRES_COLUMNS: 'COALESCE requires at least one column',
    NULLIF_REQUIRES_TWO_COLUMNS: 'NULLIF requires exactly two columns'
  },
  WINDOW: {
    INVALID_FRAME_TYPE: 'Invalid window frame type',
    INVALID_FRAME_BOUNDS: 'Invalid window frame bounds',
    NTILE_REQUIRES_POSITIVE: 'NTILE requires positive number of buckets'
  },
  SET_OPERATIONS: {
    INTERSECT_REQUIRES_QUERY: 'INTERSECT requires a query',
    EXCEPT_REQUIRES_QUERY: 'EXCEPT requires a query'
  },
  VALID_OPERATORS: [
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
    'GLOB',
    'RAW'
  ].join(', ')
} as const

/**
 * Helper function to get error message with operator validation.
 * @param operator - The invalid operator that was provided
 * @returns Formatted error message string
 */
export function getInvalidOperatorError(operator: string): string {
  return `${errorMessages.VALIDATION.INVALID_OPERATOR}: ${operator}. Valid operators are: ${errorMessages.VALID_OPERATORS}`
}

/**
 * Helper function to get error message with database type validation.
 * @param type - The invalid database type that was provided
 * @returns Formatted error message string
 */
export function getInvalidDatabaseTypeError(type: string): string {
  return `${errorMessages.VALIDATION.INVALID_DATABASE_TYPE}: ${type}`
}

/**
 * Helper function to get error message with database validation.
 * @param name - The invalid database name that was provided
 * @returns Formatted error message string
 */
export function getInvalidDatabaseError(name: string): string {
  return `${errorMessages.VALIDATION.INVALID_DATABASE}: ${name}`
}

/**
 * Helper function to get error message with identifier validation.
 * @param identifier - The invalid identifier that was provided
 * @returns Formatted error message string
 */
export function getInvalidIdentifierError(identifier: string): string {
  return `${errorMessages.VALIDATION.INVALID_IDENTIFIER}: ${identifier}`
}

/**
 * Helper function to get error message with function parameter validation.
 * @param parameter - The invalid function parameter that was provided
 * @returns Formatted error message string
 */
export function getInvalidFunctionParameterError(parameter: string): string {
  return `${errorMessages.VALIDATION.INVALID_FUNCTION_PARAMETER}: ${parameter}`
}

/**
 * Helper function to get error message with column alias validation.
 * @param alias - The invalid column alias that was provided
 * @returns Formatted error message string
 */
export function getInvalidColumnAliasError(alias: string): string {
  return `${errorMessages.VALIDATION.INVALID_COLUMN_ALIAS}: ${alias}`
}

/**
 * Helper function to get error message with column alias format validation.
 * @param alias - The invalid column alias format that was provided
 * @returns Formatted error message string
 */
export function getInvalidColumnAliasFormatError(alias: string): string {
  return `${errorMessages.VALIDATION.INVALID_COLUMN_ALIAS_FORMAT}: ${alias}`
}

/**
 * Helper function to get error message with column name validation.
 * @param column - The invalid column name that was provided
 * @returns Formatted error message string
 */
export function getInvalidColumnNameError(column: string): string {
  return `${errorMessages.VALIDATION.INVALID_COLUMN_NAME}: ${column}`
}
