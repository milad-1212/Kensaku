/**
 * @fileoverview Unit tests for ArrayMixin
 * @description Tests the array operations mixin functionality
 */

import { ArrayMixin } from '@builders/mixins/Array'
import type { QuerySelect, QueryArrayType, QueryArrayFunctionName } from '@interfaces/index'

describe('ArrayMixin', () => {
  let query: QuerySelect

  beforeEach(() => {
    query = {} as QuerySelect
  })

  describe('addArrayOperation', () => {
    it('should add array operation to query', () => {
      ArrayMixin.addArrayOperation(query, 'tags', 'CONTAINS', ['javascript', 'typescript'])

      expect(query.arrayOperations).toBeDefined()
      expect(query.arrayOperations).toHaveLength(1)
      expect(query.arrayOperations![0]).toEqual({
        column: 'tags',
        operator: 'CONTAINS',
        value: ['javascript', 'typescript']
      })
    })

    it('should add multiple array operations', () => {
      ArrayMixin.addArrayOperation(query, 'tags', 'CONTAINS', ['javascript'])
      ArrayMixin.addArrayOperation(query, 'categories', 'OVERLAPS', ['tech', 'programming'])

      expect(query.arrayOperations).toHaveLength(2)
      expect(query.arrayOperations![0].column).toBe('tags')
      expect(query.arrayOperations![1].column).toBe('categories')
    })

    it('should handle existing array operations', () => {
      query.arrayOperations = [
        {
          column: 'existing',
          operator: 'CONTAINS',
          value: ['old']
        }
      ]

      ArrayMixin.addArrayOperation(query, 'new_column', 'CONTAINS', ['new'])

      expect(query.arrayOperations).toHaveLength(2)
      expect(query.arrayOperations![0].column).toBe('existing')
      expect(query.arrayOperations![1].column).toBe('new_column')
    })

    it('should handle string values', () => {
      ArrayMixin.addArrayOperation(query, 'path', 'CONTAINS', 'substring')

      expect(query.arrayOperations![0]).toEqual({
        column: 'path',
        operator: 'CONTAINS',
        value: 'substring'
      })
    })
  })

  describe('addArrayFunction', () => {
    it('should add array function to query', () => {
      ArrayMixin.addArrayFunction(query, 'ARRAY_LENGTH', 'tags')

      expect(query.arrayFunctions).toBeDefined()
      expect(query.arrayFunctions).toHaveLength(1)
      expect(query.arrayFunctions![0]).toEqual({
        function: 'ARRAY_LENGTH',
        column: 'tags'
      })
    })

    it('should add array function with alias', () => {
      ArrayMixin.addArrayFunction(query, 'ARRAY_LENGTH', 'tags', 'tag_count')

      expect(query.arrayFunctions![0]).toEqual({
        function: 'ARRAY_LENGTH',
        column: 'tags',
        alias: 'tag_count'
      })
    })

    it('should add array function with orderBy', () => {
      ArrayMixin.addArrayFunction(query, 'ARRAY_AGG', 'name', undefined, ['id', 'created_at'])

      expect(query.arrayFunctions![0]).toEqual({
        function: 'ARRAY_AGG',
        column: 'name',
        orderBy: ['id', 'created_at']
      })
    })

    it('should add array function with both alias and orderBy', () => {
      ArrayMixin.addArrayFunction(query, 'ARRAY_AGG', 'name', 'names_array', ['id'])

      expect(query.arrayFunctions![0]).toEqual({
        function: 'ARRAY_AGG',
        column: 'name',
        alias: 'names_array',
        orderBy: ['id']
      })
    })

    it('should add multiple array functions', () => {
      ArrayMixin.addArrayFunction(query, 'ARRAY_LENGTH', 'tags')
      ArrayMixin.addArrayFunction(query, 'ARRAY_AGG', 'names')

      expect(query.arrayFunctions).toHaveLength(2)
      expect(query.arrayFunctions![0].function).toBe('ARRAY_LENGTH')
      expect(query.arrayFunctions![1].function).toBe('ARRAY_AGG')
    })

    it('should handle existing array functions', () => {
      query.arrayFunctions = [
        {
          function: 'ARRAY_LENGTH',
          column: 'existing'
        }
      ]

      ArrayMixin.addArrayFunction(query, 'ARRAY_AGG', 'new_column')

      expect(query.arrayFunctions).toHaveLength(2)
      expect(query.arrayFunctions![0].column).toBe('existing')
      expect(query.arrayFunctions![1].column).toBe('new_column')
    })
  })
})
