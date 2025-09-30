/**
 * @fileoverview Unit tests for UpdateMixin
 * @description Tests the UPDATE query mixin functionality
 */

import { UpdateMixin } from '@builders/mixins/Update'
import type { QueryUpdate } from '@interfaces/index'

describe('UpdateMixin', () => {
  let query: QueryUpdate

  beforeEach(() => {
    query = {} as QueryUpdate
  })

  describe('setUpdateTable', () => {
    it('should set the table name for UPDATE operation', () => {
      UpdateMixin.setUpdateTable(query, 'users')

      expect(query.table).toBe('users')
    })

    it('should handle table names with underscores', () => {
      UpdateMixin.setUpdateTable(query, 'user_profiles')

      expect(query.table).toBe('user_profiles')
    })

    it('should overwrite existing table name', () => {
      query.table = 'old_table'

      UpdateMixin.setUpdateTable(query, 'new_table')

      expect(query.table).toBe('new_table')
    })
  })

  describe('setUpdateData', () => {
    it('should set the update data', () => {
      const data = { name: 'John', email: 'john@example.com' }

      UpdateMixin.setUpdateData(query, data)

      expect(query.set).toBe(data)
    })

    it('should handle empty data object', () => {
      UpdateMixin.setUpdateData(query, {})

      expect(query.set).toEqual({})
    })

    it('should handle data with various types', () => {
      const data = {
        name: 'John',
        age: 30,
        active: true,
        score: 95.5,
        tags: ['admin', 'user'],
        metadata: { created: '2024-01-01' }
      }

      UpdateMixin.setUpdateData(query, data)

      expect(query.set).toBe(data)
    })

    it('should overwrite existing data', () => {
      query.set = { old: 'value' }
      const newData = { new: 'value' }

      UpdateMixin.setUpdateData(query, newData)

      expect(query.set).toBe(newData)
    })
  })

  describe('buildUpdateClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`

    it('should build UPDATE clause', () => {
      query.table = 'users'

      const result = UpdateMixin.buildUpdateClause(query, mockEscapeIdentifier)

      expect(result).toBe('UPDATE "users"')
    })

    it('should use custom escape function', () => {
      query.table = 'users'
      const customEscape = (identifier: string): string => `[${identifier}]`

      const result = UpdateMixin.buildUpdateClause(query, customEscape)

      expect(result).toBe('UPDATE [users]')
    })
  })

  describe('buildSetClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`
    const mockAddParam = (value: unknown): string => `$${JSON.stringify(value)}`

    it('should build SET clause with single column', () => {
      query.set = { name: 'John' }

      const result = UpdateMixin.buildSetClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('SET "name" = $"John"')
    })

    it('should build SET clause with multiple columns', () => {
      query.set = { name: 'John', email: 'john@example.com', age: 30 }

      const result = UpdateMixin.buildSetClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('SET "name" = $"John", "email" = $"john@example.com", "age" = $30')
    })

    it('should handle empty SET data', () => {
      query.set = {}

      const result = UpdateMixin.buildSetClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('SET ')
    })

    it('should use custom escape and param functions', () => {
      query.set = { name: 'John' }
      const customEscape = (identifier: string): string => `[${identifier}]`
      const customAddParam = (value: unknown): string => `:${value}`

      const result = UpdateMixin.buildSetClause(query, customEscape, customAddParam)

      expect(result).toBe('SET [name] = :John')
    })

    it('should handle special characters in column names', () => {
      query.set = { 'user-name': 'John', user_email: 'john@example.com' }

      const result = UpdateMixin.buildSetClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('SET "user-name" = $"John", "user_email" = $"john@example.com"')
    })
  })
})
