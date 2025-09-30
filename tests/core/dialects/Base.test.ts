import { Base } from '@core/dialects/Base'
import { errorMessages } from '@constants/index'

// Mock the builders
jest.mock('@core/dialects/builders', () => ({
  ClauseBuilders: {
    buildWhereConditions: jest.fn().mockReturnValue('WHERE id = ?')
  },
  ParameterBuilders: {
    addParam: jest.fn().mockReturnValue('?')
  },
  QueryBuilders: {
    buildWindowFunctions: jest.fn(),
    buildConditionalExpressions: jest.fn(),
    buildSetOperations: jest.fn(),
    buildSelectClause: jest.fn(),
    buildFromClause: jest.fn(),
    buildJoinClauses: jest.fn(),
    buildWhereClause: jest.fn(),
    buildGroupByClause: jest.fn(),
    buildHavingClause: jest.fn(),
    buildOrderByClause: jest.fn(),
    buildLimitClause: jest.fn(),
    buildOffsetClause: jest.fn()
  }
}))

// Create a concrete implementation for testing
class TestDialect extends Base {
  async createConnection(): Promise<any> {
    return Promise.resolve({})
  }

  buildSelectQuery(): any {
    return { sql: 'SELECT * FROM test', params: [] }
  }

  buildInsertQuery(): any {
    return { sql: 'INSERT INTO test VALUES (?)', params: ['value'] }
  }

  buildUpdateQuery(): any {
    return { sql: 'UPDATE test SET name = ?', params: ['value'] }
  }

  buildDeleteQuery(): any {
    return { sql: 'DELETE FROM test WHERE id = ?', params: [1] }
  }

  getDataType(type: string): string {
    return type
  }
}

describe('Base Dialect', () => {
  let dialect: TestDialect
  let mockConfig: any

  beforeEach(() => {
    mockConfig = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      username: 'user',
      password: 'pass'
    }
    dialect = new TestDialect(mockConfig)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(dialect['config']).toBe(mockConfig)
    })
  })

  describe('MAX_LIMIT', () => {
    it('should have correct max limit value', () => {
      expect(Base['MAX_LIMIT']).toBe(1000000)
    })
  })

  describe('escapeIdentifier', () => {
    it('should escape simple identifier', () => {
      const result = dialect.escapeIdentifier('users')
      expect(result).toBe('"users"')
    })

    it('should escape identifier with quotes', () => {
      const result = dialect.escapeIdentifier('user"name')
      expect(result).toBe('"user""name"')
    })

    it('should escape qualified identifier', () => {
      const result = dialect.escapeIdentifier('schema.users')
      expect(result).toBe('"schema"."users"')
    })

    it('should escape qualified identifier with quotes', () => {
      const result = dialect.escapeIdentifier('schema.user"name')
      expect(result).toBe('"schema"."user""name"')
    })
  })

  describe('escapeValue', () => {
    it('should escape null value', () => {
      const result = dialect.escapeValue(null)
      expect(result).toBe('NULL')
    })

    it('should escape undefined value', () => {
      const result = dialect.escapeValue(undefined)
      expect(result).toBe('NULL')
    })

    it('should escape string value', () => {
      const result = dialect.escapeValue('hello')
      expect(result).toBe("'hello'")
    })

    it('should escape string with quotes', () => {
      const result = dialect.escapeValue("hello'world")
      expect(result).toBe("'hello''world'")
    })

    it('should escape boolean true', () => {
      const result = dialect.escapeValue(true)
      expect(result).toBe('TRUE')
    })

    it('should escape boolean false', () => {
      const result = dialect.escapeValue(false)
      expect(result).toBe('FALSE')
    })

    it('should escape Date value', () => {
      const date = new Date('2023-01-01T00:00:00.000Z')
      const result = dialect.escapeValue(date)
      expect(result).toBe("'2023-01-01T00:00:00.000Z'")
    })

    it('should escape array value', () => {
      const result = dialect.escapeValue([1, 'hello', true])
      expect(result).toBe("ARRAY[1, 'hello', TRUE]")
    })

    it('should escape nested array value', () => {
      const result = dialect.escapeValue([1, [2, 3]])
      expect(result).toBe('ARRAY[1, ARRAY[2, 3]]')
    })

    it('should escape object value', () => {
      const result = dialect.escapeValue({ name: 'John', age: 30 })
      expect(result).toBe('\'{"name":"John","age":30}\'')
    })

    it('should escape object with quotes', () => {
      const result = dialect.escapeValue({ name: "John's" })
      expect(result).toBe('\'{"name":"John\'\'s"}\'')
    })

    it('should escape number value', () => {
      const result = dialect.escapeValue(42)
      expect(result).toBe('42')
    })

    it('should escape decimal value', () => {
      const result = dialect.escapeValue(3.14)
      expect(result).toBe('3.14')
    })
  })

  describe('getLimitSyntax', () => {
    it('should return empty string when no limit or offset', () => {
      const result = dialect.getLimitSyntax()
      expect(result).toBe('')
    })

    it('should return LIMIT only', () => {
      const result = dialect.getLimitSyntax(10)
      expect(result).toBe('LIMIT 10')
    })

    it('should return OFFSET only', () => {
      const result = dialect.getLimitSyntax(undefined, 20)
      expect(result).toBe('OFFSET 20')
    })

    it('should return both LIMIT and OFFSET', () => {
      const result = dialect.getLimitSyntax(10, 20)
      expect(result).toBe('LIMIT 10 OFFSET 20')
    })

    it('should cap limit at MAX_LIMIT', () => {
      const result = dialect.getLimitSyntax(2000000)
      expect(result).toBe('LIMIT 1000000')
    })

    it('should handle zero offset', () => {
      const result = dialect.getLimitSyntax(10, 0)
      expect(result).toBe('LIMIT 10')
    })

    it('should handle negative limit', () => {
      const result = dialect.getLimitSyntax(-5)
      expect(result).toBe('')
    })
  })

  describe('buildCTEClause', () => {
    it('should build simple CTE clause', () => {
      const query = {
        ctes: [
          {
            name: 'cte1',
            query: { columns: ['id'], from: 'users' },
            recursive: false
          }
        ]
      }
      const parts: string[] = []
      const params: unknown[] = []

      dialect.buildCTEClause(query as any, parts, params)

      expect(parts).toEqual(['WITH', '"cte1" AS (SELECT * FROM test)'])
      expect(params).toEqual([])
    })

    it('should build recursive CTE clause', () => {
      const query = {
        ctes: [
          {
            name: 'cte1',
            query: { columns: ['id'], from: 'users' },
            recursive: true
          }
        ]
      }
      const parts: string[] = []
      const params: unknown[] = []

      dialect.buildCTEClause(query as any, parts, params)

      expect(parts).toEqual(['WITH', 'RECURSIVE', '"cte1" AS (SELECT * FROM test)'])
    })

    it('should build multiple CTE clauses', () => {
      const query = {
        ctes: [
          {
            name: 'cte1',
            query: { columns: ['id'], from: 'users' },
            recursive: false
          },
          {
            name: 'cte2',
            query: { columns: ['name'], from: 'profiles' },
            recursive: false
          }
        ]
      }
      const parts: string[] = []
      const params: unknown[] = []

      dialect.buildCTEClause(query as any, parts, params)

      expect(parts).toEqual([
        'WITH',
        '"cte1" AS (SELECT * FROM test), "cte2" AS (SELECT * FROM test)'
      ])
    })

    it('should handle query without CTEs', () => {
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []

      dialect.buildCTEClause(query as any, parts, params)

      expect(parts).toEqual(['WITH', ''])
    })
  })

  describe('buildUnionClauses', () => {
    it('should build UNION clause', () => {
      const query = {
        unions: [
          {
            type: 'UNION',
            query: { columns: ['id'], from: 'users' }
          }
        ]
      }
      const parts: string[] = []
      const params: unknown[] = []

      dialect.buildUnionClauses(query as any, parts, params)

      expect(parts).toEqual(['UNION', 'SELECT * FROM test'])
      expect(params).toEqual([])
    })

    it('should build multiple union clauses', () => {
      const query = {
        unions: [
          {
            type: 'UNION',
            query: { columns: ['id'], from: 'users' }
          },
          {
            type: 'UNION ALL',
            query: { columns: ['name'], from: 'profiles' }
          }
        ]
      }
      const parts: string[] = []
      const params: unknown[] = []

      dialect.buildUnionClauses(query as any, parts, params)

      expect(parts).toEqual(['UNION', 'SELECT * FROM test', 'UNION ALL', 'SELECT * FROM test'])
    })

    it('should handle query without unions', () => {
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []

      dialect.buildUnionClauses(query as any, parts, params)

      expect(parts).toEqual([])
    })
  })

  describe('buildWindowFunctions', () => {
    it('should call QueryBuilders.buildWindowFunctions', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const escapeFn = jest.fn()

      dialect.buildWindowFunctions(query as any, parts, escapeFn)

      expect(QueryBuilders.buildWindowFunctions).toHaveBeenCalledWith(query, parts, escapeFn)
    })
  })

  describe('buildConditionalExpressions', () => {
    it('should call QueryBuilders.buildConditionalExpressions', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const escapeFn = jest.fn()

      dialect.buildConditionalExpressions(query as any, parts, escapeFn)

      expect(QueryBuilders.buildConditionalExpressions).toHaveBeenCalledWith(query, parts, escapeFn)
    })
  })

  describe('buildSetOperations', () => {
    it('should call QueryBuilders.buildSetOperations', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []
      const escapeFn = jest.fn()
      const buildSelectQueryFn = jest.fn()

      dialect.buildSetOperations(query as any, parts, params, escapeFn, buildSelectQueryFn)

      expect(QueryBuilders.buildSetOperations).toHaveBeenCalledWith(
        query,
        parts,
        params,
        escapeFn,
        buildSelectQueryFn
      )
    })
  })

  describe('buildWhereConditions', () => {
    it('should call ClauseBuilders.buildWhereConditions', () => {
      const { ClauseBuilders } = require('@core/dialects/builders')
      const conditions = [
        {
          column: 'id',
          operator: '=' as const,
          value: 1
        }
      ]
      const params: unknown[] = []

      const result = dialect['buildWhereConditions'](conditions, params)

      expect(ClauseBuilders.buildWhereConditions).toHaveBeenCalledTimes(1)
      expect(ClauseBuilders.buildWhereConditions).toHaveBeenCalledWith(
        conditions,
        params,
        expect.any(Function),
        expect.any(Function)
      )
      expect(result).toBe('WHERE id = ?')
    })
  })

  describe('addParam', () => {
    it('should call ParameterBuilders.addParam', () => {
      const { ParameterBuilders } = require('@core/dialects/builders')
      const params: unknown[] = []
      const value = 'test'

      const result = dialect['addParam'](value, params)

      expect(ParameterBuilders.addParam).toHaveBeenCalledWith(value, params)
      expect(result).toBe('?')
    })
  })

  describe('unsupported operations', () => {
    it('should throw error for buildPivotClause', () => {
      expect(() => {
        dialect.buildPivotClause({} as any)
      }).toThrow(errorMessages.QUERY.PIVOT_NOT_SUPPORTED)
    })

    it('should throw error for buildUnpivotClause', () => {
      expect(() => {
        dialect.buildUnpivotClause({} as any)
      }).toThrow(errorMessages.QUERY.UNPIVOT_NOT_SUPPORTED)
    })

    it('should throw error for buildOrdinalityClause', () => {
      expect(() => {
        dialect.buildOrdinalityClause({} as any)
      }).toThrow(errorMessages.QUERY.ORDINALITY_NOT_SUPPORTED)
    })

    it('should throw error for buildJsonPathClause', () => {
      expect(() => {
        dialect.buildJsonPathClause({} as any)
      }).toThrow(errorMessages.QUERY.JSON_NOT_SUPPORTED)
    })

    it('should throw error for buildJsonFunctionClause', () => {
      expect(() => {
        dialect.buildJsonFunctionClause({} as any)
      }).toThrow(errorMessages.QUERY.JSON_NOT_SUPPORTED)
    })

    it('should throw error for buildArrayOperationClause', () => {
      expect(() => {
        dialect.buildArrayOperationClause({} as any)
      }).toThrow(errorMessages.QUERY.ARRAY_NOT_SUPPORTED)
    })

    it('should throw error for buildArrayFunctionClause', () => {
      expect(() => {
        dialect.buildArrayFunctionClause({} as any)
      }).toThrow(errorMessages.QUERY.ARRAY_NOT_SUPPORTED)
    })

    it('should throw error for buildArraySliceClause', () => {
      expect(() => {
        dialect.buildArraySliceClause({} as any)
      }).toThrow(errorMessages.QUERY.ARRAY_NOT_SUPPORTED)
    })

    it('should throw error for buildMergeQuery', () => {
      expect(() => {
        dialect.buildMergeQuery({} as any)
      }).toThrow(errorMessages.QUERY.MERGE_NOT_SUPPORTED)
    })
  })

  describe('protected methods delegation', () => {
    it('should delegate buildSelectClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []

      dialect['buildSelectClause'](query as any, parts)

      expect(QueryBuilders.buildSelectClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildSelectClause).toHaveBeenCalledWith(
        query,
        parts,
        expect.any(Function)
      )
    })

    it('should delegate buildFromClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []

      dialect['buildFromClause'](query as any, parts)

      expect(QueryBuilders.buildFromClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildFromClause).toHaveBeenCalledWith(query, parts, expect.any(Function))
    })

    it('should delegate buildJoinClauses to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []

      dialect['buildJoinClauses'](query as any, parts)

      expect(QueryBuilders.buildJoinClauses).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildJoinClauses).toHaveBeenCalledWith(
        query,
        parts,
        expect.any(Function)
      )
    })

    it('should delegate buildWhereClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []

      dialect['buildWhereClause'](query as any, parts, params)

      expect(QueryBuilders.buildWhereClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildWhereClause).toHaveBeenCalledWith(
        query,
        parts,
        params,
        expect.any(Function)
      )
    })

    it('should delegate buildGroupByClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []

      dialect['buildGroupByClause'](query as any, parts)

      expect(QueryBuilders.buildGroupByClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildGroupByClause).toHaveBeenCalledWith(
        query,
        parts,
        expect.any(Function)
      )
    })

    it('should delegate buildHavingClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []

      dialect['buildHavingClause'](query as any, parts, params)

      expect(QueryBuilders.buildHavingClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildHavingClause).toHaveBeenCalledWith(
        query,
        parts,
        params,
        expect.any(Function)
      )
    })

    it('should delegate buildOrderByClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []

      dialect['buildOrderByClause'](query as any, parts, params)

      expect(QueryBuilders.buildOrderByClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildOrderByClause).toHaveBeenCalledWith(
        query,
        parts,
        expect.any(Function),
        params
      )
    })

    it('should delegate buildLimitClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []

      dialect['buildLimitClause'](query as any, parts, params)

      expect(QueryBuilders.buildLimitClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildLimitClause).toHaveBeenCalledWith(query, parts, params)
    })

    it('should delegate buildOffsetClause to QueryBuilders', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {}
      const parts: string[] = []
      const params: unknown[] = []

      dialect['buildOffsetClause'](query as any, parts, params)

      expect(QueryBuilders.buildOffsetClause).toHaveBeenCalledTimes(1)
      expect(QueryBuilders.buildOffsetClause).toHaveBeenCalledWith(query, parts, params)
    })
  })
})
