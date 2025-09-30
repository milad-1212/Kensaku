/**
 * @fileoverview Unit tests for HavingMixin
 * @description Tests the HAVING clause mixin functionality
 */

import { HavingMixin } from '@builders/mixins/Having'
import type { QuerySelect, QueryWhereCondition } from '@interfaces/index'

describe('HavingMixin', () => {
  let query: QuerySelect

  beforeEach(() => {
    query = {} as QuerySelect
  })

  describe('addHavingCondition', () => {
    it('should add a HAVING condition to the query', () => {
      HavingMixin.addHavingCondition(query, 'COUNT(*)', '>', 5)

      expect(query.having).toBeDefined()
      expect(query.having).toHaveLength(1)
      expect(query.having![0]).toEqual({
        column: 'COUNT(*)',
        operator: '>',
        value: 5
      })
    })

    it('should add multiple HAVING conditions', () => {
      HavingMixin.addHavingCondition(query, 'COUNT(*)', '>', 5)
      HavingMixin.addHavingCondition(query, 'SUM(amount)', '>=', 1000)

      expect(query.having).toHaveLength(2)
      expect(query.having![0].column).toBe('COUNT(*)')
      expect(query.having![1].column).toBe('SUM(amount)')
    })

    it('should handle existing HAVING conditions', () => {
      query.having = [
        {
          column: 'existing',
          operator: '=',
          value: 1
        }
      ]

      HavingMixin.addHavingCondition(query, 'new_column', '>', 10)

      expect(query.having).toHaveLength(2)
      expect(query.having![0].column).toBe('existing')
      expect(query.having![1].column).toBe('new_column')
    })

    it('should handle various operators', () => {
      HavingMixin.addHavingCondition(query, 'COUNT(*)', '=', 10)
      HavingMixin.addHavingCondition(query, 'AVG(score)', '!=', 0)
      HavingMixin.addHavingCondition(query, 'MAX(price)', '<', 100)
      HavingMixin.addHavingCondition(query, 'MIN(date)', '>=', '2024-01-01')
      HavingMixin.addHavingCondition(query, 'SUM(total)', '<=', 5000)

      expect(query.having).toHaveLength(5)
      expect(query.having![0].operator).toBe('=')
      expect(query.having![1].operator).toBe('!=')
      expect(query.having![2].operator).toBe('<')
      expect(query.having![3].operator).toBe('>=')
      expect(query.having![4].operator).toBe('<=')
    })

    it('should handle string values', () => {
      HavingMixin.addHavingCondition(query, 'category', '=', 'electronics')

      expect(query.having![0]).toEqual({
        column: 'category',
        operator: '=',
        value: 'electronics'
      })
    })

    it('should handle boolean values', () => {
      HavingMixin.addHavingCondition(query, 'is_active', '=', true)

      expect(query.having![0]).toEqual({
        column: 'is_active',
        operator: '=',
        value: true
      })
    })

    it('should handle null values', () => {
      HavingMixin.addHavingCondition(query, 'deleted_at', 'IS NULL', null)

      expect(query.having![0]).toEqual({
        column: 'deleted_at',
        operator: 'IS NULL',
        value: null
      })
    })
  })

  describe('buildHavingClause', () => {
    const mockBuildWhereConditions = (conditions: QueryWhereCondition[]): string => {
      return conditions.map(c => `${c.column} ${c.operator} ${c.value}`).join(' AND ')
    }

    it('should build HAVING clause with conditions', () => {
      query.having = [
        {
          column: 'COUNT(*)',
          operator: '>',
          value: 5
        }
      ]

      const result = HavingMixin.buildHavingClause(query, mockBuildWhereConditions)

      expect(result).toBe('HAVING COUNT(*) > 5')
    })

    it('should build HAVING clause with multiple conditions', () => {
      query.having = [
        { column: 'COUNT(*)', operator: '>', value: 5 },
        { column: 'SUM(amount)', operator: '>=', value: 1000 }
      ]

      const result = HavingMixin.buildHavingClause(query, mockBuildWhereConditions)

      expect(result).toBe('HAVING COUNT(*) > 5 AND SUM(amount) >= 1000')
    })

    it('should return empty string when no HAVING conditions', () => {
      const result = HavingMixin.buildHavingClause(query, mockBuildWhereConditions)

      expect(result).toBe('')
    })

    it('should return empty string when HAVING array is empty', () => {
      query.having = []

      const result = HavingMixin.buildHavingClause(query, mockBuildWhereConditions)

      expect(result).toBe('')
    })

    it('should use custom buildWhereConditions function', () => {
      query.having = [
        {
          column: 'COUNT(*)',
          operator: '>',
          value: 5
        }
      ]

      const customBuilder = (conditions: QueryWhereCondition[]): string => {
        return conditions.map(c => `(${c.column} ${c.operator} ${c.value})`).join(' OR ')
      }

      const result = HavingMixin.buildHavingClause(query, customBuilder)

      expect(result).toBe('HAVING (COUNT(*) > 5)')
    })
  })
})
