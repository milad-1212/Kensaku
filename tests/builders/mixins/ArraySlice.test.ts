/**
 * @fileoverview Unit tests for ArraySliceMixin
 * @description Tests the array slice operations mixin functionality
 */

import { ArraySliceMixin } from '@builders/mixins/ArraySlice'
import type { QuerySelect } from '@interfaces/index'

describe('ArraySliceMixin', () => {
  let query: QuerySelect

  beforeEach(() => {
    query = {} as QuerySelect
  })

  describe('addArraySlice', () => {
    it('should add array slice operation to query', () => {
      ArraySliceMixin.addArraySlice(query, 'tags', 1, 3)

      expect(query.arraySlices).toBeDefined()
      expect(query.arraySlices).toHaveLength(1)
      expect(query.arraySlices![0]).toEqual({
        column: 'tags',
        start: 1,
        end: 3
      })
    })

    it('should add array slice with alias', () => {
      ArraySliceMixin.addArraySlice(query, 'tags', 1, 3, 'first_tags')

      expect(query.arraySlices![0]).toEqual({
        column: 'tags',
        start: 1,
        end: 3,
        alias: 'first_tags'
      })
    })

    it('should add multiple array slices', () => {
      ArraySliceMixin.addArraySlice(query, 'tags', 1, 3)
      ArraySliceMixin.addArraySlice(query, 'categories', 2, 5, 'mid_categories')

      expect(query.arraySlices).toHaveLength(2)
      expect(query.arraySlices![0].column).toBe('tags')
      expect(query.arraySlices![1].column).toBe('categories')
      expect(query.arraySlices![1].alias).toBe('mid_categories')
    })

    it('should handle existing array slices', () => {
      query.arraySlices = [
        {
          column: 'existing',
          start: 1,
          end: 2
        }
      ]

      ArraySliceMixin.addArraySlice(query, 'new_column', 3, 4)

      expect(query.arraySlices).toHaveLength(2)
      expect(query.arraySlices![0].column).toBe('existing')
      expect(query.arraySlices![1].column).toBe('new_column')
    })

    it('should handle zero-based indexing', () => {
      ArraySliceMixin.addArraySlice(query, 'items', 0, 2)

      expect(query.arraySlices![0]).toEqual({
        column: 'items',
        start: 0,
        end: 2
      })
    })

    it('should handle negative indices', () => {
      ArraySliceMixin.addArraySlice(query, 'items', -3, -1)

      expect(query.arraySlices![0]).toEqual({
        column: 'items',
        start: -3,
        end: -1
      })
    })

    it('should handle large indices', () => {
      ArraySliceMixin.addArraySlice(query, 'large_array', 100, 200)

      expect(query.arraySlices![0]).toEqual({
        column: 'large_array',
        start: 100,
        end: 200
      })
    })
  })
})
