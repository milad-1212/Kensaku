/**
 * @fileoverview Unit tests for CteMixin
 * @description Tests the Common Table Expression (CTE) mixin functionality
 */

import { CteMixin } from '@builders/mixins/Cte'
import type { QuerySelect } from '@interfaces/index'

describe('CteMixin', () => {
  let query: QuerySelect
  let cteQuery: QuerySelect

  beforeEach(() => {
    query = {} as QuerySelect
    cteQuery = {} as QuerySelect
  })

  describe('addCte', () => {
    it('should add a CTE to the query', () => {
      CteMixin.addCte(query, 'user_stats', cteQuery)

      expect(query.ctes).toBeDefined()
      expect(query.ctes).toHaveLength(1)
      expect(query.ctes![0]).toEqual({
        name: 'user_stats',
        query: cteQuery,
        recursive: false
      })
    })

    it('should add multiple CTEs', () => {
      const cteQuery2 = {} as QuerySelect

      CteMixin.addCte(query, 'user_stats', cteQuery)
      CteMixin.addCte(query, 'order_summary', cteQuery2)

      expect(query.ctes).toHaveLength(2)
      expect(query.ctes![0].name).toBe('user_stats')
      expect(query.ctes![1].name).toBe('order_summary')
      expect(query.ctes![0].recursive).toBe(false)
      expect(query.ctes![1].recursive).toBe(false)
    })

    it('should handle existing CTEs', () => {
      query.ctes = [
        {
          name: 'existing_cte',
          query: {} as QuerySelect,
          recursive: false
        }
      ]

      CteMixin.addCte(query, 'new_cte', cteQuery)

      expect(query.ctes).toHaveLength(2)
      expect(query.ctes![0].name).toBe('existing_cte')
      expect(query.ctes![1].name).toBe('new_cte')
    })

    it('should handle CTE names with underscores', () => {
      CteMixin.addCte(query, 'user_order_stats', cteQuery)

      expect(query.ctes![0].name).toBe('user_order_stats')
    })

    it('should handle CTE names with numbers', () => {
      CteMixin.addCte(query, 'stats_2024', cteQuery)

      expect(query.ctes![0].name).toBe('stats_2024')
    })
  })

  describe('addRecursiveCte', () => {
    it('should add a recursive CTE to the query', () => {
      CteMixin.addRecursiveCte(query, 'hierarchy', cteQuery)

      expect(query.ctes).toBeDefined()
      expect(query.ctes).toHaveLength(1)
      expect(query.ctes![0]).toEqual({
        name: 'hierarchy',
        query: cteQuery,
        recursive: true
      })
    })

    it('should add multiple recursive CTEs', () => {
      const cteQuery2 = {} as QuerySelect

      CteMixin.addRecursiveCte(query, 'hierarchy', cteQuery)
      CteMixin.addRecursiveCte(query, 'tree_structure', cteQuery2)

      expect(query.ctes).toHaveLength(2)
      expect(query.ctes![0].name).toBe('hierarchy')
      expect(query.ctes![1].name).toBe('tree_structure')
      expect(query.ctes![0].recursive).toBe(true)
      expect(query.ctes![1].recursive).toBe(true)
    })

    it('should handle existing CTEs when adding recursive', () => {
      query.ctes = [
        {
          name: 'existing_cte',
          query: {} as QuerySelect,
          recursive: false
        }
      ]

      CteMixin.addRecursiveCte(query, 'recursive_cte', cteQuery)

      expect(query.ctes).toHaveLength(2)
      expect(query.ctes![0].recursive).toBe(false)
      expect(query.ctes![1].recursive).toBe(true)
    })

    it('should mix regular and recursive CTEs', () => {
      const cteQuery2 = {} as QuerySelect

      CteMixin.addCte(query, 'regular_cte', cteQuery)
      CteMixin.addRecursiveCte(query, 'recursive_cte', cteQuery2)

      expect(query.ctes).toHaveLength(2)
      expect(query.ctes![0].recursive).toBe(false)
      expect(query.ctes![1].recursive).toBe(true)
    })
  })
})
