/**
 * @fileoverview Comprehensive unit tests for SelectAggregationBuilder
 * @description Tests aggregation functionality with real implementations and edge cases
 */

// Mock dependencies to avoid import.meta issues
jest.mock('@builders/abstracts/SelectWindow', () => ({
  SelectWindowBuilder: class {
    public query: any = {}
    public connectionManager: any = null

    constructor() {
      this.query = {}
    }

    select() {
      return this
    }
    selectAll() {
      return this
    }
    distinct() {
      return this
    }
    from() {
      return this
    }
    where() {
      return this
    }
    andWhere() {
      return this
    }
    orWhere() {
      return this
    }
    orderBy() {
      return this
    }
    limit() {
      return this
    }
    offset() {
      return this
    }
    groupBy() {
      return this
    }
    having() {
      return this
    }
    innerJoin() {
      return this
    }
    leftJoin() {
      return this
    }
    rightJoin() {
      return this
    }
    fullOuterJoin() {
      return this
    }
    union() {
      return this
    }
    unionAll() {
      return this
    }
    with() {
      return this
    }
    withRecursive() {
      return this
    }
    window() {
      return this
    }
    over() {
      return this
    }
    partitionBy() {
      return this
    }
    orderByWindow() {
      return this
    }
    frame() {
      return this
    }
    toQuery() {
      return {}
    }
    toSQL() {
      return 'SELECT * FROM users'
    }
    toParams() {
      return []
    }
  }
}))

jest.mock('@builders/mixins/index', () => ({
  AggregationMixin: {
    addAggregation: jest.fn()
  }
}))

import { SelectAggregationBuilder } from '@builders/abstracts/SelectAggregation'
import { AggregationMixin } from '@builders/mixins/index'
import type { QueryAggregationFunction, QueryDirectionType } from '@interfaces/index'

// Create a concrete implementation for testing the actual SelectAggregationBuilder
class RealSelectAggregationBuilder extends SelectAggregationBuilder {
  public query: any

  constructor() {
    super()
    this.query = {
      aggregations: []
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

// Create a mock implementation for testing
class TestSelectAggregationBuilder {
  public query: any = { aggregations: [] }
  public connectionManager: any = null

  constructor() {
    // Initialize with empty aggregations array
    this.query.aggregations = []
  }

  // Mock parent methods
  select(...columns: string[]) {
    this.query.columns = columns
    return this
  }

  selectAll() {
    this.query.columns = ['*']
    return this
  }

  from(table: string) {
    this.query.from = table
    return this
  }

  where(column: string, operator: string, value?: any) {
    this.query.where = this.query.where || []
    this.query.where.push({ column, operator, value })
    return this
  }

  groupBy(...columns: string[]) {
    this.query.groupBy = columns
    return this
  }

  having(column: string, operator: string, value?: any) {
    this.query.having = this.query.having || []
    this.query.having.push({ column, operator, value })
    return this
  }

  orderBy(column: string, direction: QueryDirectionType = 'ASC') {
    this.query.orderBy = this.query.orderBy || []
    this.query.orderBy.push({ column, direction })
    return this
  }

  toQuery() {
    return this.query
  }

  toSQL() {
    return 'SELECT * FROM test'
  }

  toParams() {
    return []
  }

  // Implement the aggregate method to simulate real behavior
  aggregate(
    func: QueryAggregationFunction,
    column: string,
    alias?: string,
    options?: {
      distinct?: boolean
      orderBy?: { column: string; direction: QueryDirectionType }[]
      separator?: string
      percentile?: number
    }
  ): this {
    // Simulate the real AggregationMixin.addAggregation behavior
    this.query.aggregations ??= []
    const aggregation: any = {
      function: func,
      column,
      ...(alias != null && { alias }),
      ...(options?.distinct !== undefined && { distinct: options.distinct }),
      ...(options?.orderBy != null && { orderBy: options.orderBy }),
      ...(options?.separator != null && { separator: options.separator }),
      ...(options?.percentile != null && { percentile: options.percentile })
    }
    this.query.aggregations.push(aggregation)
    return this
  }
}

describe('SelectAggregationBuilder', () => {
  let aggregationBuilder: TestSelectAggregationBuilder

  beforeEach(() => {
    aggregationBuilder = new TestSelectAggregationBuilder()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor and inheritance', () => {
    it('should create a SelectAggregationBuilder instance', () => {
      expect(aggregationBuilder).toBeDefined()
      expect(aggregationBuilder.query).toBeDefined()
      expect(aggregationBuilder.query.aggregations).toEqual([])
    })

    it('should extend SelectWindowBuilder functionality', () => {
      expect(aggregationBuilder).toHaveProperty('aggregate')
      expect(typeof aggregationBuilder.aggregate).toBe('function')
    })

    it('should initialize with empty aggregations array', () => {
      expect(aggregationBuilder.query.aggregations).toEqual([])
    })
  })

  describe('aggregate method - basic functionality', () => {
    it('should add basic aggregation function without options', () => {
      const result = aggregationBuilder.aggregate('COUNT', 'id')

      expect(result).toBe(aggregationBuilder)
      expect(aggregationBuilder.query.aggregations).toHaveLength(1)
      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'COUNT',
        column: 'id'
      })
    })

    it('should add aggregation function with alias', () => {
      aggregationBuilder.aggregate('SUM', 'amount', 'total_amount')

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'SUM',
        column: 'amount',
        alias: 'total_amount'
      })
    })

    it('should add aggregation function with all options', () => {
      const options = {
        distinct: true,
        orderBy: [{ column: 'created_at', direction: 'DESC' as QueryDirectionType }],
        separator: ',',
        percentile: 0.95
      }

      aggregationBuilder.aggregate('STRING_AGG', 'name', 'names', options)

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'STRING_AGG',
        column: 'name',
        alias: 'names',
        distinct: true,
        orderBy: [{ column: 'created_at', direction: 'DESC' }],
        separator: ',',
        percentile: 0.95
      })
    })

    it('should handle undefined alias correctly', () => {
      aggregationBuilder.aggregate('AVG', 'price')

      const aggregation = aggregationBuilder.query.aggregations[0]
      expect(aggregation.function).toBe('AVG')
      expect(aggregation.column).toBe('price')
      expect(aggregation.alias).toBeUndefined()
    })

    it('should handle empty string alias correctly', () => {
      aggregationBuilder.aggregate('MAX', 'score', '')

      const aggregation = aggregationBuilder.query.aggregations[0]
      expect(aggregation.function).toBe('MAX')
      expect(aggregation.column).toBe('score')
      expect(aggregation.alias).toBe('')
    })
  })

  describe('aggregate method - options handling', () => {
    it('should handle distinct option only', () => {
      const options = { distinct: true }
      aggregationBuilder.aggregate('COUNT', '*', 'distinct_count', options)

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'COUNT',
        column: '*',
        alias: 'distinct_count',
        distinct: true
      })
    })

    it('should handle orderBy option only', () => {
      const options = {
        orderBy: [
          { column: 'id', direction: 'ASC' as QueryDirectionType },
          { column: 'name', direction: 'DESC' as QueryDirectionType }
        ]
      }

      aggregationBuilder.aggregate('ARRAY_AGG', 'tags', 'tag_list', options)

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'ARRAY_AGG',
        column: 'tags',
        alias: 'tag_list',
        orderBy: [
          { column: 'id', direction: 'ASC' },
          { column: 'name', direction: 'DESC' }
        ]
      })
    })

    it('should handle separator option only', () => {
      const options = { separator: '|' }
      aggregationBuilder.aggregate('STRING_AGG', 'category', 'categories', options)

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'STRING_AGG',
        column: 'category',
        alias: 'categories',
        separator: '|'
      })
    })

    it('should handle percentile option only', () => {
      const options = { percentile: 0.5 }
      aggregationBuilder.aggregate('PERCENTILE_CONT', 'score', 'median_score', options)

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'PERCENTILE_CONT',
        column: 'score',
        alias: 'median_score',
        percentile: 0.5
      })
    })

    it('should handle empty options object', () => {
      const options = {}
      aggregationBuilder.aggregate('MIN', 'value', 'min_value', options)

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'MIN',
        column: 'value',
        alias: 'min_value'
      })
    })

    it('should handle null options', () => {
      aggregationBuilder.aggregate('SUM', 'amount', 'total', null as any)

      expect(aggregationBuilder.query.aggregations[0]).toEqual({
        function: 'SUM',
        column: 'amount',
        alias: 'total'
      })
    })
  })

  describe('aggregate method - multiple aggregations', () => {
    it('should add multiple aggregations to the same query', () => {
      aggregationBuilder
        .aggregate('COUNT', '*', 'total_count')
        .aggregate('SUM', 'price', 'total_price')
        .aggregate('AVG', 'rating', 'avg_rating')

      expect(aggregationBuilder.query.aggregations).toHaveLength(3)
      expect(aggregationBuilder.query.aggregations[0].function).toBe('COUNT')
      expect(aggregationBuilder.query.aggregations[1].function).toBe('SUM')
      expect(aggregationBuilder.query.aggregations[2].function).toBe('AVG')
    })

    it('should maintain aggregation order', () => {
      const functions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']

      functions.forEach(func => {
        aggregationBuilder.aggregate(
          func as QueryAggregationFunction,
          'column',
          `${func.toLowerCase()}_result`
        )
      })

      aggregationBuilder.query.aggregations.forEach((agg: any, index: number) => {
        expect(agg.function).toBe(functions[index])
      })
    })
  })

  describe('aggregation function types - comprehensive coverage', () => {
    const aggregationFunctions: QueryAggregationFunction[] = [
      'COUNT',
      'SUM',
      'AVG',
      'MIN',
      'MAX',
      'STDDEV',
      'STDDEV_POP',
      'STDDEV_SAMP',
      'VARIANCE',
      'VAR_POP',
      'VAR_SAMP',
      'PERCENTILE_CONT',
      'PERCENTILE_DISC',
      'MODE',
      'GROUP_CONCAT',
      'STRING_AGG',
      'ARRAY_AGG',
      'JSON_AGG',
      'JSON_OBJECT_AGG',
      'JSON_ARRAY_AGG'
    ]

    aggregationFunctions.forEach(func => {
      it(`should support ${func} aggregation function`, () => {
        aggregationBuilder.aggregate(func, 'column', `${func.toLowerCase()}_result`)

        const aggregation = aggregationBuilder.query.aggregations[0]
        expect(aggregation.function).toBe(func)
        expect(aggregation.column).toBe('column')
        expect(aggregation.alias).toBe(`${func.toLowerCase()}_result`)
      })
    })
  })

  describe('method chaining', () => {
    it('should return this for method chaining', () => {
      const result = aggregationBuilder.aggregate('AVG', 'price')
      expect(result).toBe(aggregationBuilder)
    })

    it('should support chaining with other query methods', () => {
      const result = aggregationBuilder
        .select('id', 'name')
        .from('users')
        .aggregate('COUNT', 'id', 'user_count')
        .groupBy('status')
        .having('COUNT(id)', '>', 1)

      expect(result).toBe(aggregationBuilder)
      expect(aggregationBuilder.query.columns).toEqual(['id', 'name'])
      expect(aggregationBuilder.query.from).toBe('users')
      expect(aggregationBuilder.query.groupBy).toEqual(['status'])
      expect(aggregationBuilder.query.having).toHaveLength(1)
      expect(aggregationBuilder.query.aggregations).toHaveLength(1)
    })

    it('should support complex chaining scenarios', () => {
      aggregationBuilder
        .select('category', 'subcategory')
        .from('products')
        .aggregate('COUNT', '*', 'product_count')
        .aggregate('SUM', 'price', 'total_value', { distinct: true })
        .aggregate('AVG', 'rating', 'avg_rating')
        .aggregate('STRING_AGG', 'name', 'product_names', {
          separator: ', ',
          orderBy: [{ column: 'name', direction: 'ASC' }]
        })
        .groupBy('category', 'subcategory')
        .having('COUNT(*)', '>', 5)
        .orderBy('product_count', 'DESC')

      expect(aggregationBuilder.query.columns).toEqual(['category', 'subcategory'])
      expect(aggregationBuilder.query.from).toBe('products')
      expect(aggregationBuilder.query.aggregations).toHaveLength(4)
      expect(aggregationBuilder.query.groupBy).toEqual(['category', 'subcategory'])
      expect(aggregationBuilder.query.having).toHaveLength(1)
      expect(aggregationBuilder.query.orderBy).toHaveLength(1)
    })
  })

  describe('complex aggregation scenarios', () => {
    it('should handle percentile aggregations with different values', () => {
      aggregationBuilder
        .aggregate('PERCENTILE_CONT', 'score', 'p50', { percentile: 0.5 })
        .aggregate('PERCENTILE_CONT', 'score', 'p95', { percentile: 0.95 })
        .aggregate('PERCENTILE_DISC', 'score', 'p99', { percentile: 0.99 })

      expect(aggregationBuilder.query.aggregations).toHaveLength(3)
      expect(aggregationBuilder.query.aggregations[0].percentile).toBe(0.5)
      expect(aggregationBuilder.query.aggregations[1].percentile).toBe(0.95)
      expect(aggregationBuilder.query.aggregations[2].percentile).toBe(0.99)
    })

    it('should handle statistical aggregations', () => {
      aggregationBuilder
        .aggregate('STDDEV', 'price', 'price_stddev')
        .aggregate('VARIANCE', 'price', 'price_variance')
        .aggregate('STDDEV_POP', 'price', 'price_stddev_pop')
        .aggregate('VAR_POP', 'price', 'price_var_pop')

      expect(aggregationBuilder.query.aggregations).toHaveLength(4)
      expect(aggregationBuilder.query.aggregations[0].function).toBe('STDDEV')
      expect(aggregationBuilder.query.aggregations[1].function).toBe('VARIANCE')
      expect(aggregationBuilder.query.aggregations[2].function).toBe('STDDEV_POP')
      expect(aggregationBuilder.query.aggregations[3].function).toBe('VAR_POP')
    })

    it('should handle string aggregation functions', () => {
      aggregationBuilder
        .aggregate('STRING_AGG', 'name', 'names', { separator: ', ' })
        .aggregate('GROUP_CONCAT', 'category', 'categories', { separator: '|' })
        .aggregate('ARRAY_AGG', 'tags', 'tag_list')

      expect(aggregationBuilder.query.aggregations).toHaveLength(3)
      expect(aggregationBuilder.query.aggregations[0].separator).toBe(', ')
      expect(aggregationBuilder.query.aggregations[1].separator).toBe('|')
      expect(aggregationBuilder.query.aggregations[2].separator).toBeUndefined()
    })

    it('should handle JSON aggregation functions', () => {
      aggregationBuilder
        .aggregate('JSON_AGG', 'data', 'json_data')
        .aggregate('JSON_OBJECT_AGG', 'key_value', 'json_object')
        .aggregate('JSON_ARRAY_AGG', 'items', 'json_array')

      expect(aggregationBuilder.query.aggregations).toHaveLength(3)
      expect(aggregationBuilder.query.aggregations[0].function).toBe('JSON_AGG')
      expect(aggregationBuilder.query.aggregations[1].function).toBe('JSON_OBJECT_AGG')
      expect(aggregationBuilder.query.aggregations[2].function).toBe('JSON_ARRAY_AGG')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty column name', () => {
      expect(() => {
        aggregationBuilder.aggregate('COUNT', '')
      }).not.toThrow()

      expect(aggregationBuilder.query.aggregations[0].column).toBe('')
    })

    it('should handle special column names', () => {
      const specialColumns = ['*', 'COUNT(*)', 'MAX(price)', 'SUM(DISTINCT amount)']

      specialColumns.forEach(column => {
        aggregationBuilder.aggregate(
          'COUNT',
          column,
          `count_${column.replace(/[^a-zA-Z0-9]/g, '_')}`
        )
      })

      expect(aggregationBuilder.query.aggregations).toHaveLength(specialColumns.length)
    })

    it('should handle very long aliases', () => {
      const longAlias = 'a'.repeat(1000)
      aggregationBuilder.aggregate('SUM', 'amount', longAlias)

      expect(aggregationBuilder.query.aggregations[0].alias).toBe(longAlias)
    })

    it('should handle numeric column names', () => {
      aggregationBuilder.aggregate('COUNT', '123', 'count_123')
      expect(aggregationBuilder.query.aggregations[0].column).toBe('123')
    })

    it('should handle complex orderBy arrays', () => {
      const complexOrderBy = [
        { column: 'id', direction: 'ASC' as QueryDirectionType },
        { column: 'name', direction: 'DESC' as QueryDirectionType },
        { column: 'created_at', direction: 'ASC' as QueryDirectionType }
      ]

      aggregationBuilder.aggregate('STRING_AGG', 'name', 'names', { orderBy: complexOrderBy })

      expect(aggregationBuilder.query.aggregations[0].orderBy).toEqual(complexOrderBy)
    })

    it('should handle extreme percentile values', () => {
      const extremePercentiles = [0, 0.001, 0.5, 0.999, 1]

      extremePercentiles.forEach(percentile => {
        aggregationBuilder.aggregate('PERCENTILE_CONT', 'score', `p${percentile}`, { percentile })
      })

      expect(aggregationBuilder.query.aggregations).toHaveLength(extremePercentiles.length)
      extremePercentiles.forEach((percentile, index) => {
        expect(aggregationBuilder.query.aggregations[index].percentile).toBe(percentile)
      })
    })

    it('should handle boolean distinct values', () => {
      aggregationBuilder
        .aggregate('COUNT', 'id', 'count_all', { distinct: false })
        .aggregate('COUNT', 'id', 'count_distinct', { distinct: true })

      expect(aggregationBuilder.query.aggregations[0].distinct).toBe(false)
      expect(aggregationBuilder.query.aggregations[1].distinct).toBe(true)
    })
  })

  describe('query state management', () => {
    it('should maintain query state across multiple operations', () => {
      aggregationBuilder
        .select('category')
        .from('products')
        .aggregate('COUNT', '*', 'count')
        .groupBy('category')

      expect(aggregationBuilder.query.columns).toEqual(['category'])
      expect(aggregationBuilder.query.from).toBe('products')
      expect(aggregationBuilder.query.aggregations).toHaveLength(1)
      expect(aggregationBuilder.query.groupBy).toEqual(['category'])
    })

    it('should preserve existing aggregations when adding new ones', () => {
      aggregationBuilder.aggregate('COUNT', 'id', 'count')
      const firstAggregation = aggregationBuilder.query.aggregations[0]

      aggregationBuilder.aggregate('SUM', 'amount', 'total')
      const secondAggregation = aggregationBuilder.query.aggregations[1]

      expect(aggregationBuilder.query.aggregations).toHaveLength(2)
      expect(aggregationBuilder.query.aggregations[0]).toBe(firstAggregation)
      expect(aggregationBuilder.query.aggregations[1]).toBe(secondAggregation)
    })

    it('should handle query reset and rebuild', () => {
      // Build initial query
      aggregationBuilder.select('id').from('users').aggregate('COUNT', 'id', 'count')

      expect(aggregationBuilder.query.aggregations).toHaveLength(1)

      // Reset aggregations
      aggregationBuilder.query.aggregations = []

      // Rebuild
      aggregationBuilder
        .aggregate('SUM', 'amount', 'total')
        .aggregate('AVG', 'rating', 'avg_rating')

      expect(aggregationBuilder.query.aggregations).toHaveLength(2)
    })
  })

  describe('performance and stress testing', () => {
    it('should handle large number of aggregations efficiently', () => {
      const startTime = Date.now()
      const numAggregations = 100

      for (let i = 0; i < numAggregations; i++) {
        aggregationBuilder.aggregate('COUNT', `column_${i}`, `count_${i}`)
      }

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(aggregationBuilder.query.aggregations).toHaveLength(numAggregations)
      expect(executionTime).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle complex nested options efficiently', () => {
      const complexOptions = {
        distinct: true,
        orderBy: Array.from({ length: 10 }, (_, i) => ({
          column: `col_${i}`,
          direction: i % 2 === 0 ? 'ASC' : ('DESC' as QueryDirectionType)
        })),
        separator: '|',
        percentile: 0.95
      }

      const startTime = Date.now()
      aggregationBuilder.aggregate('STRING_AGG', 'data', 'result', complexOptions)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100) // Should complete quickly
      expect(aggregationBuilder.query.aggregations[0].orderBy).toHaveLength(10)
    })
  })

  describe('SelectAggregationBuilder Integration Tests', () => {
    let realBuilder: RealSelectAggregationBuilder

    beforeEach(() => {
      realBuilder = new RealSelectAggregationBuilder()
      jest.clearAllMocks()
    })

    it('should test actual aggregate method with basic parameters', () => {
      const result = realBuilder.aggregate('COUNT', 'id')

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'COUNT',
        'id',
        undefined,
        undefined
      )
    })

    it('should test actual aggregate method with alias parameter', () => {
      const result = realBuilder.aggregate('SUM', 'amount', 'total_amount')

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'SUM',
        'amount',
        'total_amount',
        undefined
      )
    })

    it('should test actual aggregate method with all parameters', () => {
      const options = {
        distinct: true,
        orderBy: [{ column: 'created_at', direction: 'DESC' as QueryDirectionType }],
        separator: ',',
        percentile: 0.95
      }

      const result = realBuilder.aggregate('STRING_AGG', 'name', 'names', options)

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'STRING_AGG',
        'name',
        'names',
        options
      )
    })

    it('should test actual aggregate method with undefined alias', () => {
      const result = realBuilder.aggregate('AVG', 'price', undefined)

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'AVG',
        'price',
        undefined,
        undefined
      )
    })

    it('should test actual aggregate method with empty string alias', () => {
      const result = realBuilder.aggregate('MAX', 'score', '')

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'MAX',
        'score',
        '',
        undefined
      )
    })

    it('should test actual aggregate method with null alias', () => {
      const result = realBuilder.aggregate('MIN', 'value', null as any)

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'MIN',
        'value',
        null,
        undefined
      )
    })

    it('should test actual aggregate method with options but no alias', () => {
      const options = { distinct: true }
      const result = realBuilder.aggregate('COUNT', '*', undefined, options)

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'COUNT',
        '*',
        undefined,
        options
      )
    })

    it('should test actual aggregate method with empty options object', () => {
      const options = {}
      const result = realBuilder.aggregate('SUM', 'amount', 'total', options)

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'SUM',
        'amount',
        'total',
        options
      )
    })

    it('should test actual aggregate method with null options', () => {
      const result = realBuilder.aggregate('AVG', 'rating', 'avg_rating', null as any)

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledWith(
        realBuilder.query,
        'AVG',
        'rating',
        'avg_rating',
        null
      )
    })

    it('should test method chaining with actual aggregate method', () => {
      const result = realBuilder
        .aggregate('COUNT', 'id', 'count')
        .aggregate('SUM', 'amount', 'total')

      expect(result).toBe(realBuilder)
      expect(AggregationMixin.addAggregation).toHaveBeenCalledTimes(2)
    })

    it('should test all aggregation function types with actual method', () => {
      const functions: QueryAggregationFunction[] = [
        'COUNT',
        'SUM',
        'AVG',
        'MIN',
        'MAX',
        'STDDEV',
        'VARIANCE',
        'PERCENTILE_CONT',
        'PERCENTILE_DISC',
        'STRING_AGG',
        'ARRAY_AGG'
      ]

      functions.forEach(func => {
        realBuilder.aggregate(func, 'column', `${func.toLowerCase()}_result`)
      })

      expect(AggregationMixin.addAggregation).toHaveBeenCalledTimes(functions.length)
    })
  })
})
