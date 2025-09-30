import { QueryBuilders } from '@core/dialects/builders/Query'
import type {
  QuerySelect,
  QueryAggregationExpression,
  QueryWindowFunction,
  QueryConditionalExpression,
  QueryWhereCondition
} from '@interfaces/index'

describe('QueryBuilders', () => {
  let mockEscapeFn: jest.Mock
  let mockParts: string[]

  beforeEach(() => {
    mockEscapeFn = jest.fn().mockImplementation((name: string) => `"${name}"`)
    mockParts = []
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('buildSelectClause', () => {
    it('should build basic SELECT clause', () => {
      const query: QuerySelect = {
        columns: ['id', 'name', 'email']
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '"id", "name", "email"'])
      expect(mockEscapeFn).toHaveBeenCalledWith('id')
      expect(mockEscapeFn).toHaveBeenCalledWith('name')
      expect(mockEscapeFn).toHaveBeenCalledWith('email')
    })

    it('should build SELECT DISTINCT clause', () => {
      const query: QuerySelect = {
        columns: ['id', 'name'],
        distinct: true
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', 'DISTINCT', '"id", "name"'])
    })

    it('should build SELECT * when no columns specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '*'])
    })

    it('should build SELECT with aggregations', () => {
      const aggregations: QueryAggregationExpression[] = [
        {
          function: 'COUNT',
          column: 'id',
          alias: 'total_count'
        },
        {
          function: 'AVG',
          column: 'score',
          distinct: true
        }
      ]

      const query: QuerySelect = {
        aggregations
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', 'COUNT("id") AS "total_count", AVG(DISTINCT "score")'])
    })

    it('should build SELECT with percentile aggregations', () => {
      const aggregations: QueryAggregationExpression[] = [
        {
          function: 'PERCENTILE_CONT',
          column: 'score',
          percentile: 0.5,
          alias: 'median_score'
        }
      ]

      const query: QuerySelect = {
        aggregations
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        'SELECT',
        'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "score") AS "median_score"'
      ])
    })

    it('should build SELECT with window functions', () => {
      const windowFunctions: QueryWindowFunction[] = [
        {
          function: 'ROW_NUMBER',
          args: [],
          over: {
            partitionBy: ['department'],
            orderBy: [{ column: 'salary', direction: 'DESC' }]
          }
        }
      ]

      const query: QuerySelect = {
        windowFunctions
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        'SELECT',
        '*, ROW_NUMBER()OVER (PARTITION BY "department" ORDER BY "salary" DESC)'
      ])
    })

    it('should build SELECT with conditional expressions', () => {
      const conditionals: QueryConditionalExpression[] = [
        {
          type: 'CASE',
          case: [
            { when: 'age > 18', then: 'adult' },
            { when: 'age <= 18', then: 'minor' }
          ],
          alias: 'age_category'
        },
        {
          type: 'COALESCE',
          columns: ['first_name', 'nickname', 'username']
        },
        {
          type: 'NULLIF',
          column1: 'value1',
          column2: 'value2'
        }
      ]

      const query: QuerySelect = {
        conditionals
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        'SELECT',
        '*, CASE WHEN age > 18 THEN adult WHEN age <= 18 THEN minor END AS "age_category", COALESCE("first_name", "nickname", "username"), NULLIF("value1", "value2")'
      ])
    })

    it('should build SELECT with mixed columns and aggregations', () => {
      const query: QuerySelect = {
        columns: ['id', 'name'],
        aggregations: [
          {
            function: 'COUNT',
            column: '*',
            alias: 'total'
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '"id", "name", COUNT("*") AS "total"'])
    })
  })

  describe('buildFromClause', () => {
    it('should build FROM clause with string table', () => {
      const query: QuerySelect = {
        from: 'users'
      }

      QueryBuilders.buildFromClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['FROM', '"users"'])
      expect(mockEscapeFn).toHaveBeenCalledWith('users')
    })

    it('should build FROM clause with subquery object', () => {
      const query: QuerySelect = {
        from: {
          alias: 'user_stats'
        }
      }

      QueryBuilders.buildFromClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['FROM', '"user_stats"'])
      expect(mockEscapeFn).toHaveBeenCalledWith('user_stats')
    })

    it('should not build FROM clause when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildFromClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })
  })

  describe('buildJoinClauses', () => {
    it('should build JOIN clauses', () => {
      const query: QuerySelect = {
        joins: [
          {
            type: 'INNER',
            table: 'profiles',
            on: [
              {
                column: 'users.id',
                operator: '=',
                value: 'profiles.user_id'
              }
            ]
          },
          {
            type: 'LEFT',
            table: 'departments',
            on: [
              {
                column: 'users.department_id',
                operator: '=',
                value: 'departments.id'
              }
            ]
          }
        ]
      }

      QueryBuilders.buildJoinClauses(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        'INNER',
        'JOIN',
        '"profiles"',
        'ON',
        '"users.id" = "profiles.user_id"',
        'LEFT',
        'JOIN',
        '"departments"',
        'ON',
        '"users.department_id" = "departments.id"'
      ])
    })

    it('should build JOIN with subquery table', () => {
      const query: QuerySelect = {
        joins: [
          {
            type: 'INNER',
            table: {
              alias: 'user_stats'
            },
            on: [
              {
                column: 'users.id',
                operator: '=',
                value: 'user_stats.user_id'
              }
            ]
          }
        ]
      }

      QueryBuilders.buildJoinClauses(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        'INNER',
        'JOIN',
        '"user_stats"',
        'ON',
        '"users.id" = "user_stats.user_id"'
      ])
    })

    it('should not build JOIN clauses when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildJoinClauses(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })
  })

  describe('buildJoinConditions', () => {
    it('should build single JOIN condition', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'users.id',
          operator: '=',
          value: 'profiles.user_id'
        }
      ]

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('"users.id" = "profiles.user_id"')
      expect(mockEscapeFn).toHaveBeenCalledWith('users.id')
      expect(mockEscapeFn).toHaveBeenCalledWith('profiles.user_id')
    })

    it('should build multiple JOIN conditions with AND', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'users.id',
          operator: '=',
          value: 'profiles.user_id'
        },
        {
          column: 'users.status',
          operator: '=',
          value: 'active'
        }
      ]

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('"users.id" = "profiles.user_id" AND "users.status" = "active"')
    })

    it('should build multiple JOIN conditions with OR', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'users.id',
          operator: '=',
          value: 'profiles.user_id'
        },
        {
          column: 'users.status',
          operator: '=',
          value: 'active',
          logical: 'OR'
        }
      ]

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('"users.id" = "profiles.user_id" OR "users.status" = "active"')
    })

    it('should handle non-column values without escaping', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'users.age',
          operator: '>',
          value: 18
        }
      ]

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('"users.age" > 18')
      expect(mockEscapeFn).toHaveBeenCalledWith('users.age')
      expect(mockEscapeFn).not.toHaveBeenCalledWith(18)
    })

    it('should handle empty conditions array', () => {
      const conditions: QueryWhereCondition[] = []

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('')
      expect(mockEscapeFn).not.toHaveBeenCalled()
    })
  })

  describe('buildWhereClause', () => {
    let mockBuildWhereConditionsFn: jest.Mock
    let mockParams: unknown[]

    beforeEach(() => {
      mockBuildWhereConditionsFn = jest.fn().mockReturnValue('"status" = ?')
      mockParams = []
    })

    it('should build WHERE clause', () => {
      const query: QuerySelect = {
        where: [
          {
            column: 'status',
            operator: '=',
            value: 'active'
          }
        ]
      }

      QueryBuilders.buildWhereClause(query, mockParts, mockParams, mockBuildWhereConditionsFn)

      expect(mockParts).toEqual(['WHERE', '"status" = ?'])
      expect(mockBuildWhereConditionsFn).toHaveBeenCalledWith(query.where, mockParams)
    })

    it('should build WHERE clause with multiple conditions', () => {
      const query: QuerySelect = {
        where: [
          {
            column: 'status',
            operator: '=',
            value: 'active'
          },
          {
            column: 'age',
            operator: '>',
            value: 18,
            logical: 'AND'
          }
        ]
      }

      mockBuildWhereConditionsFn.mockReturnValue('"status" = ? AND "age" > ?')

      QueryBuilders.buildWhereClause(query, mockParts, mockParams, mockBuildWhereConditionsFn)

      expect(mockParts).toEqual(['WHERE', '"status" = ? AND "age" > ?'])
      expect(mockBuildWhereConditionsFn).toHaveBeenCalledWith(query.where, mockParams)
    })

    it('should not build WHERE clause when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildWhereClause(query, mockParts, mockParams, mockBuildWhereConditionsFn)

      expect(mockParts).toEqual([])
      expect(mockBuildWhereConditionsFn).not.toHaveBeenCalled()
    })
  })

  describe('buildGroupByClause', () => {
    it('should build GROUP BY clause', () => {
      const query: QuerySelect = {
        groupBy: ['department', 'status']
      }

      QueryBuilders.buildGroupByClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['GROUP BY', '"department", "status"'])
      expect(mockEscapeFn).toHaveBeenCalledWith('department')
      expect(mockEscapeFn).toHaveBeenCalledWith('status')
    })

    it('should not build GROUP BY clause when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildGroupByClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })
  })

  describe('buildHavingClause', () => {
    let mockBuildWhereConditionsFn: jest.Mock
    let mockParams: unknown[]

    beforeEach(() => {
      mockBuildWhereConditionsFn = jest.fn().mockReturnValue('COUNT(*) > ?')
      mockParams = []
    })

    it('should build HAVING clause', () => {
      const query: QuerySelect = {
        having: [
          {
            column: 'COUNT(*)',
            operator: '>',
            value: 5
          }
        ]
      }

      QueryBuilders.buildHavingClause(query, mockParts, mockParams, mockBuildWhereConditionsFn)

      expect(mockParts).toEqual(['HAVING', 'COUNT(*) > ?'])
      expect(mockBuildWhereConditionsFn).toHaveBeenCalledWith(query.having, mockParams)
    })

    it('should not build HAVING clause when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildHavingClause(query, mockParts, mockParams, mockBuildWhereConditionsFn)

      expect(mockParts).toEqual([])
      expect(mockBuildWhereConditionsFn).not.toHaveBeenCalled()
    })
  })

  describe('buildOrderByClause', () => {
    it('should build ORDER BY clause', () => {
      const query: QuerySelect = {
        orderBy: [
          { column: 'name', direction: 'ASC' },
          { column: 'created_at', direction: 'DESC' }
        ]
      }

      QueryBuilders.buildOrderByClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['ORDER BY', '"name" ASC, "created_at" DESC'])
      expect(mockEscapeFn).toHaveBeenCalledWith('name')
      expect(mockEscapeFn).toHaveBeenCalledWith('created_at')
    })

    it('should not build ORDER BY clause when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildOrderByClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })
  })

  describe('buildLimitClause', () => {
    it('should build LIMIT clause', () => {
      const query: QuerySelect = {
        limit: 10
      }

      QueryBuilders.buildLimitClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['LIMIT', '10'])
    })

    it('should not build LIMIT clause when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildLimitClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })
  })

  describe('buildOffsetClause', () => {
    it('should build OFFSET clause', () => {
      const query: QuerySelect = {
        offset: 20
      }

      QueryBuilders.buildOffsetClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['OFFSET', '20'])
    })

    it('should not build OFFSET clause when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildOffsetClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })
  })

  describe('buildWindowSpec', () => {
    it('should build window specification with PARTITION BY', () => {
      const windowSpec = {
        partitionBy: ['department', 'status']
      }

      const result = QueryBuilders.buildWindowSpec(windowSpec, mockEscapeFn)

      expect(result).toBe('OVER (PARTITION BY "department", "status")')
      expect(mockEscapeFn).toHaveBeenCalledWith('department')
      expect(mockEscapeFn).toHaveBeenCalledWith('status')
    })

    it('should build window specification with ORDER BY', () => {
      const windowSpec = {
        orderBy: [
          { column: 'salary', direction: 'DESC' },
          { column: 'name', direction: 'ASC' }
        ]
      }

      const result = QueryBuilders.buildWindowSpec(windowSpec, mockEscapeFn)

      expect(result).toBe('OVER (ORDER BY "salary" DESC, "name" ASC)')
      expect(mockEscapeFn).toHaveBeenCalledWith('salary')
      expect(mockEscapeFn).toHaveBeenCalledWith('name')
    })

    it('should build window specification with both PARTITION BY and ORDER BY', () => {
      const windowSpec = {
        partitionBy: ['department'],
        orderBy: [{ column: 'salary', direction: 'DESC' }]
      }

      const result = QueryBuilders.buildWindowSpec(windowSpec, mockEscapeFn)

      expect(result).toBe('OVER (PARTITION BY "department" ORDER BY "salary" DESC)')
    })

    it('should build window specification with ROWS frame', () => {
      const windowSpec = {
        frame: {
          type: 'ROWS',
          start: { type: 'PRECEDING', value: 2 },
          end: { type: 'FOLLOWING', value: 1 }
        }
      }

      const result = QueryBuilders.buildWindowSpec(windowSpec, mockEscapeFn)

      expect(result).toBe('OVER (ROWS [object Object] AND [object Object])')
    })

    it('should build window specification with RANGE frame', () => {
      const windowSpec = {
        frame: {
          type: 'RANGE',
          start: { type: 'UNBOUNDED_PRECEDING' },
          end: { type: 'CURRENT_ROW' }
        }
      }

      const result = QueryBuilders.buildWindowSpec(windowSpec, mockEscapeFn)

      expect(result).toBe('OVER (RANGE [object Object] AND [object Object])')
    })

    it('should return empty string when no window specification', () => {
      const result = QueryBuilders.buildWindowSpec({}, mockEscapeFn)

      expect(result).toBe('OVER ()')
    })
  })

  describe('buildWindowFunctions', () => {
    it('should build window functions', () => {
      const query: QuerySelect = {
        windowFunctions: [
          {
            function: 'ROW_NUMBER',
            args: [],
            over: {
              partitionBy: ['department'],
              orderBy: [{ column: 'salary', direction: 'DESC' }]
            }
          },
          {
            function: 'LAG',
            args: ['salary', '1'],
            over: {
              partitionBy: ['department']
            }
          }
        ]
      }

      QueryBuilders.buildWindowFunctions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        ',',
        'ROW_NUMBER()OVER (PARTITION BY "department" ORDER BY "salary" DESC), LAG(salary, 1)OVER (PARTITION BY "department")'
      ])
    })

    it('should build window functions without OVER clause', () => {
      const query: QuerySelect = {
        windowFunctions: [
          {
            function: 'ROW_NUMBER',
            args: []
          }
        ]
      }

      QueryBuilders.buildWindowFunctions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([',', 'ROW_NUMBER()'])
    })

    it('should not build window functions when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildWindowFunctions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })
  })
})
