import { SelectMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'
import type { QuerySelect, QuerySubQuery, QueryOrderClause } from '@interfaces/index'

describe('SelectMixin', () => {
  let mockQuery: QuerySelect

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'users'
    }
  })

  describe('setColumns', () => {
    it('should set single column', () => {
      SelectMixin.setColumns(mockQuery, 'id')

      expect(mockQuery.columns).toEqual(['id'])
    })

    it('should set multiple columns', () => {
      SelectMixin.setColumns(mockQuery, 'id', 'name', 'email')

      expect(mockQuery.columns).toEqual(['id', 'name', 'email'])
    })

    it('should overwrite existing columns', () => {
      mockQuery.columns = ['old_column']
      SelectMixin.setColumns(mockQuery, 'new_column')

      expect(mockQuery.columns).toEqual(['new_column'])
    })

    it('should handle columns with table prefixes', () => {
      SelectMixin.setColumns(mockQuery, 'users.id', 'users.name', 'profiles.bio')

      expect(mockQuery.columns).toEqual(['users.id', 'users.name', 'profiles.bio'])
    })

    it('should handle columns with aliases', () => {
      SelectMixin.setColumns(mockQuery, 'id as user_id', 'name as user_name')

      expect(mockQuery.columns).toEqual(['id as user_id', 'name as user_name'])
    })

    it('should handle empty columns array', () => {
      SelectMixin.setColumns(mockQuery)

      expect(mockQuery.columns).toEqual([])
    })
  })

  describe('setSelectAll', () => {
    it('should set columns to select all', () => {
      SelectMixin.setSelectAll(mockQuery)

      expect(mockQuery.columns).toEqual(['*'])
    })

    it('should overwrite existing columns', () => {
      mockQuery.columns = ['id', 'name']
      SelectMixin.setSelectAll(mockQuery)

      expect(mockQuery.columns).toEqual(['*'])
    })
  })

  describe('setDistinct', () => {
    it('should set distinct flag', () => {
      SelectMixin.setDistinct(mockQuery)

      expect(mockQuery.distinct).toBe(true)
    })

    it('should overwrite existing distinct flag', () => {
      mockQuery.distinct = false
      SelectMixin.setDistinct(mockQuery)

      expect(mockQuery.distinct).toBe(true)
    })
  })

  describe('setFrom', () => {
    it('should set table name', () => {
      SelectMixin.setFrom(mockQuery, 'products')

      expect(mockQuery.from).toBe('products')
    })

    it('should set table name with schema', () => {
      SelectMixin.setFrom(mockQuery, 'public.users')

      expect(mockQuery.from).toBe('public.users')
    })

    it('should set table name with alias', () => {
      SelectMixin.setFrom(mockQuery, 'users u')

      expect(mockQuery.from).toBe('users u')
    })

    it('should overwrite existing from clause', () => {
      mockQuery.from = 'old_table'
      SelectMixin.setFrom(mockQuery, 'new_table')

      expect(mockQuery.from).toBe('new_table')
    })

    it('should throw error for empty table name', () => {
      expect(() => {
        SelectMixin.setFrom(mockQuery, '')
      }).toThrow(errorMessages.VALIDATION.EMPTY_TABLE)
    })

    it('should throw error for whitespace-only table name', () => {
      expect(() => {
        SelectMixin.setFrom(mockQuery, '   ')
      }).toThrow(errorMessages.VALIDATION.EMPTY_TABLE)
    })

    it('should set subquery', () => {
      const subquery: QuerySubQuery = {
        query: 'SELECT id FROM users WHERE active = true'
      }

      SelectMixin.setFrom(mockQuery, subquery)

      expect(mockQuery.from).toEqual(subquery)
    })

    it('should set subquery with alias', () => {
      const subquery: QuerySubQuery = {
        query: 'SELECT id FROM users WHERE active = true',
        alias: 'active_users'
      }

      SelectMixin.setFrom(mockQuery, subquery)

      expect(mockQuery.from).toEqual(subquery)
    })

    it('should throw error for subquery without query', () => {
      const invalidSubquery: QuerySubQuery = {
        query: ''
      }

      expect(() => {
        SelectMixin.setFrom(mockQuery, invalidSubquery)
      }).toThrow(errorMessages.VALIDATION.EMPTY_SUBQUERY)
    })

    it('should throw error for null subquery', () => {
      expect(() => {
        SelectMixin.setFrom(mockQuery, null as any)
      }).toThrow(errorMessages.VALIDATION.EMPTY_SUBQUERY)
    })
  })

  describe('setGroupBy', () => {
    it('should set single column group by', () => {
      SelectMixin.setGroupBy(mockQuery, 'category')

      expect(mockQuery.groupBy).toEqual(['category'])
    })

    it('should set multiple columns group by', () => {
      SelectMixin.setGroupBy(mockQuery, ['category', 'status'])

      expect(mockQuery.groupBy).toEqual(['category', 'status'])
    })

    it('should overwrite existing group by', () => {
      mockQuery.groupBy = ['old_column']
      SelectMixin.setGroupBy(mockQuery, 'new_column')

      expect(mockQuery.groupBy).toEqual(['new_column'])
    })

    it('should handle columns with table prefixes', () => {
      SelectMixin.setGroupBy(mockQuery, ['users.category', 'orders.status'])

      expect(mockQuery.groupBy).toEqual(['users.category', 'orders.status'])
    })
  })

  describe('addOrderBy', () => {
    it('should add order by with default direction', () => {
      SelectMixin.addOrderBy(mockQuery, 'name')

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'name',
        direction: 'ASC'
      })
    })

    it('should add order by with ASC direction', () => {
      SelectMixin.addOrderBy(mockQuery, 'created_at', 'ASC')

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'created_at',
        direction: 'ASC'
      })
    })

    it('should add order by with DESC direction', () => {
      SelectMixin.addOrderBy(mockQuery, 'updated_at', 'DESC')

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'updated_at',
        direction: 'DESC'
      })
    })

    it('should initialize orderBy array if undefined', () => {
      expect(mockQuery.orderBy).toBeUndefined()

      SelectMixin.addOrderBy(mockQuery, 'name')

      expect(mockQuery.orderBy).toBeDefined()
      expect(mockQuery.orderBy).toHaveLength(1)
    })

    it('should append to existing orderBy array', () => {
      SelectMixin.addOrderBy(mockQuery, 'name', 'ASC')
      SelectMixin.addOrderBy(mockQuery, 'created_at', 'DESC')

      expect(mockQuery.orderBy).toHaveLength(2)
      expect(mockQuery.orderBy![0].column).toBe('name')
      expect(mockQuery.orderBy![1].column).toBe('created_at')
    })

    it('should handle columns with table prefixes', () => {
      SelectMixin.addOrderBy(mockQuery, 'users.name', 'ASC')

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'users.name',
        direction: 'ASC'
      })
    })
  })

  describe('addOrderByExpression', () => {
    it('should add order by expression with default direction', () => {
      SelectMixin.addOrderByExpression(mockQuery, 'LENGTH(name)')

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'LENGTH(name)',
        direction: 'ASC',
        isExpression: true
      })
    })

    it('should add order by expression with ASC direction', () => {
      SelectMixin.addOrderByExpression(mockQuery, 'UPPER(name)', 'ASC')

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'UPPER(name)',
        direction: 'ASC',
        isExpression: true
      })
    })

    it('should add order by expression with DESC direction', () => {
      SelectMixin.addOrderByExpression(mockQuery, 'COUNT(*)', 'DESC')

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'COUNT(*)',
        direction: 'DESC',
        isExpression: true
      })
    })

    it('should add order by expression with parameters', () => {
      const params = ['John', 'Doe']
      SelectMixin.addOrderByExpression(mockQuery, 'CONCAT(?, ?)', 'ASC', params)

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'CONCAT(?, ?)',
        direction: 'ASC',
        isExpression: true,
        params
      })
    })

    it('should initialize orderBy array if undefined', () => {
      expect(mockQuery.orderBy).toBeUndefined()

      SelectMixin.addOrderByExpression(mockQuery, 'LENGTH(name)')

      expect(mockQuery.orderBy).toBeDefined()
      expect(mockQuery.orderBy).toHaveLength(1)
    })

    it('should append to existing orderBy array', () => {
      SelectMixin.addOrderByExpression(mockQuery, 'LENGTH(name)', 'ASC')
      SelectMixin.addOrderByExpression(mockQuery, 'COUNT(*)', 'DESC')

      expect(mockQuery.orderBy).toHaveLength(2)
      expect(mockQuery.orderBy![0].column).toBe('LENGTH(name)')
      expect(mockQuery.orderBy![1].column).toBe('COUNT(*)')
    })

    it('should handle complex expressions', () => {
      const params = [100]
      SelectMixin.addOrderByExpression(
        mockQuery,
        'CASE WHEN score > ? THEN 1 ELSE 0 END',
        'DESC',
        params
      )

      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.orderBy![0]).toEqual({
        column: 'CASE WHEN score > ? THEN 1 ELSE 0 END',
        direction: 'DESC',
        isExpression: true,
        params
      })
    })
  })

  describe('setLimit', () => {
    it('should set limit', () => {
      SelectMixin.setLimit(mockQuery, 10)

      expect(mockQuery.limit).toBe(10)
    })

    it('should overwrite existing limit', () => {
      mockQuery.limit = 5
      SelectMixin.setLimit(mockQuery, 20)

      expect(mockQuery.limit).toBe(20)
    })

    it('should handle zero limit', () => {
      SelectMixin.setLimit(mockQuery, 0)

      expect(mockQuery.limit).toBe(0)
    })

    it('should handle large limit', () => {
      SelectMixin.setLimit(mockQuery, 1000000)

      expect(mockQuery.limit).toBe(1000000)
    })
  })

  describe('setOffset', () => {
    it('should set offset', () => {
      SelectMixin.setOffset(mockQuery, 5)

      expect(mockQuery.offset).toBe(5)
    })

    it('should overwrite existing offset', () => {
      mockQuery.offset = 10
      SelectMixin.setOffset(mockQuery, 15)

      expect(mockQuery.offset).toBe(15)
    })

    it('should handle zero offset', () => {
      SelectMixin.setOffset(mockQuery, 0)

      expect(mockQuery.offset).toBe(0)
    })

    it('should handle large offset', () => {
      SelectMixin.setOffset(mockQuery, 100000)

      expect(mockQuery.offset).toBe(100000)
    })
  })

  describe('setLimitRaw', () => {
    it('should set raw limit expression', () => {
      SelectMixin.setLimitRaw(mockQuery, 'LIMIT ?', [10])

      expect(mockQuery.limitRaw).toEqual({
        sql: 'LIMIT ?',
        params: [10]
      })
    })

    it('should set raw limit expression without parameters', () => {
      SelectMixin.setLimitRaw(mockQuery, 'LIMIT 10')

      expect(mockQuery.limitRaw).toEqual({
        sql: 'LIMIT 10',
        params: []
      })
    })

    it('should overwrite existing limit raw', () => {
      mockQuery.limitRaw = { sql: 'LIMIT 5', params: [] }
      SelectMixin.setLimitRaw(mockQuery, 'LIMIT ?', [20])

      expect(mockQuery.limitRaw).toEqual({
        sql: 'LIMIT ?',
        params: [20]
      })
    })

    it('should handle complex limit expressions', () => {
      const params = [100, 50]
      SelectMixin.setLimitRaw(mockQuery, 'LIMIT GREATEST(?, ?)', params)

      expect(mockQuery.limitRaw).toEqual({
        sql: 'LIMIT GREATEST(?, ?)',
        params
      })
    })
  })

  describe('setOffsetRaw', () => {
    it('should set raw offset expression', () => {
      SelectMixin.setOffsetRaw(mockQuery, 'OFFSET ?', [5])

      expect(mockQuery.offsetRaw).toEqual({
        sql: 'OFFSET ?',
        params: [5]
      })
    })

    it('should set raw offset expression without parameters', () => {
      SelectMixin.setOffsetRaw(mockQuery, 'OFFSET 10')

      expect(mockQuery.offsetRaw).toEqual({
        sql: 'OFFSET 10',
        params: []
      })
    })

    it('should overwrite existing offset raw', () => {
      mockQuery.offsetRaw = { sql: 'OFFSET 5', params: [] }
      SelectMixin.setOffsetRaw(mockQuery, 'OFFSET ?', [15])

      expect(mockQuery.offsetRaw).toEqual({
        sql: 'OFFSET ?',
        params: [15]
      })
    })

    it('should handle complex offset expressions', () => {
      const params = [10, 2]
      SelectMixin.setOffsetRaw(mockQuery, 'OFFSET (? * ?)', params)

      expect(mockQuery.offsetRaw).toEqual({
        sql: 'OFFSET (? * ?)',
        params
      })
    })
  })

  describe('combined operations', () => {
    it('should handle multiple operations together', () => {
      SelectMixin.setColumns(mockQuery, 'id', 'name', 'email')
      SelectMixin.setDistinct(mockQuery)
      SelectMixin.setFrom(mockQuery, 'users')
      SelectMixin.setGroupBy(mockQuery, 'status')
      SelectMixin.addOrderBy(mockQuery, 'name', 'ASC')
      SelectMixin.setLimit(mockQuery, 10)
      SelectMixin.setOffset(mockQuery, 5)

      expect(mockQuery.columns).toEqual(['id', 'name', 'email'])
      expect(mockQuery.distinct).toBe(true)
      expect(mockQuery.from).toBe('users')
      expect(mockQuery.groupBy).toEqual(['status'])
      expect(mockQuery.orderBy).toHaveLength(1)
      expect(mockQuery.limit).toBe(10)
      expect(mockQuery.offset).toBe(5)
    })

    it('should handle raw limit and offset together', () => {
      SelectMixin.setLimitRaw(mockQuery, 'LIMIT ?', [10])
      SelectMixin.setOffsetRaw(mockQuery, 'OFFSET ?', [5])

      expect(mockQuery.limitRaw).toEqual({ sql: 'LIMIT ?', params: [10] })
      expect(mockQuery.offsetRaw).toEqual({ sql: 'OFFSET ?', params: [5] })
    })

    it('should handle mixed order by operations', () => {
      SelectMixin.addOrderBy(mockQuery, 'name', 'ASC')
      SelectMixin.addOrderByExpression(mockQuery, 'LENGTH(email)', 'DESC')
      SelectMixin.addOrderBy(mockQuery, 'created_at', 'DESC')

      expect(mockQuery.orderBy).toHaveLength(3)
      expect(mockQuery.orderBy![0].column).toBe('name')
      expect(mockQuery.orderBy![1].column).toBe('LENGTH(email)')
      expect(mockQuery.orderBy![2].column).toBe('created_at')
    })
  })
})
