/**
 * Centralized error messages for Kensaku query builder.
 */
export const errorMessages: {
  VALIDATION: {
    EMPTY_COLUMN: string
    EMPTY_RAW_SQL: string
    EMPTY_TABLE: string
    EMPTY_SUBQUERY: string
    INVALID_PERCENTILE: string
    INVALID_ORDER_DIRECTION: string
    INVALID_IDENTIFIER: string
    INVALID_FUNCTION_PARAMETER: string
    INVALID_COLUMN_ALIAS: string
    INVALID_COLUMN_ALIAS_FORMAT: string
    INVALID_COLUMN_NAME: string
    INVALID_OPERATOR: string
    INVALID_DATABASE_TYPE: string
    INVALID_DATABASE: string
  }
  QUERY: {
    SELECT_MISSING_FROM: string
    INSERT_MISSING_INTO: string
    INSERT_MISSING_VALUES: string
    INSERT_NO_VALUES: string
    INSERT_SINGLE_ROW_VALUES: string
    INSERT_BATCH_VALUES: string
    UPDATE_MISSING_TABLE: string
    UPDATE_MISSING_SET: string
    DELETE_MISSING_FROM: string
    DELETE_MISSING_WHERE: string
  }
  WHERE: {
    INVALID_RAW_CONDITION: string
    INVALID_COLUMN_NAME: string
    INVALID_OPERATOR: string
    INVALID_VALUE: string
    COLUMN_NAMES_MUST_BE_STRINGS: string
  }
  JOIN: {
    MISSING_TABLE: string
    MISSING_ON_CONDITIONS: string
  }
  AGGREGATION: {
    PERCENTILE_REQUIRED: string
  }
  VALID_OPERATORS: string
} = {
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
    DELETE_MISSING_WHERE: 'DELETE query must have a WHERE clause for safety'
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
