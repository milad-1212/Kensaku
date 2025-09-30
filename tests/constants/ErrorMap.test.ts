/**
 * @fileoverview Unit tests for ErrorMap constants
 * @description Tests the error message constants and helper functions
 */

import {
  errorMessages,
  getInvalidOperatorError,
  getInvalidDatabaseTypeError,
  getInvalidDatabaseError,
  getInvalidIdentifierError,
  getInvalidFunctionParameterError,
  getInvalidColumnAliasError,
  getInvalidColumnAliasFormatError,
  getInvalidColumnNameError
} from '@constants/ErrorMap'

describe('ErrorMap', () => {
  describe('errorMessages', () => {
    it('should have validation error messages', () => {
      expect(errorMessages.VALIDATION.EMPTY_COLUMN).toBe('Column name cannot be empty or null')
      expect(errorMessages.VALIDATION.EMPTY_TABLE).toBe('Table name cannot be empty')
      expect(errorMessages.VALIDATION.INVALID_OPERATOR).toBe('Unsupported operator')
      expect(errorMessages.VALIDATION.INVALID_DATABASE_TYPE).toBe('Unsupported database type')
    })

    it('should have query error messages', () => {
      expect(errorMessages.QUERY.SELECT_MISSING_FROM).toBe('SELECT query must have a FROM clause')
      expect(errorMessages.QUERY.INSERT_MISSING_INTO).toBe('INSERT query must have an INTO clause')
      expect(errorMessages.QUERY.UPDATE_MISSING_TABLE).toBe('UPDATE query must have a table')
      expect(errorMessages.QUERY.DELETE_MISSING_FROM).toBe('DELETE query must have a FROM clause')
    })

    it('should have WHERE error messages', () => {
      expect(errorMessages.WHERE.INVALID_RAW_CONDITION).toBe(
        'RAW WHERE condition must have a valid SQL string'
      )
      expect(errorMessages.WHERE.INVALID_COLUMN_NAME).toBe(
        'WHERE condition must have a valid column name'
      )
      expect(errorMessages.WHERE.INVALID_OPERATOR).toBe('WHERE condition must have an operator')
    })

    it('should have JOIN error messages', () => {
      expect(errorMessages.JOIN.MISSING_TABLE).toBe('JOIN must have a table')
      expect(errorMessages.JOIN.MISSING_ON_CONDITIONS).toBe('JOIN must have ON conditions')
    })

    it('should have aggregation error messages', () => {
      expect(errorMessages.AGGREGATION.PERCENTILE_REQUIRED).toBe(
        'Percentile function requires a percentile value'
      )
    })

    it('should have conditional error messages', () => {
      expect(errorMessages.CONDITIONAL.EMPTY_CASE_EXPRESSION).toBe(
        'CASE expression cannot be empty'
      )
      expect(errorMessages.CONDITIONAL.COALESCE_REQUIRES_COLUMNS).toBe(
        'COALESCE requires at least one column'
      )
      expect(errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS).toBe(
        'NULLIF requires exactly two columns'
      )
    })

    it('should have window error messages', () => {
      expect(errorMessages.WINDOW.INVALID_FRAME_TYPE).toBe('Invalid window frame type')
      expect(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE).toBe(
        'NTILE requires positive number of buckets'
      )
    })

    it('should have set operation error messages', () => {
      expect(errorMessages.SET_OPERATIONS.INTERSECT_REQUIRES_QUERY).toBe(
        'INTERSECT requires a query'
      )
      expect(errorMessages.SET_OPERATIONS.EXCEPT_REQUIRES_QUERY).toBe('EXCEPT requires a query')
    })

    it('should have valid operators list', () => {
      expect(errorMessages.VALID_OPERATORS).toContain('=')
      expect(errorMessages.VALID_OPERATORS).toContain('!=')
      expect(errorMessages.VALID_OPERATORS).toContain('LIKE')
      expect(errorMessages.VALID_OPERATORS).toContain('IN')
      expect(errorMessages.VALID_OPERATORS).toContain('BETWEEN')
      expect(errorMessages.VALID_OPERATORS).toContain('IS NULL')
    })
  })

  describe('getInvalidOperatorError', () => {
    it('should return formatted operator error message', () => {
      const result = getInvalidOperatorError('INVALID_OP')
      expect(result).toContain('Unsupported operator: INVALID_OP')
      expect(result).toContain('Valid operators are:')
      expect(result).toContain('=')
    })
  })

  describe('getInvalidDatabaseTypeError', () => {
    it('should return formatted database type error message', () => {
      const result = getInvalidDatabaseTypeError('invalid_db')
      expect(result).toBe('Unsupported database type: invalid_db')
    })
  })

  describe('getInvalidDatabaseError', () => {
    it('should return formatted database error message', () => {
      const result = getInvalidDatabaseError('invalid_db')
      expect(result).toBe('Unsupported database: invalid_db')
    })
  })

  describe('getInvalidIdentifierError', () => {
    it('should return formatted identifier error message', () => {
      const result = getInvalidIdentifierError('invalid_id')
      expect(result).toBe('Invalid identifier: invalid_id')
    })
  })

  describe('getInvalidFunctionParameterError', () => {
    it('should return formatted function parameter error message', () => {
      const result = getInvalidFunctionParameterError('invalid_param')
      expect(result).toBe('Invalid function parameter: invalid_param')
    })
  })

  describe('getInvalidColumnAliasError', () => {
    it('should return formatted column alias error message', () => {
      const result = getInvalidColumnAliasError('invalid_alias')
      expect(result).toBe('Invalid column alias: invalid_alias')
    })
  })

  describe('getInvalidColumnAliasFormatError', () => {
    it('should return formatted column alias format error message', () => {
      const result = getInvalidColumnAliasFormatError('invalid_format')
      expect(result).toBe('Invalid column alias format: invalid_format')
    })
  })

  describe('getInvalidColumnNameError', () => {
    it('should return formatted column name error message', () => {
      const result = getInvalidColumnNameError('invalid_column')
      expect(result).toBe('Invalid column name: invalid_column')
    })
  })
})
