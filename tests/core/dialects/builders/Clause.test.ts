import { ClauseBuilders } from '@core/dialects/builders/Clause'
import type { QueryWhereCondition } from '@interfaces/index'

describe('ClauseBuilders', () => {
  let mockEscapeFn: jest.Mock
  let mockAddParamFn: jest.Mock
  let mockParams: unknown[]

  beforeEach(() => {
    mockEscapeFn = jest.fn().mockImplementation((name: string) => `"${name}"`)
    mockAddParamFn = jest.fn().mockImplementation((value: unknown, params: unknown[]) => {
      params.push(value)
      return '?'
    })
    mockParams = []
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('buildWhereConditions', () => {
    it('should build single WHERE condition', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'id',
          operator: '=',
          value: 1
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"id" = ?')
      expect(mockEscapeFn).toHaveBeenCalledWith('id')
      expect(mockAddParamFn).toHaveBeenCalledWith(1, mockParams)
      expect(mockParams).toEqual([1])
    })

    it('should build multiple WHERE conditions with AND', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'id',
          operator: '=',
          value: 1
        },
        {
          column: 'name',
          operator: 'LIKE',
          value: 'John%'
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"id" = ? AND "name" LIKE ?')
      expect(mockEscapeFn).toHaveBeenCalledWith('id')
      expect(mockEscapeFn).toHaveBeenCalledWith('name')
      expect(mockAddParamFn).toHaveBeenCalledWith(1, mockParams)
      expect(mockAddParamFn).toHaveBeenCalledWith('John%', mockParams)
      expect(mockParams).toEqual([1, 'John%'])
    })

    it('should build multiple WHERE conditions with OR', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'id',
          operator: '=',
          value: 1
        },
        {
          column: 'name',
          operator: 'LIKE',
          value: 'John%',
          logical: 'OR'
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"id" = ? OR "name" LIKE ?')
      expect(mockParams).toEqual([1, 'John%'])
    })

    it('should build WHERE conditions with different operators', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'age',
          operator: '>',
          value: 18
        },
        {
          column: 'status',
          operator: 'IN',
          value: ['active', 'pending']
        },
        {
          column: 'email',
          operator: 'IS NOT NULL',
          value: null
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"age" > ? AND "status" IN ? AND "email" IS NOT NULL ?')
      expect(mockParams).toEqual([18, ['active', 'pending'], null])
    })

    it('should handle empty conditions array', () => {
      const conditions: QueryWhereCondition[] = []

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('')
      expect(mockEscapeFn).not.toHaveBeenCalled()
      expect(mockAddParamFn).not.toHaveBeenCalled()
      expect(mockParams).toEqual([])
    })

    it('should handle complex WHERE conditions with mixed logical operators', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'id',
          operator: '=',
          value: 1
        },
        {
          column: 'name',
          operator: 'LIKE',
          value: 'John%',
          logical: 'OR'
        },
        {
          column: 'age',
          operator: '>',
          value: 18,
          logical: 'AND'
        },
        {
          column: 'status',
          operator: '=',
          value: 'active',
          logical: 'OR'
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"id" = ? OR "name" LIKE ? AND "age" > ? OR "status" = ?')
      expect(mockParams).toEqual([1, 'John%', 18, 'active'])
    })

    it('should handle WHERE conditions with special characters in column names', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'user.id',
          operator: '=',
          value: 1
        },
        {
          column: 'user-name',
          operator: 'LIKE',
          value: 'test%'
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"user.id" = ? AND "user-name" LIKE ?')
      expect(mockEscapeFn).toHaveBeenCalledWith('user.id')
      expect(mockEscapeFn).toHaveBeenCalledWith('user-name')
      expect(mockParams).toEqual([1, 'test%'])
    })

    it('should handle WHERE conditions with null values', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'deleted_at',
          operator: 'IS NULL',
          value: null
        },
        {
          column: 'updated_at',
          operator: 'IS NOT NULL',
          value: null
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"deleted_at" IS NULL ? AND "updated_at" IS NOT NULL ?')
      expect(mockParams).toEqual([null, null])
    })

    it('should handle WHERE conditions with array values', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'tags',
          operator: 'IN',
          value: ['admin', 'user', 'guest']
        },
        {
          column: 'scores',
          operator: 'BETWEEN',
          value: [80, 100]
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"tags" IN ? AND "scores" BETWEEN ?')
      expect(mockParams).toEqual([
        ['admin', 'user', 'guest'],
        [80, 100]
      ])
    })

    it('should handle WHERE conditions with object values', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'metadata',
          operator: '=',
          value: { key: 'value', nested: { data: 'test' } }
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"metadata" = ?')
      expect(mockParams).toEqual([{ key: 'value', nested: { data: 'test' } }])
    })

    it('should handle WHERE conditions with boolean values', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'is_active',
          operator: '=',
          value: true
        },
        {
          column: 'is_deleted',
          operator: '=',
          value: false
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"is_active" = ? AND "is_deleted" = ?')
      expect(mockParams).toEqual([true, false])
    })

    it('should handle WHERE conditions with date values', () => {
      const date = new Date('2023-01-01T00:00:00.000Z')
      const conditions: QueryWhereCondition[] = [
        {
          column: 'created_at',
          operator: '>=',
          value: date
        }
      ]

      const result = ClauseBuilders.buildWhereConditions(
        conditions,
        mockParams,
        mockEscapeFn,
        mockAddParamFn
      )

      expect(result).toBe('"created_at" >= ?')
      expect(mockParams).toEqual([date])
    })
  })
})
