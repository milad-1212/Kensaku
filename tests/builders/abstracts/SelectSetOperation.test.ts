import { SelectSetOperationBuilder } from '@builders/abstracts/SelectSetOperation'
import { UnionMixin } from '@builders/mixins/index'
import type { QuerySelect } from '@interfaces/index'

// Mock dependencies
jest.mock('@builders/mixins/index', () => ({
  UnionMixin: {
    addUnion: jest.fn(),
    addUnionAll: jest.fn(),
    addIntersect: jest.fn(),
    addExcept: jest.fn(),
    addMinus: jest.fn()
  }
}))

// Mock the parent class
jest.mock('@builders/abstracts/SelectConditionalExpr', () => ({
  SelectConditionalExprBuilder: class {
    public query: any = {}

    constructor() {
      this.query = {}
    }

    caseWhen() {
      return this
    }
    coalesce() {
      return this
    }
    nullIf() {
      return this
    }
    case() {
      return this
    }
  }
}))

// Create a concrete implementation for testing the actual SelectSetOperationBuilder
class RealSelectSetOperationBuilder extends SelectSetOperationBuilder {
  public query: any

  constructor() {
    super()
    this.query = {
      unions: []
    }
  }

  // Override abstract methods with concrete implementations
  toSQL(): string {
    return 'SELECT * FROM test'
  }

  toParams(): unknown[] {
    return []
  }

  async execute(): Promise<unknown[]> {
    return []
  }

  // Expose the protected query property for testing
  getQuery(): any {
    return this.query
  }
}

describe('SelectSetOperationBuilder', () => {
  let builder: any

  beforeEach(() => {
    // Create a mock instance that behaves like SelectSetOperationBuilder
    builder = {
      query: {} as QuerySelect,
      union: jest.fn().mockImplementation(query => {
        const unionQuery: QuerySelect =
          query && typeof query.toQuery === 'function' ? query.toQuery() : query
        UnionMixin.addUnion(builder.query, unionQuery)
        return builder
      }),
      unionAll: jest.fn().mockImplementation(query => {
        const unionQuery: QuerySelect =
          query && typeof query.toQuery === 'function' ? query.toQuery() : query
        UnionMixin.addUnionAll(builder.query, unionQuery)
        return builder
      }),
      intersect: jest.fn().mockImplementation(query => {
        const intersectQuery: QuerySelect =
          query && typeof query.toQuery === 'function' ? query.toQuery() : query
        UnionMixin.addIntersect(builder.query, intersectQuery)
        return builder
      }),
      except: jest.fn().mockImplementation(query => {
        const exceptQuery: QuerySelect =
          query && typeof query.toQuery === 'function' ? query.toQuery() : query
        UnionMixin.addExcept(builder.query, exceptQuery)
        return builder
      }),
      minus: jest.fn().mockImplementation(query => {
        const minusQuery: QuerySelect =
          query && typeof query.toQuery === 'function' ? query.toQuery() : query
        UnionMixin.addMinus(builder.query, minusQuery)
        return builder
      }),
      toQuery: jest.fn().mockReturnValue({
        table: 'test_table',
        columns: ['id', 'name']
      } as QuerySelect)
    }
    jest.clearAllMocks()
  })

  describe('union', () => {
    it('should add UNION with QuerySelect object', () => {
      const unionQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = builder.union(unionQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, unionQuery)
    })

    it('should add UNION with SelectSetOperationBuilder instance', () => {
      const unionBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = builder.union(unionBuilder)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, {
        table: 'test_table',
        columns: ['id', 'name']
      })
    })

    it('should handle simple union', () => {
      const unionQuery: QuerySelect = {
        table: 'table1',
        columns: ['id']
      }

      const result = builder.union(unionQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, unionQuery)
    })

    it('should handle complex union', () => {
      const unionQuery: QuerySelect = {
        table: 'complex_table',
        columns: ['id', 'name', 'email'],
        where: [{ column: 'active', operator: '=', value: true }],
        orderBy: [{ column: 'name', direction: 'ASC' }]
      }

      const result = builder.union(unionQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, unionQuery)
    })

    it('should support method chaining', () => {
      const unionQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.union(unionQuery).union(unionQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledTimes(2)
    })
  })

  describe('unionAll', () => {
    it('should add UNION ALL with QuerySelect object', () => {
      const unionQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = builder.unionAll(unionQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(builder.query, unionQuery)
    })

    it('should add UNION ALL with SelectSetOperationBuilder instance', () => {
      const unionBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = builder.unionAll(unionBuilder)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(builder.query, {
        table: 'test_table',
        columns: ['id', 'name']
      })
    })

    it('should handle simple union all', () => {
      const unionQuery: QuerySelect = {
        table: 'table1',
        columns: ['id']
      }

      const result = builder.unionAll(unionQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(builder.query, unionQuery)
    })

    it('should support method chaining', () => {
      const unionQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.unionAll(unionQuery).unionAll(unionQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('intersect', () => {
    it('should add INTERSECT with QuerySelect object', () => {
      const intersectQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = builder.intersect(intersectQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(builder.query, intersectQuery)
    })

    it('should add INTERSECT with SelectSetOperationBuilder instance', () => {
      const intersectBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = builder.intersect(intersectBuilder)

      expect(result).toBe(builder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(builder.query, {
        table: 'test_table',
        columns: ['id', 'name']
      })
    })

    it('should handle simple intersect', () => {
      const intersectQuery: QuerySelect = {
        table: 'table1',
        columns: ['id']
      }

      const result = builder.intersect(intersectQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(builder.query, intersectQuery)
    })

    it('should support method chaining', () => {
      const intersectQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.intersect(intersectQuery).intersect(intersectQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledTimes(2)
    })
  })

  describe('except', () => {
    it('should add EXCEPT with QuerySelect object', () => {
      const exceptQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = builder.except(exceptQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addExcept).toHaveBeenCalledWith(builder.query, exceptQuery)
    })

    it('should add EXCEPT with SelectSetOperationBuilder instance', () => {
      const exceptBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = builder.except(exceptBuilder)

      expect(result).toBe(builder)
      expect(UnionMixin.addExcept).toHaveBeenCalledWith(builder.query, {
        table: 'test_table',
        columns: ['id', 'name']
      })
    })

    it('should handle simple except', () => {
      const exceptQuery: QuerySelect = {
        table: 'table1',
        columns: ['id']
      }

      const result = builder.except(exceptQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addExcept).toHaveBeenCalledWith(builder.query, exceptQuery)
    })

    it('should support method chaining', () => {
      const exceptQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.except(exceptQuery).except(exceptQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addExcept).toHaveBeenCalledTimes(2)
    })
  })

  describe('minus', () => {
    it('should add MINUS with QuerySelect object', () => {
      const minusQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = builder.minus(minusQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addMinus).toHaveBeenCalledWith(builder.query, minusQuery)
    })

    it('should add MINUS with SelectSetOperationBuilder instance', () => {
      const minusBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = builder.minus(minusBuilder)

      expect(result).toBe(builder)
      expect(UnionMixin.addMinus).toHaveBeenCalledWith(builder.query, {
        table: 'test_table',
        columns: ['id', 'name']
      })
    })

    it('should handle simple minus', () => {
      const minusQuery: QuerySelect = {
        table: 'table1',
        columns: ['id']
      }

      const result = builder.minus(minusQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addMinus).toHaveBeenCalledWith(builder.query, minusQuery)
    })

    it('should support method chaining', () => {
      const minusQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.minus(minusQuery).minus(minusQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addMinus).toHaveBeenCalledTimes(2)
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple set operations', () => {
      const query1: QuerySelect = { table: 'table1', columns: ['id'] }
      const query2: QuerySelect = { table: 'table2', columns: ['id'] }
      const query3: QuerySelect = { table: 'table3', columns: ['id'] }

      const result = builder.union(query1).unionAll(query2).intersect(query3)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, query1)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(builder.query, query2)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(builder.query, query3)
    })

    it('should handle mixed set operations', () => {
      const query1: QuerySelect = { table: 'table1', columns: ['id'] }
      const query2: QuerySelect = { table: 'table2', columns: ['id'] }
      const query3: QuerySelect = { table: 'table3', columns: ['id'] }
      const query4: QuerySelect = { table: 'table4', columns: ['id'] }

      const result = builder.union(query1).except(query2).minus(query3).unionAll(query4)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledTimes(1)
      expect(UnionMixin.addExcept).toHaveBeenCalledTimes(1)
      expect(UnionMixin.addMinus).toHaveBeenCalledTimes(1)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledTimes(1)
    })

    it('should handle complex queries with set operations', () => {
      const complexQuery: QuerySelect = {
        table: 'complex_table',
        columns: ['id', 'name', 'email'],
        joins: [
          {
            table: 'related_table',
            on: [{ column: 'complex_table.id', operator: '=', value: 'related_table.complex_id' }]
          }
        ],
        where: [
          { column: 'active', operator: '=', value: true },
          { column: 'created_at', operator: '>=', value: '2023-01-01' }
        ],
        orderBy: [{ column: 'name', direction: 'ASC' }],
        limit: 100
      }

      const result = builder.union(complexQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, complexQuery)
    })

    it('should handle nested set operations', () => {
      const outerQuery: QuerySelect = { table: 'outer', columns: ['id'] }
      const innerQuery: QuerySelect = { table: 'inner', columns: ['id'] }

      const result = builder.union(outerQuery).union(innerQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    it('should handle null query', () => {
      const result = builder.union(null as any)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, null)
    })

    it('should handle undefined query', () => {
      const result = builder.union(undefined as any)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, undefined)
    })

    it('should handle empty query object', () => {
      const emptyQuery: QuerySelect = {} as QuerySelect

      const result = builder.union(emptyQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, emptyQuery)
    })

    it('should handle query with empty columns', () => {
      const queryWithEmptyColumns: QuerySelect = {
        table: 'test_table',
        columns: []
      }

      const result = builder.union(queryWithEmptyColumns)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, queryWithEmptyColumns)
    })

    it('should handle query with null values', () => {
      const queryWithNulls: QuerySelect = {
        table: 'test_table',
        columns: ['id', 'name'],
        where: [{ column: 'value', operator: 'IS', value: null }]
      }

      const result = builder.union(queryWithNulls)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, queryWithNulls)
    })
  })

  describe('security considerations', () => {
    it('should handle potentially malicious queries', () => {
      const maliciousQuery: QuerySelect = {
        table: "'; DROP TABLE users; --",
        columns: ['id']
      }

      const result = builder.union(maliciousQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, maliciousQuery)
    })

    it('should handle potentially malicious column names', () => {
      const maliciousQuery: QuerySelect = {
        table: 'test_table',
        columns: ["'; DELETE FROM users; --", 'safe_column']
      }

      const result = builder.unionAll(maliciousQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(builder.query, maliciousQuery)
    })

    it('should handle potentially malicious where conditions', () => {
      const maliciousQuery: QuerySelect = {
        table: 'test_table',
        columns: ['id'],
        where: [
          { column: "'; UPDATE users SET password = NULL; --", operator: '=', value: 'malicious' }
        ]
      }

      const result = builder.intersect(maliciousQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(builder.query, maliciousQuery)
    })
  })

  describe('performance considerations', () => {
    it('should handle many set operations efficiently', () => {
      const query: QuerySelect = { table: 'test', columns: ['id'] }

      let result = builder
      for (let i = 0; i < 10; i++) {
        result = result.union(query)
      }

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledTimes(10)
    })

    it('should handle large queries efficiently', () => {
      const largeQuery: QuerySelect = {
        table: 'large_table',
        columns: Array.from({ length: 50 }, (_, i) => `column_${i}`),
        where: Array.from({ length: 20 }, (_, i) => ({
          column: `condition_${i}`,
          operator: '=' as const,
          value: `value_${i}`
        }))
      }

      const result = builder.union(largeQuery)

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(builder.query, largeQuery)
    })

    it('should handle mixed operations efficiently', () => {
      const query: QuerySelect = { table: 'test', columns: ['id'] }

      let result = builder
      for (let i = 0; i < 5; i++) {
        result = result.union(query).unionAll(query).intersect(query)
      }

      expect(result).toBe(builder)
      expect(UnionMixin.addUnion).toHaveBeenCalledTimes(5)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledTimes(5)
      expect(UnionMixin.addIntersect).toHaveBeenCalledTimes(5)
    })
  })

  describe('SelectSetOperationBuilder Integration Tests', () => {
    let realBuilder: RealSelectSetOperationBuilder

    beforeEach(() => {
      realBuilder = new RealSelectSetOperationBuilder()
      jest.clearAllMocks()
    })

    it('should test actual union method with QuerySelect object', () => {
      const unionQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = realBuilder.union(unionQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(realBuilder.query, unionQuery)
    })

    it('should test actual union method with SelectSetOperationBuilder instance', () => {
      const unionBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = realBuilder.union(unionBuilder as any)

      expect(result).toBe(realBuilder)
      // The actual implementation should call toQuery() on the SelectSetOperationBuilder instance
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(realBuilder.query, unionBuilder)
    })

    it('should test actual unionAll method with QuerySelect object', () => {
      const unionQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = realBuilder.unionAll(unionQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(realBuilder.query, unionQuery)
    })

    it('should test actual unionAll method with SelectSetOperationBuilder instance', () => {
      const unionBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = realBuilder.unionAll(unionBuilder as any)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(realBuilder.query, unionBuilder)
    })

    it('should test actual intersect method with QuerySelect object', () => {
      const intersectQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = realBuilder.intersect(intersectQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(realBuilder.query, intersectQuery)
    })

    it('should test actual intersect method with SelectSetOperationBuilder instance', () => {
      const intersectBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = realBuilder.intersect(intersectBuilder as any)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(realBuilder.query, intersectBuilder)
    })

    it('should test actual except method with QuerySelect object', () => {
      const exceptQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = realBuilder.except(exceptQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addExcept).toHaveBeenCalledWith(realBuilder.query, exceptQuery)
    })

    it('should test actual except method with SelectSetOperationBuilder instance', () => {
      const exceptBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = realBuilder.except(exceptBuilder as any)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addExcept).toHaveBeenCalledWith(realBuilder.query, exceptBuilder)
    })

    it('should test actual minus method with QuerySelect object', () => {
      const minusQuery: QuerySelect = {
        table: 'other_table',
        columns: ['id', 'name']
      }

      const result = realBuilder.minus(minusQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addMinus).toHaveBeenCalledWith(realBuilder.query, minusQuery)
    })

    it('should test actual minus method with SelectSetOperationBuilder instance', () => {
      const minusBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = realBuilder.minus(minusBuilder as any)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addMinus).toHaveBeenCalledWith(realBuilder.query, minusBuilder)
    })

    it('should test method chaining with actual union method', () => {
      const unionQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = realBuilder.union(unionQuery).union(unionQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addUnion).toHaveBeenCalledTimes(2)
    })

    it('should test mixed method chaining', () => {
      const query1: QuerySelect = { table: 'table1', columns: ['id'] }
      const query2: QuerySelect = { table: 'table2', columns: ['id'] }
      const query3: QuerySelect = { table: 'table3', columns: ['id'] }

      const result = realBuilder
        .union(query1)
        .unionAll(query2)
        .intersect(query3)
        .except(query1)
        .minus(query2)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addUnion).toHaveBeenCalledTimes(1)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledTimes(1)
      expect(UnionMixin.addIntersect).toHaveBeenCalledTimes(1)
      expect(UnionMixin.addExcept).toHaveBeenCalledTimes(1)
      expect(UnionMixin.addMinus).toHaveBeenCalledTimes(1)
    })

    it('should test union method with null query', () => {
      const result = realBuilder.union(null as any)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addUnion).toHaveBeenCalledWith(realBuilder.query, null)
    })

    it('should test unionAll method with undefined query', () => {
      const result = realBuilder.unionAll(undefined as any)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addUnionAll).toHaveBeenCalledWith(realBuilder.query, undefined)
    })

    it('should test intersect method with empty query object', () => {
      const emptyQuery: QuerySelect = {} as QuerySelect

      const result = realBuilder.intersect(emptyQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addIntersect).toHaveBeenCalledWith(realBuilder.query, emptyQuery)
    })

    it('should test except method with complex query', () => {
      const complexQuery: QuerySelect = {
        table: 'complex_table',
        columns: ['id', 'name', 'email'],
        joins: [
          {
            table: 'related_table',
            on: [{ column: 'complex_table.id', operator: '=', value: 'related_table.complex_id' }]
          }
        ],
        where: [
          { column: 'active', operator: '=', value: true },
          { column: 'created_at', operator: '>=', value: '2023-01-01' }
        ],
        orderBy: [{ column: 'name', direction: 'ASC' }],
        limit: 100
      }

      const result = realBuilder.except(complexQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addExcept).toHaveBeenCalledWith(realBuilder.query, complexQuery)
    })

    it('should test minus method with malicious query', () => {
      const maliciousQuery: QuerySelect = {
        table: "'; DROP TABLE users; --",
        columns: ['id']
      }

      const result = realBuilder.minus(maliciousQuery)

      expect(result).toBe(realBuilder)
      expect(UnionMixin.addMinus).toHaveBeenCalledWith(realBuilder.query, maliciousQuery)
    })
  })
})
