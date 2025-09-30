import { WhereMixin } from '@builders/mixins/index'
import { getInvalidOperatorError } from '@constants/index'
import type { QuerySelect, QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'

// Mock the WhereClauseHelper
jest.mock('@builders/helpers/index', () => ({
  WhereClauseHelper: {
    createWhereCondition: jest.fn(),
    createAndWhereCondition: jest.fn(),
    createOrWhereCondition: jest.fn()
  }
}))

import { WhereClauseHelper } from '@builders/helpers/index'

const mockWhereClauseHelper = WhereClauseHelper as jest.Mocked<typeof WhereClauseHelper>

describe('WhereMixin', () => {
  let mockQuery: QuerySelect
  let mockCondition: QueryWhereCondition

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'users'
    }
    mockCondition = {
      column: 'id',
      operator: '=',
      value: 1
    }

    // Reset mocks
    jest.clearAllMocks()
    mockWhereClauseHelper.createWhereCondition.mockReturnValue(mockCondition)
    mockWhereClauseHelper.createAndWhereCondition.mockReturnValue(mockCondition)
    mockWhereClauseHelper.createOrWhereCondition.mockReturnValue(mockCondition)
  })

  describe('addWhereCondition', () => {
    it('should add where condition with string column and operator', () => {
      WhereMixin.addWhereCondition(mockQuery, 'id', '=', 1)

      expect(mockWhereClauseHelper.createWhereCondition).toHaveBeenCalledWith('id', '=', 1)
      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toBe(mockCondition)
    })

    it('should add where condition with condition object', () => {
      const condition: QueryWhereCondition = {
        column: 'name',
        operator: 'LIKE',
        value: '%John%'
      }

      WhereMixin.addWhereCondition(mockQuery, condition)

      expect(mockWhereClauseHelper.createWhereCondition).toHaveBeenCalledWith(
        condition,
        undefined,
        undefined
      )
      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toBe(mockCondition)
    })

    it('should validate operator when provided as string', () => {
      WhereMixin.addWhereCondition(mockQuery, 'id', 'IN', [1, 2, 3])

      expect(mockWhereClauseHelper.createWhereCondition).toHaveBeenCalledWith('id', 'IN', [1, 2, 3])
      expect(mockQuery.where).toHaveLength(1)
    })

    it('should initialize where array if undefined', () => {
      expect(mockQuery.where).toBeUndefined()

      WhereMixin.addWhereCondition(mockQuery, 'id', '=', 1)

      expect(mockQuery.where).toBeDefined()
      expect(mockQuery.where).toHaveLength(1)
    })

    it('should append to existing where array', () => {
      WhereMixin.addWhereCondition(mockQuery, 'id', '=', 1)
      WhereMixin.addWhereCondition(mockQuery, 'name', '=', 'John')

      expect(mockQuery.where).toHaveLength(2)
      expect(mockWhereClauseHelper.createWhereCondition).toHaveBeenCalledTimes(2)
    })

    it('should throw error for invalid operator', () => {
      expect(() => {
        WhereMixin.addWhereCondition(mockQuery, 'id', 'INVALID_OP' as QueryComparisonOperator, 1)
      }).toThrow(getInvalidOperatorError('INVALID_OP'))
    })
  })

  describe('addAndWhereCondition', () => {
    it('should add AND where condition with string column and operator', () => {
      WhereMixin.addAndWhereCondition(mockQuery, 'id', '=', 1)

      expect(mockWhereClauseHelper.createAndWhereCondition).toHaveBeenCalledWith('id', '=', 1)
      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toBe(mockCondition)
    })

    it('should add AND where condition with condition object', () => {
      const condition: QueryWhereCondition = {
        column: 'status',
        operator: '=',
        value: 'active'
      }

      WhereMixin.addAndWhereCondition(mockQuery, condition)

      expect(mockWhereClauseHelper.createAndWhereCondition).toHaveBeenCalledWith(
        condition,
        undefined,
        undefined
      )
      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toBe(mockCondition)
    })

    it('should initialize where array if undefined', () => {
      expect(mockQuery.where).toBeUndefined()

      WhereMixin.addAndWhereCondition(mockQuery, 'id', '=', 1)

      expect(mockQuery.where).toBeDefined()
      expect(mockQuery.where).toHaveLength(1)
    })

    it('should append to existing where array', () => {
      WhereMixin.addAndWhereCondition(mockQuery, 'id', '=', 1)
      WhereMixin.addAndWhereCondition(mockQuery, 'name', '=', 'John')

      expect(mockQuery.where).toHaveLength(2)
      expect(mockWhereClauseHelper.createAndWhereCondition).toHaveBeenCalledTimes(2)
    })
  })

  describe('addOrWhereCondition', () => {
    it('should add OR where condition with string column and operator', () => {
      WhereMixin.addOrWhereCondition(mockQuery, 'id', '=', 1)

      expect(mockWhereClauseHelper.createOrWhereCondition).toHaveBeenCalledWith('id', '=', 1)
      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toBe(mockCondition)
    })

    it('should add OR where condition with condition object', () => {
      const condition: QueryWhereCondition = {
        column: 'role',
        operator: 'IN',
        value: ['admin', 'user']
      }

      WhereMixin.addOrWhereCondition(mockQuery, condition)

      expect(mockWhereClauseHelper.createOrWhereCondition).toHaveBeenCalledWith(
        condition,
        undefined,
        undefined
      )
      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toBe(mockCondition)
    })

    it('should initialize where array if undefined', () => {
      expect(mockQuery.where).toBeUndefined()

      WhereMixin.addOrWhereCondition(mockQuery, 'id', '=', 1)

      expect(mockQuery.where).toBeDefined()
      expect(mockQuery.where).toHaveLength(1)
    })

    it('should append to existing where array', () => {
      WhereMixin.addOrWhereCondition(mockQuery, 'id', '=', 1)
      WhereMixin.addOrWhereCondition(mockQuery, 'name', '=', 'John')

      expect(mockQuery.where).toHaveLength(2)
      expect(mockWhereClauseHelper.createOrWhereCondition).toHaveBeenCalledTimes(2)
    })
  })

  describe('addRawWhereCondition', () => {
    it('should add raw where condition', () => {
      WhereMixin.addRawWhereCondition(mockQuery, 'id = ?', [1])

      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toEqual({
        column: 'id = ?',
        operator: 'RAW',
        value: [1]
      })
    })

    it('should add raw where condition without parameters', () => {
      WhereMixin.addRawWhereCondition(mockQuery, 'created_at > NOW()')

      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toEqual({
        column: 'created_at > NOW()',
        operator: 'RAW',
        value: []
      })
    })

    it('should initialize where array if undefined', () => {
      expect(mockQuery.where).toBeUndefined()

      WhereMixin.addRawWhereCondition(mockQuery, 'id = ?', [1])

      expect(mockQuery.where).toBeDefined()
      expect(mockQuery.where).toHaveLength(1)
    })

    it('should append to existing where array', () => {
      WhereMixin.addRawWhereCondition(mockQuery, 'id = ?', [1])
      WhereMixin.addRawWhereCondition(mockQuery, 'name = ?', ['John'])

      expect(mockQuery.where).toHaveLength(2)
      expect(mockQuery.where![0].column).toBe('id = ?')
      expect(mockQuery.where![1].column).toBe('name = ?')
    })

    it('should handle complex raw conditions', () => {
      const params = [100, 'active']
      WhereMixin.addRawWhereCondition(mockQuery, 'score > ? AND status = ?', params)

      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toEqual({
        column: 'score > ? AND status = ?',
        operator: 'RAW',
        value: params
      })
    })
  })

  describe('addRawAndWhereCondition', () => {
    it('should add raw AND where condition', () => {
      WhereMixin.addRawAndWhereCondition(mockQuery, 'id = ?', [1])

      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toEqual({
        column: 'id = ?',
        operator: 'RAW',
        value: [1],
        logical: 'AND'
      })
    })

    it('should add raw AND where condition without parameters', () => {
      WhereMixin.addRawAndWhereCondition(mockQuery, 'created_at > NOW()')

      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toEqual({
        column: 'created_at > NOW()',
        operator: 'RAW',
        value: [],
        logical: 'AND'
      })
    })

    it('should initialize where array if undefined', () => {
      expect(mockQuery.where).toBeUndefined()

      WhereMixin.addRawAndWhereCondition(mockQuery, 'id = ?', [1])

      expect(mockQuery.where).toBeDefined()
      expect(mockQuery.where).toHaveLength(1)
    })

    it('should append to existing where array', () => {
      WhereMixin.addRawAndWhereCondition(mockQuery, 'id = ?', [1])
      WhereMixin.addRawAndWhereCondition(mockQuery, 'name = ?', ['John'])

      expect(mockQuery.where).toHaveLength(2)
      expect(mockQuery.where![0].logical).toBe('AND')
      expect(mockQuery.where![1].logical).toBe('AND')
    })
  })

  describe('addRawOrWhereCondition', () => {
    it('should add raw OR where condition', () => {
      WhereMixin.addRawOrWhereCondition(mockQuery, 'id = ?', [1])

      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toEqual({
        column: 'id = ?',
        operator: 'RAW',
        value: [1],
        logical: 'OR'
      })
    })

    it('should add raw OR where condition without parameters', () => {
      WhereMixin.addRawOrWhereCondition(mockQuery, 'created_at > NOW()')

      expect(mockQuery.where).toHaveLength(1)
      expect(mockQuery.where![0]).toEqual({
        column: 'created_at > NOW()',
        operator: 'RAW',
        value: [],
        logical: 'OR'
      })
    })

    it('should initialize where array if undefined', () => {
      expect(mockQuery.where).toBeUndefined()

      WhereMixin.addRawOrWhereCondition(mockQuery, 'id = ?', [1])

      expect(mockQuery.where).toBeDefined()
      expect(mockQuery.where).toHaveLength(1)
    })

    it('should append to existing where array', () => {
      WhereMixin.addRawOrWhereCondition(mockQuery, 'id = ?', [1])
      WhereMixin.addRawOrWhereCondition(mockQuery, 'name = ?', ['John'])

      expect(mockQuery.where).toHaveLength(2)
      expect(mockQuery.where![0].logical).toBe('OR')
      expect(mockQuery.where![1].logical).toBe('OR')
    })
  })

  describe('validateOperator', () => {
    it('should not throw for valid operators', () => {
      const validOperators: QueryComparisonOperator[] = [
        '=',
        '!=',
        '<>',
        '<',
        '>',
        '<=',
        '>=',
        'LIKE',
        'NOT LIKE',
        'ILIKE',
        'IN',
        'NOT IN',
        'BETWEEN',
        'NOT BETWEEN',
        'IS NULL',
        'IS NOT NULL',
        'EXISTS',
        'NOT EXISTS'
      ]

      validOperators.forEach(operator => {
        expect(() => {
          WhereMixin.validateOperator(operator)
        }).not.toThrow()
      })
    })

    it('should throw for invalid operators', () => {
      const invalidOperators = ['INVALID', 'WRONG', 'BAD_OP', 'UNKNOWN']

      invalidOperators.forEach(operator => {
        expect(() => {
          WhereMixin.validateOperator(operator)
        }).toThrow(getInvalidOperatorError(operator))
      })
    })

    it('should throw for empty operator', () => {
      expect(() => {
        WhereMixin.validateOperator('')
      }).toThrow(getInvalidOperatorError(''))
    })

    it('should throw for null operator', () => {
      expect(() => {
        WhereMixin.validateOperator(null as any)
      }).toThrow(getInvalidOperatorError(null))
    })
  })

  describe('mixed operations', () => {
    it('should handle mixed where condition types', () => {
      WhereMixin.addWhereCondition(mockQuery, 'id', '=', 1)
      WhereMixin.addAndWhereCondition(mockQuery, 'status', '=', 'active')
      WhereMixin.addOrWhereCondition(mockQuery, 'role', 'IN', ['admin', 'user'])
      WhereMixin.addRawWhereCondition(mockQuery, 'created_at > ?', ['2023-01-01'])

      expect(mockQuery.where).toHaveLength(4)
      expect(mockWhereClauseHelper.createWhereCondition).toHaveBeenCalledTimes(1)
      expect(mockWhereClauseHelper.createAndWhereCondition).toHaveBeenCalledTimes(1)
      expect(mockWhereClauseHelper.createOrWhereCondition).toHaveBeenCalledTimes(1)
    })

    it('should handle mixed raw where conditions', () => {
      WhereMixin.addRawWhereCondition(mockQuery, 'id = ?', [1])
      WhereMixin.addRawAndWhereCondition(mockQuery, 'status = ?', ['active'])
      WhereMixin.addRawOrWhereCondition(mockQuery, 'role = ?', ['admin'])

      expect(mockQuery.where).toHaveLength(3)
      expect(mockQuery.where![0].logical).toBeUndefined()
      expect(mockQuery.where![1].logical).toBe('AND')
      expect(mockQuery.where![2].logical).toBe('OR')
    })

    it('should handle complex mixed conditions', () => {
      // Mock different return values for different calls
      const mockCondition1 = { column: 'id', operator: '=', value: 1 }
      const mockCondition2 = {
        column: 'status = ? AND active = ?',
        operator: 'RAW',
        value: ['active', true],
        logical: 'AND'
      }
      const mockCondition3 = { column: 'role', operator: 'IN', value: ['admin', 'user'] }
      const mockCondition4 = {
        column: 'created_at > NOW() - INTERVAL ? DAY',
        operator: 'RAW',
        value: [30],
        logical: 'OR'
      }

      mockWhereClauseHelper.createWhereCondition.mockReturnValueOnce(mockCondition1)
      mockWhereClauseHelper.createAndWhereCondition.mockReturnValueOnce(mockCondition2)
      mockWhereClauseHelper.createOrWhereCondition.mockReturnValueOnce(mockCondition3)

      WhereMixin.addWhereCondition(mockQuery, 'id', '=', 1)
      WhereMixin.addRawAndWhereCondition(mockQuery, 'status = ? AND active = ?', ['active', true])
      WhereMixin.addOrWhereCondition(mockQuery, 'role', 'IN', ['admin', 'user'])
      WhereMixin.addRawOrWhereCondition(mockQuery, 'created_at > NOW() - INTERVAL ? DAY', [30])

      expect(mockQuery.where).toHaveLength(4)
      expect(mockQuery.where![0].operator).toBe('=')
      expect(mockQuery.where![1].operator).toBe('RAW')
      expect(mockQuery.where![1].logical).toBe('AND')
      expect(mockQuery.where![2].operator).toBe('IN')
      expect(mockQuery.where![3].operator).toBe('RAW')
      expect(mockQuery.where![3].logical).toBe('OR')
    })
  })
})
