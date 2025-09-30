import { JoinMixin } from '@builders/mixins/index'
import type { QuerySelect, QueryWhereCondition, QueryJoinType } from '@interfaces/index'

describe('JoinMixin', () => {
  let mockQuery: QuerySelect
  let mockConditions: QueryWhereCondition[]

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'users'
    }
    mockConditions = [{ column: 'users.id', operator: '=', value: 'orders.user_id' }]
  })

  describe('addJoin', () => {
    it('should add INNER JOIN', () => {
      JoinMixin.addJoin(mockQuery, 'INNER', 'orders', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'INNER',
        table: 'orders',
        on: mockConditions
      })
    })

    it('should add LEFT JOIN', () => {
      JoinMixin.addJoin(mockQuery, 'LEFT', 'profiles', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'LEFT',
        table: 'profiles',
        on: mockConditions
      })
    })

    it('should add RIGHT JOIN', () => {
      JoinMixin.addJoin(mockQuery, 'RIGHT', 'departments', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'RIGHT',
        table: 'departments',
        on: mockConditions
      })
    })

    it('should add FULL JOIN', () => {
      JoinMixin.addJoin(mockQuery, 'FULL', 'categories', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'FULL',
        table: 'categories',
        on: mockConditions
      })
    })

    it('should initialize joins array if undefined', () => {
      expect(mockQuery.joins).toBeUndefined()

      JoinMixin.addJoin(mockQuery, 'INNER', 'orders', mockConditions)

      expect(mockQuery.joins).toBeDefined()
      expect(mockQuery.joins).toHaveLength(1)
    })

    it('should append to existing joins array', () => {
      JoinMixin.addJoin(mockQuery, 'INNER', 'orders', mockConditions)
      JoinMixin.addJoin(mockQuery, 'LEFT', 'profiles', mockConditions)

      expect(mockQuery.joins).toHaveLength(2)
      expect(mockQuery.joins![0].type).toBe('INNER')
      expect(mockQuery.joins![1].type).toBe('LEFT')
    })

    it('should handle empty conditions array', () => {
      JoinMixin.addJoin(mockQuery, 'INNER', 'orders', [])

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'INNER',
        table: 'orders',
        on: []
      })
    })

    it('should handle multiple conditions', () => {
      const multipleConditions: QueryWhereCondition[] = [
        { column: 'users.id', operator: '=', value: 'orders.user_id' },
        { column: 'orders.status', operator: '=', value: 'active' }
      ]

      JoinMixin.addJoin(mockQuery, 'INNER', 'orders', multipleConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0].on).toEqual(multipleConditions)
    })
  })

  describe('addInnerJoin', () => {
    it('should add INNER JOIN', () => {
      JoinMixin.addInnerJoin(mockQuery, 'orders', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'INNER',
        table: 'orders',
        on: mockConditions
      })
    })

    it('should handle table with schema', () => {
      JoinMixin.addInnerJoin(mockQuery, 'public.orders', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0].table).toBe('public.orders')
    })
  })

  describe('addLeftJoin', () => {
    it('should add LEFT JOIN', () => {
      JoinMixin.addLeftJoin(mockQuery, 'profiles', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'LEFT',
        table: 'profiles',
        on: mockConditions
      })
    })

    it('should handle table with alias', () => {
      JoinMixin.addLeftJoin(mockQuery, 'user_profiles up', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0].table).toBe('user_profiles up')
    })
  })

  describe('addRightJoin', () => {
    it('should add RIGHT JOIN', () => {
      JoinMixin.addRightJoin(mockQuery, 'departments', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'RIGHT',
        table: 'departments',
        on: mockConditions
      })
    })
  })

  describe('addFullJoin', () => {
    it('should add FULL JOIN', () => {
      JoinMixin.addFullJoin(mockQuery, 'categories', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'FULL',
        table: 'categories',
        on: mockConditions
      })
    })
  })

  describe('addCrossJoin', () => {
    it('should add CROSS JOIN without conditions', () => {
      JoinMixin.addCrossJoin(mockQuery, 'products')

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'CROSS',
        table: 'products',
        on: []
      })
    })

    it('should initialize joins array if undefined', () => {
      expect(mockQuery.joins).toBeUndefined()

      JoinMixin.addCrossJoin(mockQuery, 'products')

      expect(mockQuery.joins).toBeDefined()
      expect(mockQuery.joins).toHaveLength(1)
    })

    it('should append to existing joins array', () => {
      JoinMixin.addCrossJoin(mockQuery, 'products')
      JoinMixin.addCrossJoin(mockQuery, 'categories')

      expect(mockQuery.joins).toHaveLength(2)
      expect(mockQuery.joins![0].type).toBe('CROSS')
      expect(mockQuery.joins![1].type).toBe('CROSS')
    })
  })

  describe('addLateralJoin', () => {
    it('should add LATERAL JOIN with basic parameters', () => {
      JoinMixin.addLateralJoin(mockQuery, 'lateral_table', mockConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'LATERAL',
        table: 'lateral_table',
        on: mockConditions,
        lateral: true
      })
    })

    it('should add LATERAL JOIN with function name', () => {
      JoinMixin.addLateralJoin(
        mockQuery,
        'generate_series(1, 10)',
        mockConditions,
        'generate_series'
      )

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'LATERAL',
        table: 'generate_series(1, 10)',
        on: mockConditions,
        lateral: true,
        function: 'generate_series'
      })
    })

    it('should add LATERAL JOIN with function parameters', () => {
      const params = [1, 10]
      JoinMixin.addLateralJoin(
        mockQuery,
        'generate_series(?, ?)',
        mockConditions,
        'generate_series',
        params
      )

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'LATERAL',
        table: 'generate_series(?, ?)',
        on: mockConditions,
        lateral: true,
        function: 'generate_series',
        params
      })
    })

    it('should add LATERAL JOIN with both function name and parameters', () => {
      const params = ['jsonb_array_elements', 'data']
      JoinMixin.addLateralJoin(
        mockQuery,
        'jsonb_array_elements(?)',
        mockConditions,
        'jsonb_array_elements',
        params
      )

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'LATERAL',
        table: 'jsonb_array_elements(?)',
        on: mockConditions,
        lateral: true,
        function: 'jsonb_array_elements',
        params
      })
    })

    it('should initialize joins array if undefined', () => {
      expect(mockQuery.joins).toBeUndefined()

      JoinMixin.addLateralJoin(mockQuery, 'lateral_table', mockConditions)

      expect(mockQuery.joins).toBeDefined()
      expect(mockQuery.joins).toHaveLength(1)
    })

    it('should append to existing joins array', () => {
      JoinMixin.addLateralJoin(mockQuery, 'lateral1', mockConditions)
      JoinMixin.addLateralJoin(mockQuery, 'lateral2', mockConditions)

      expect(mockQuery.joins).toHaveLength(2)
      expect(mockQuery.joins![0].type).toBe('LATERAL')
      expect(mockQuery.joins![1].type).toBe('LATERAL')
    })

    it('should handle empty conditions array', () => {
      JoinMixin.addLateralJoin(mockQuery, 'lateral_table', [])

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0]).toEqual({
        type: 'LATERAL',
        table: 'lateral_table',
        on: [],
        lateral: true
      })
    })
  })

  describe('join combinations', () => {
    it('should handle multiple different join types', () => {
      JoinMixin.addInnerJoin(mockQuery, 'orders', mockConditions)
      JoinMixin.addLeftJoin(mockQuery, 'profiles', mockConditions)
      JoinMixin.addCrossJoin(mockQuery, 'products')
      JoinMixin.addLateralJoin(mockQuery, 'lateral_table', mockConditions)

      expect(mockQuery.joins).toHaveLength(4)
      expect(mockQuery.joins![0].type).toBe('INNER')
      expect(mockQuery.joins![1].type).toBe('LEFT')
      expect(mockQuery.joins![2].type).toBe('CROSS')
      expect(mockQuery.joins![3].type).toBe('LATERAL')
    })

    it('should handle complex join conditions', () => {
      const complexConditions: QueryWhereCondition[] = [
        { column: 'users.id', operator: '=', value: 'orders.user_id' },
        { column: 'orders.created_at', operator: '>=', value: '2023-01-01' },
        { column: 'orders.status', operator: 'IN', value: ['pending', 'processing'] }
      ]

      JoinMixin.addInnerJoin(mockQuery, 'orders', complexConditions)

      expect(mockQuery.joins).toHaveLength(1)
      expect(mockQuery.joins![0].on).toEqual(complexConditions)
    })
  })
})
