/**
 * @fileoverview Unit tests for DeleteMixin
 * @description Tests the DELETE query mixin functionality
 */

import { DeleteMixin } from '@builders/mixins/Delete'
import type { QueryDelete } from '@interfaces/index'

describe('DeleteMixin', () => {
  let query: QueryDelete

  beforeEach(() => {
    query = {} as QueryDelete
  })

  describe('setDeleteFrom', () => {
    it('should set the table name for DELETE operation', () => {
      DeleteMixin.setDeleteFrom(query, 'users')

      expect(query.from).toBe('users')
    })

    it('should handle table names with underscores', () => {
      DeleteMixin.setDeleteFrom(query, 'user_profiles')

      expect(query.from).toBe('user_profiles')
    })

    it('should handle table names with numbers', () => {
      DeleteMixin.setDeleteFrom(query, 'orders_2024')

      expect(query.from).toBe('orders_2024')
    })

    it('should overwrite existing table name', () => {
      query.from = 'old_table'

      DeleteMixin.setDeleteFrom(query, 'new_table')

      expect(query.from).toBe('new_table')
    })

    it('should handle empty table name', () => {
      DeleteMixin.setDeleteFrom(query, '')

      expect(query.from).toBe('')
    })
  })

  describe('buildDeleteClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`

    it('should build DELETE FROM clause', () => {
      query.from = 'users'

      const result = DeleteMixin.buildDeleteClause(query, mockEscapeIdentifier)

      expect(result).toBe('DELETE FROM "users"')
    })

    it('should build DELETE FROM clause with escaped table name', () => {
      query.from = 'user_profiles'

      const result = DeleteMixin.buildDeleteClause(query, mockEscapeIdentifier)

      expect(result).toBe('DELETE FROM "user_profiles"')
    })

    it('should use custom escape function', () => {
      query.from = 'users'
      const customEscape = (identifier: string): string => `[${identifier}]`

      const result = DeleteMixin.buildDeleteClause(query, customEscape)

      expect(result).toBe('DELETE FROM [users]')
    })

    it('should handle table names with special characters', () => {
      query.from = 'user-data'

      const result = DeleteMixin.buildDeleteClause(query, mockEscapeIdentifier)

      expect(result).toBe('DELETE FROM "user-data"')
    })

    it('should handle empty table name', () => {
      query.from = ''

      const result = DeleteMixin.buildDeleteClause(query, mockEscapeIdentifier)

      expect(result).toBe('DELETE FROM ""')
    })
  })
})
