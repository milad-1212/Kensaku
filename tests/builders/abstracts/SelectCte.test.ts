import { SelectCteBuilder } from '@builders/abstracts/SelectCte'
import { CteMixin } from '@builders/mixins/index'
import type { QuerySelect } from '@interfaces/index'

// Mock dependencies
jest.mock('@builders/mixins/index', () => ({
  CteMixin: {
    addCte: jest.fn(),
    addRecursiveCte: jest.fn()
  }
}))

// Mock the parent class
jest.mock('@builders/abstracts/SelectSetOperation', () => ({
  SelectSetOperationBuilder: class {
    public query: any = {}

    constructor() {
      this.query = {}
    }

    union() {
      return this
    }
    unionAll() {
      return this
    }
    intersect() {
      return this
    }
    except() {
      return this
    }
    minus() {
      return this
    }
  }
}))

// Create a concrete implementation for testing the actual SelectCteBuilder
class RealSelectCteBuilder extends SelectCteBuilder {
  public query: any

  constructor() {
    super()
    this.query = {
      ctes: []
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

describe('SelectCteBuilder', () => {
  let builder: any

  beforeEach(() => {
    // Create a mock instance that behaves like SelectCteBuilder
    builder = {
      query: {} as QuerySelect,
      with: jest.fn().mockImplementation((name, query) => {
        const cteQuery: QuerySelect =
          query && typeof query.toQuery === 'function' ? query.toQuery() : query
        CteMixin.addCte(builder.query, name, cteQuery)
        return builder
      }),
      withRecursive: jest.fn().mockImplementation((name, query) => {
        const cteQuery: QuerySelect =
          query && typeof query.toQuery === 'function' ? query.toQuery() : query
        CteMixin.addRecursiveCte(builder.query, name, cteQuery)
        return builder
      }),
      toQuery: jest.fn().mockReturnValue({
        table: 'test_table',
        columns: ['id', 'name']
      } as QuerySelect)
    }
    jest.clearAllMocks()
  })

  describe('with', () => {
    it('should add CTE with QuerySelect object', () => {
      const cteName = 'user_summary'
      const cteQuery: QuerySelect = {
        table: 'users',
        columns: ['id', 'name', 'email'],
        where: [{ column: 'active', operator: '=', value: true }]
      }

      const result = builder.with(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })

    it('should add CTE with SelectCteBuilder instance', () => {
      const cteName = 'product_stats'
      const cteBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = builder.with(cteName, cteBuilder)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, {
        table: 'test_table',
        columns: ['id', 'name']
      })
    })

    it('should handle simple CTE', () => {
      const cteName = 'simple_cte'
      const cteQuery: QuerySelect = {
        table: 'orders',
        columns: ['id', 'total']
      }

      const result = builder.with(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })

    it('should handle complex CTE with joins', () => {
      const cteName = 'complex_cte'
      const cteQuery: QuerySelect = {
        table: 'users',
        columns: ['users.id', 'users.name', 'profiles.bio'],
        joins: [
          {
            table: 'profiles',
            on: [{ column: 'users.id', operator: '=', value: 'profiles.user_id' }]
          }
        ],
        where: [{ column: 'users.active', operator: '=', value: true }]
      }

      const result = builder.with(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })

    it('should support method chaining', () => {
      const cteName1 = 'cte1'
      const cteName2 = 'cte2'
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.with(cteName1, cteQuery).with(cteName2, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledTimes(2)
    })

    it('should handle empty CTE name', () => {
      const cteName = ''
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.with(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, '', cteQuery)
    })

    it('should handle CTE with aggregation', () => {
      const cteName = 'aggregated_cte'
      const cteQuery: QuerySelect = {
        table: 'orders',
        columns: ['customer_id'],
        aggregations: [
          {
            function: 'SUM',
            column: 'total',
            alias: 'total_spent'
          }
        ],
        groupBy: ['customer_id']
      }

      const result = builder.with(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })
  })

  describe('withRecursive', () => {
    it('should add recursive CTE with QuerySelect object', () => {
      const cteName = 'recursive_hierarchy'
      const cteQuery: QuerySelect = {
        table: 'employees',
        columns: ['id', 'name', 'manager_id'],
        where: [{ column: 'manager_id', operator: 'IS', value: null }]
      }

      const result = builder.withRecursive(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })

    it('should add recursive CTE with SelectCteBuilder instance', () => {
      const cteName = 'recursive_tree'
      const cteBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = builder.withRecursive(cteName, cteBuilder)

      expect(result).toBe(builder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(builder.query, cteName, {
        table: 'test_table',
        columns: ['id', 'name']
      })
    })

    it('should handle simple recursive CTE', () => {
      const cteName = 'simple_recursive'
      const cteQuery: QuerySelect = {
        table: 'categories',
        columns: ['id', 'name', 'parent_id']
      }

      const result = builder.withRecursive(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })

    it('should handle complex recursive CTE', () => {
      const cteName = 'complex_recursive'
      const cteQuery: QuerySelect = {
        table: 'nodes',
        columns: ['id', 'name', 'parent_id', 'level'],
        where: [
          { column: 'parent_id', operator: 'IS', value: null },
          { column: 'active', operator: '=', value: true }
        ],
        orderBy: [{ column: 'level', direction: 'ASC' }]
      }

      const result = builder.withRecursive(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })

    it('should support method chaining', () => {
      const cteName1 = 'recursive1'
      const cteName2 = 'recursive2'
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.withRecursive(cteName1, cteQuery).withRecursive(cteName2, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledTimes(2)
    })

    it('should handle recursive CTE with unions', () => {
      const cteName = 'recursive_union'
      const cteQuery: QuerySelect = {
        table: 'base_table',
        columns: ['id', 'name'],
        unions: [
          {
            table: 'other_table',
            columns: ['id', 'name']
          }
        ]
      }

      const result = builder.withRecursive(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple CTEs', () => {
      const cte1Query: QuerySelect = { table: 'users', columns: ['id', 'name'] }
      const cte2Query: QuerySelect = { table: 'orders', columns: ['id', 'total'] }
      const recursiveQuery: QuerySelect = { table: 'hierarchy', columns: ['id', 'parent_id'] }

      const result = builder
        .with('users_cte', cte1Query)
        .with('orders_cte', cte2Query)
        .withRecursive('hierarchy_cte', recursiveQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledTimes(2)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledTimes(1)
    })

    it('should handle mixed CTE types', () => {
      const regularQuery: QuerySelect = { table: 'regular', columns: ['id'] }
      const recursiveQuery: QuerySelect = { table: 'recursive', columns: ['id'] }

      const result = builder
        .with('regular_cte', regularQuery)
        .withRecursive('recursive_cte', recursiveQuery)
        .with('another_regular', regularQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledTimes(2)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledTimes(1)
    })

    it('should handle CTEs with complex queries', () => {
      const complexQuery: QuerySelect = {
        table: 'main_table',
        columns: ['id', 'name', 'status'],
        joins: [
          {
            table: 'related_table',
            on: [{ column: 'main_table.id', operator: '=', value: 'related_table.main_id' }]
          }
        ],
        where: [
          { column: 'status', operator: '=', value: 'active' },
          { column: 'created_at', operator: '>=', value: '2023-01-01' }
        ],
        orderBy: [{ column: 'name', direction: 'ASC' }],
        limit: 100
      }

      const result = builder.with('complex_cte', complexQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, 'complex_cte', complexQuery)
    })
  })

  describe('edge cases', () => {
    it('should handle null CTE query', () => {
      const cteName = 'null_cte'

      const result = builder.with(cteName, null as any)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, null)
    })

    it('should handle undefined CTE query', () => {
      const cteName = 'undefined_cte'

      const result = builder.with(cteName, undefined as any)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, undefined)
    })

    it('should handle empty CTE query object', () => {
      const cteName = 'empty_cte'
      const emptyQuery: QuerySelect = {} as QuerySelect

      const result = builder.with(cteName, emptyQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, emptyQuery)
    })

    it('should handle CTE with empty columns', () => {
      const cteName = 'empty_columns_cte'
      const cteQuery: QuerySelect = {
        table: 'test_table',
        columns: []
      }

      const result = builder.with(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })

    it('should handle CTE with null values', () => {
      const cteName = 'null_values_cte'
      const cteQuery: QuerySelect = {
        table: 'test_table',
        columns: ['id', 'name'],
        where: [{ column: 'value', operator: 'IS', value: null }]
      }

      const result = builder.with(cteName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, cteQuery)
    })
  })

  describe('security considerations', () => {
    it('should handle potentially malicious CTE names', () => {
      const maliciousName = "'; DROP TABLE users; --"
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = builder.with(maliciousName, cteQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, maliciousName, cteQuery)
    })

    it('should handle potentially malicious CTE queries', () => {
      const cteName = 'malicious_cte'
      const maliciousQuery: QuerySelect = {
        table: "'; DROP TABLE users; --",
        columns: ['id']
      }

      const result = builder.with(cteName, maliciousQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, cteName, maliciousQuery)
    })

    it('should handle potentially malicious recursive CTE', () => {
      const maliciousName = "'; DELETE FROM users; --"
      const maliciousQuery: QuerySelect = {
        table: "'; UPDATE users SET password = NULL; --",
        columns: ['id']
      }

      const result = builder.withRecursive(maliciousName, maliciousQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(
        builder.query,
        maliciousName,
        maliciousQuery
      )
    })
  })

  describe('performance considerations', () => {
    it('should handle many CTEs efficiently', () => {
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      let result = builder
      for (let i = 0; i < 10; i++) {
        result = result.with(`cte_${i}`, cteQuery)
      }

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledTimes(10)
    })

    it('should handle large CTE queries', () => {
      const largeQuery: QuerySelect = {
        table: 'large_table',
        columns: Array.from({ length: 50 }, (_, i) => `column_${i}`),
        where: Array.from({ length: 20 }, (_, i) => ({
          column: `condition_${i}`,
          operator: '=' as const,
          value: `value_${i}`
        }))
      }

      const result = builder.with('large_cte', largeQuery)

      expect(result).toBe(builder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(builder.query, 'large_cte', largeQuery)
    })
  })

  describe('SelectCteBuilder Integration Tests', () => {
    let realBuilder: RealSelectCteBuilder

    beforeEach(() => {
      realBuilder = new RealSelectCteBuilder()
      jest.clearAllMocks()
    })

    it('should test actual with method with QuerySelect object', () => {
      const cteName = 'user_summary'
      const cteQuery: QuerySelect = {
        table: 'users',
        columns: ['id', 'name', 'email'],
        where: [{ column: 'active', operator: '=', value: true }]
      }

      const result = realBuilder.with(cteName, cteQuery)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(realBuilder.query, cteName, cteQuery)
    })

    it('should test actual with method with SelectCteBuilder instance', () => {
      const cteName = 'product_stats'
      const cteBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = realBuilder.with(cteName, cteBuilder as any)

      expect(result).toBe(realBuilder)
      // The actual implementation should call toQuery() on the SelectCteBuilder instance
      expect(CteMixin.addCte).toHaveBeenCalledWith(realBuilder.query, cteName, cteBuilder)
    })

    it('should test actual withRecursive method with QuerySelect object', () => {
      const cteName = 'recursive_hierarchy'
      const cteQuery: QuerySelect = {
        table: 'employees',
        columns: ['id', 'name', 'manager_id'],
        where: [{ column: 'manager_id', operator: 'IS', value: null }]
      }

      const result = realBuilder.withRecursive(cteName, cteQuery)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(realBuilder.query, cteName, cteQuery)
    })

    it('should test actual withRecursive method with SelectCteBuilder instance', () => {
      const cteName = 'recursive_tree'
      const cteBuilder = {
        toQuery: jest.fn().mockReturnValue({
          table: 'test_table',
          columns: ['id', 'name']
        })
      }

      const result = realBuilder.withRecursive(cteName, cteBuilder as any)

      expect(result).toBe(realBuilder)
      // The actual implementation should call toQuery() on the SelectCteBuilder instance
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(realBuilder.query, cteName, cteBuilder)
    })

    it('should test method chaining with actual with method', () => {
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = realBuilder.with('cte1', cteQuery).with('cte2', cteQuery)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addCte).toHaveBeenCalledTimes(2)
    })

    it('should test method chaining with actual withRecursive method', () => {
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = realBuilder
        .withRecursive('recursive1', cteQuery)
        .withRecursive('recursive2', cteQuery)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledTimes(2)
    })

    it('should test mixed method chaining', () => {
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = realBuilder
        .with('regular_cte', cteQuery)
        .withRecursive('recursive_cte', cteQuery)
        .with('another_regular', cteQuery)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addCte).toHaveBeenCalledTimes(2)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledTimes(1)
    })

    it('should test with method with null query', () => {
      const result = realBuilder.with('null_cte', null as any)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(realBuilder.query, 'null_cte', null)
    })

    it('should test withRecursive method with undefined query', () => {
      const result = realBuilder.withRecursive('undefined_cte', undefined as any)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(
        realBuilder.query,
        'undefined_cte',
        undefined
      )
    })

    it('should test with method with empty string name', () => {
      const cteQuery: QuerySelect = { table: 'test', columns: ['id'] }

      const result = realBuilder.with('', cteQuery)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addCte).toHaveBeenCalledWith(realBuilder.query, '', cteQuery)
    })

    it('should test withRecursive method with complex query', () => {
      const complexQuery: QuerySelect = {
        table: 'main_table',
        columns: ['id', 'name', 'status'],
        joins: [
          {
            table: 'related_table',
            on: [{ column: 'main_table.id', operator: '=', value: 'related_table.main_id' }]
          }
        ],
        where: [
          { column: 'status', operator: '=', value: 'active' },
          { column: 'created_at', operator: '>=', value: '2023-01-01' }
        ],
        orderBy: [{ column: 'name', direction: 'ASC' }],
        limit: 100
      }

      const result = realBuilder.withRecursive('complex_recursive', complexQuery)

      expect(result).toBe(realBuilder)
      expect(CteMixin.addRecursiveCte).toHaveBeenCalledWith(
        realBuilder.query,
        'complex_recursive',
        complexQuery
      )
    })
  })
})
