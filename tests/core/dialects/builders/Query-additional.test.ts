import { QueryBuilders } from '@core/dialects/builders/Query'
import type {
  QuerySelect,
  QueryConditionalExpression,
  QueryWhereCondition,
  QueryStatement
} from '@interfaces/index'

describe('QueryBuilders Additional Tests', () => {
  let mockEscapeFn: jest.Mock
  let mockParts: string[]

  beforeEach(() => {
    mockEscapeFn = jest.fn().mockImplementation((name: string) => `"${name}"`)
    mockParts = []
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('buildConditionalExpressions', () => {
    it('should build CASE expressions', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'CASE',
            case: [
              { when: 'age > 18', then: 'adult' },
              { when: 'age <= 18', then: 'minor' }
            ],
            alias: 'age_category'
          }
        ]
      }

      QueryBuilders.buildConditionalExpressions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        ',',
        'CASE WHEN age > 18 THEN adult WHEN age <= 18 THEN minor END AS "age_category"'
      ])
    })

    it('should build COALESCE expressions', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'COALESCE',
            columns: ['first_name', 'nickname', 'username'],
            alias: 'display_name'
          }
        ]
      }

      QueryBuilders.buildConditionalExpressions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        ',',
        'COALESCE("first_name", "nickname", "username") AS "display_name"'
      ])
    })

    it('should build NULLIF expressions', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'NULLIF',
            column1: 'value1',
            column2: 'value2',
            alias: 'clean_value'
          }
        ]
      }

      QueryBuilders.buildConditionalExpressions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([',', 'NULLIF("value1", "value2") AS "clean_value"'])
    })

    it('should build mixed conditional expressions', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'CASE',
            case: [{ when: 'status = "active"', then: 1 }],
            alias: 'is_active'
          },
          {
            type: 'COALESCE',
            columns: ['email', 'backup_email']
          },
          {
            type: 'NULLIF',
            column1: 'col1',
            column2: 'col2'
          }
        ]
      }

      QueryBuilders.buildConditionalExpressions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        ',',
        'CASE WHEN status = "active" THEN 1 END AS "is_active", COALESCE("email", "backup_email"), NULLIF("col1", "col2")'
      ])
    })

    it('should not build conditional expressions when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildConditionalExpressions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([])
    })

    it('should handle NULLIF with null columns', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'NULLIF',
            column1: null as any,
            column2: null as any
          }
        ]
      }

      QueryBuilders.buildConditionalExpressions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([',', 'NULLIF("", "")'])
    })

    it('should handle COALESCE with empty columns', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'COALESCE',
            columns: []
          }
        ]
      }

      QueryBuilders.buildConditionalExpressions(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([',', 'COALESCE()'])
    })
  })

  describe('buildSetOperations', () => {
    let mockBuildSelectQueryFn: jest.Mock
    let mockParams: unknown[]

    beforeEach(() => {
      mockBuildSelectQueryFn = jest.fn().mockReturnValue({
        sql: 'SELECT * FROM users',
        params: ['param1', 'param2']
      })
      mockParams = []
    })

    it('should build UNION operations', () => {
      const query: QuerySelect = {
        unions: [
          {
            type: 'UNION',
            query: {
              columns: ['id', 'name'],
              from: 'users'
            }
          },
          {
            type: 'UNION ALL',
            query: {
              columns: ['id', 'name'],
              from: 'admins'
            }
          }
        ]
      }

      QueryBuilders.buildSetOperations(
        query,
        mockParts,
        mockParams,
        mockEscapeFn,
        mockBuildSelectQueryFn
      )

      expect(mockParts).toEqual([
        'UNION',
        'SELECT * FROM users',
        'UNION ALL',
        'SELECT * FROM users'
      ])
      expect(mockParams).toEqual(['param1', 'param2', 'param1', 'param2'])
      expect(mockBuildSelectQueryFn).toHaveBeenCalledTimes(2)
    })

    it('should build INTERSECT operations', () => {
      const query: QuerySelect = {
        unions: [
          {
            type: 'INTERSECT',
            query: {
              columns: ['id'],
              from: 'users'
            }
          }
        ]
      }

      QueryBuilders.buildSetOperations(
        query,
        mockParts,
        mockParams,
        mockEscapeFn,
        mockBuildSelectQueryFn
      )

      expect(mockParts).toEqual(['INTERSECT', 'SELECT * FROM users'])
      expect(mockParams).toEqual(['param1', 'param2'])
    })

    it('should build EXCEPT operations', () => {
      const query: QuerySelect = {
        unions: [
          {
            type: 'EXCEPT',
            query: {
              columns: ['id'],
              from: 'users'
            }
          }
        ]
      }

      QueryBuilders.buildSetOperations(
        query,
        mockParts,
        mockParams,
        mockEscapeFn,
        mockBuildSelectQueryFn
      )

      expect(mockParts).toEqual(['EXCEPT', 'SELECT * FROM users'])
      expect(mockParams).toEqual(['param1', 'param2'])
    })

    it('should not build set operations when not specified', () => {
      const query: QuerySelect = {}

      QueryBuilders.buildSetOperations(
        query,
        mockParts,
        mockParams,
        mockEscapeFn,
        mockBuildSelectQueryFn
      )

      expect(mockParts).toEqual([])
      expect(mockParams).toEqual([])
      expect(mockBuildSelectQueryFn).not.toHaveBeenCalled()
    })
  })

  describe('buildWindowFrame', () => {
    it('should build ROWS frame with start and end', () => {
      const frame = {
        type: 'ROWS',
        start: '2 PRECEDING',
        end: '1 FOLLOWING'
      }

      // Access private method through any cast
      const result = (QueryBuilders as any).buildWindowFrame(frame)

      expect(result).toBe('ROWS 2 PRECEDING AND 1 FOLLOWING')
    })

    it('should build RANGE frame with start only', () => {
      const frame = {
        type: 'RANGE',
        start: 'UNBOUNDED PRECEDING'
      }

      const result = (QueryBuilders as any).buildWindowFrame(frame)

      expect(result).toBe('RANGE UNBOUNDED PRECEDING')
    })

    it('should build GROUPS frame with exclude', () => {
      const frame = {
        type: 'GROUPS',
        start: '1 PRECEDING',
        end: '1 FOLLOWING',
        exclude: 'CURRENT ROW'
      }

      const result = (QueryBuilders as any).buildWindowFrame(frame)

      expect(result).toBe('GROUPS 1 PRECEDING AND 1 FOLLOWING EXCLUDE CURRENT ROW')
    })
  })

  describe('buildCaseExpression', () => {
    it('should build CASE expression with WHEN/THEN clauses', () => {
      const cases = [
        { when: 'age > 18', then: 'adult' },
        { when: 'age <= 18', then: 'minor' }
      ]

      const result = (QueryBuilders as any).buildCaseExpression(cases)

      expect(result).toBe('CASE WHEN age > 18 THEN adult WHEN age <= 18 THEN minor END')
    })

    it('should build CASE expression with ELSE clause', () => {
      const cases = [
        { when: 'status = "active"', then: 1 },
        { when: 'status = "inactive"', then: 0 },
        { when: '1=1', then: 'unknown', else: 'default' }
      ]

      const result = (QueryBuilders as any).buildCaseExpression(cases)

      expect(result).toBe(
        'CASE WHEN status = "active" THEN 1 WHEN status = "inactive" THEN 0 WHEN 1=1 THEN unknown ELSE default END'
      )
    })

    it('should build empty CASE expression', () => {
      const cases: any[] = []

      const result = (QueryBuilders as any).buildCaseExpression(cases)

      expect(result).toBe('CASE END')
    })
  })

  describe('buildLimitClause with raw expressions', () => {
    it('should build LIMIT clause with raw expression', () => {
      const query: QuerySelect = {
        limitRaw: {
          sql: 'GREATEST(?, ?)',
          params: [10, 20]
        }
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildLimitClause(query, mockParts, mockParams)

      expect(mockParts).toEqual(['LIMIT', 'GREATEST(?, ?)'])
      expect(mockParams).toEqual([10, 20])
    })

    it('should prioritize limitRaw over limit', () => {
      const query: QuerySelect = {
        limit: 10,
        limitRaw: {
          sql: '?',
          params: [5]
        }
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildLimitClause(query, mockParts, mockParams)

      expect(mockParts).toEqual(['LIMIT', '?'])
      expect(mockParams).toEqual([5])
    })

    it('should not build LIMIT clause when limit is 0', () => {
      const query: QuerySelect = {
        limit: 0
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildLimitClause(query, mockParts, mockParams)

      expect(mockParts).toEqual([])
      expect(mockParams).toEqual([])
    })
  })

  describe('buildOffsetClause with raw expressions', () => {
    it('should build OFFSET clause with raw expression', () => {
      const query: QuerySelect = {
        offsetRaw: {
          sql: '? * ?',
          params: [5, 2]
        }
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildOffsetClause(query, mockParts, mockParams)

      expect(mockParts).toEqual(['OFFSET', '? * ?'])
      expect(mockParams).toEqual([5, 2])
    })

    it('should prioritize offsetRaw over offset', () => {
      const query: QuerySelect = {
        offset: 10,
        offsetRaw: {
          sql: '?',
          params: [5]
        }
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildOffsetClause(query, mockParts, mockParams)

      expect(mockParts).toEqual(['OFFSET', '?'])
      expect(mockParams).toEqual([5])
    })

    it('should not build OFFSET clause when offset is 0', () => {
      const query: QuerySelect = {
        offset: 0
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildOffsetClause(query, mockParts, mockParams)

      expect(mockParts).toEqual([])
      expect(mockParams).toEqual([])
    })
  })

  describe('buildOrderByClause with expressions and parameters', () => {
    it('should build ORDER BY clause with expressions', () => {
      const query: QuerySelect = {
        orderBy: [
          { column: 'LENGTH(name)', direction: 'ASC', isExpression: true },
          { column: 'created_at', direction: 'DESC' }
        ]
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildOrderByClause(query, mockParts, mockEscapeFn, mockParams)

      expect(mockParts).toEqual(['ORDER BY', 'LENGTH(name) ASC, "created_at" DESC'])
      expect(mockEscapeFn).toHaveBeenCalledWith('created_at')
      expect(mockEscapeFn).not.toHaveBeenCalledWith('LENGTH(name)')
    })

    it('should build ORDER BY clause with parameters', () => {
      const query: QuerySelect = {
        orderBy: [
          {
            column: 'CASE WHEN ? THEN ? ELSE ? END',
            direction: 'ASC',
            isExpression: true,
            params: [true, 'A', 'B']
          }
        ]
      }
      const mockParams: unknown[] = []

      QueryBuilders.buildOrderByClause(query, mockParts, mockEscapeFn, mockParams)

      expect(mockParts).toEqual(['ORDER BY', 'CASE WHEN ? THEN ? ELSE ? END ASC'])
      expect(mockParams).toEqual([true, 'A', 'B'])
    })
  })

  describe('buildSelectClause edge cases', () => {
    it('should handle empty columns array', () => {
      const query: QuerySelect = {
        columns: []
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '*'])
    })

    it('should handle aggregations without alias', () => {
      const query: QuerySelect = {
        aggregations: [
          {
            function: 'COUNT',
            column: '*'
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', 'COUNT("*")'])
    })

    it('should handle PERCENTILE_DISC aggregation', () => {
      const query: QuerySelect = {
        aggregations: [
          {
            function: 'PERCENTILE_DISC',
            column: 'score',
            percentile: 0.75,
            alias: 'q3_score'
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        'SELECT',
        'PERCENTILE_DISC(0.75) WITHIN GROUP (ORDER BY "score") AS "q3_score"'
      ])
    })

    it('should handle percentile aggregation without percentile value', () => {
      const query: QuerySelect = {
        aggregations: [
          {
            function: 'PERCENTILE_CONT',
            column: 'score',
            alias: 'median_score'
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual([
        'SELECT',
        'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "score") AS "median_score"'
      ])
    })

    it('should handle window functions without args', () => {
      const query: QuerySelect = {
        windowFunctions: [
          {
            function: 'ROW_NUMBER'
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '*, ROW_NUMBER()'])
    })

    it('should handle conditional expressions with empty columns', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'COALESCE',
            columns: []
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '*, COALESCE()'])
    })

    it('should handle NULLIF with null columns', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'NULLIF',
            column1: null as any,
            column2: null as any
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '*, NULLIF("", "")'])
    })

    it('should build empty CASE expressions', () => {
      const query: QuerySelect = {
        conditionals: [
          {
            type: 'CASE',
            case: []
          }
        ]
      }

      QueryBuilders.buildSelectClause(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['SELECT', '*, CASE END'])
    })
  })

  describe('buildJoinClauses edge cases', () => {
    it('should handle JOIN without ON conditions', () => {
      const query: QuerySelect = {
        joins: [
          {
            type: 'CROSS',
            table: 'products',
            on: []
          }
        ]
      }

      QueryBuilders.buildJoinClauses(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['CROSS', 'JOIN', '"products"'])
    })

    it('should handle JOIN with null ON conditions', () => {
      const query: QuerySelect = {
        joins: [
          {
            type: 'INNER',
            table: 'products',
            on: null as any
          }
        ]
      }

      QueryBuilders.buildJoinClauses(query, mockParts, mockEscapeFn)

      expect(mockParts).toEqual(['INNER', 'JOIN', '"products"'])
    })
  })

  describe('buildJoinConditions edge cases', () => {
    it('should handle conditions with default logical operator', () => {
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
          logical: undefined
        }
      ]

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('"users.id" = "profiles.user_id" AND "users.status" = "active"')
    })

    it('should handle non-string values', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'users.age',
          operator: '>',
          value: 18
        }
      ]

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('"users.age" > 18')
    })

    it('should handle array values', () => {
      const conditions: QueryWhereCondition[] = [
        {
          column: 'users.status',
          operator: 'IN',
          value: ['active', 'pending']
        }
      ]

      const result = QueryBuilders.buildJoinConditions(conditions, mockEscapeFn)

      expect(result).toBe('"users.status" IN active,pending')
    })
  })

  describe('buildWindowSpec edge cases', () => {
    it('should build window spec with frame only', () => {
      const windowSpec = {
        frame: {
          type: 'ROWS',
          start: 'UNBOUNDED PRECEDING',
          end: 'CURRENT ROW'
        }
      }

      const result = (QueryBuilders as any).buildWindowSpec(windowSpec, mockEscapeFn)

      expect(result).toBe('OVER (ROWS UNBOUNDED PRECEDING AND CURRENT ROW)')
    })

    it('should build window spec with frame and exclude', () => {
      const windowSpec = {
        frame: {
          type: 'RANGE',
          start: '1 PRECEDING',
          end: '1 FOLLOWING',
          exclude: 'GROUP'
        }
      }

      const result = (QueryBuilders as any).buildWindowSpec(windowSpec, mockEscapeFn)

      expect(result).toBe('OVER (RANGE 1 PRECEDING AND 1 FOLLOWING EXCLUDE GROUP)')
    })
  })
})
