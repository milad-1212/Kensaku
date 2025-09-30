/**
 * @fileoverview Unit tests for InsertMixin
 * @description Tests the INSERT query mixin functionality
 */

import { InsertMixin } from '@builders/mixins/Insert'
import type { QueryInsert } from '@interfaces/index'

describe('InsertMixin', () => {
  let query: QueryInsert

  beforeEach(() => {
    query = {} as QueryInsert
  })

  describe('setIntoTable', () => {
    it('should set the table name for INSERT operation', () => {
      InsertMixin.setIntoTable(query, 'users')

      expect(query.into).toBe('users')
    })

    it('should handle table names with underscores', () => {
      InsertMixin.setIntoTable(query, 'user_profiles')

      expect(query.into).toBe('user_profiles')
    })

    it('should overwrite existing table name', () => {
      query.into = 'old_table'

      InsertMixin.setIntoTable(query, 'new_table')

      expect(query.into).toBe('new_table')
    })
  })

  describe('setValues', () => {
    it('should set single row values', () => {
      const data = { name: 'John', email: 'john@example.com' }

      InsertMixin.setValues(query, data)

      expect(query.values).toBe(data)
    })

    it('should set batch values', () => {
      const data = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ]

      InsertMixin.setValues(query, data)

      expect(query.values).toBe(data)
    })

    it('should handle empty single row', () => {
      InsertMixin.setValues(query, {})

      expect(query.values).toEqual({})
    })

    it('should handle empty batch', () => {
      InsertMixin.setValues(query, [])

      expect(query.values).toEqual([])
    })
  })

  describe('buildInsertClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`

    it('should build INSERT INTO clause', () => {
      query.into = 'users'

      const result = InsertMixin.buildInsertClause(query, mockEscapeIdentifier)

      expect(result).toBe('INSERT INTO "users"')
    })

    it('should use custom escape function', () => {
      query.into = 'users'
      const customEscape = (identifier: string): string => `[${identifier}]`

      const result = InsertMixin.buildInsertClause(query, customEscape)

      expect(result).toBe('INSERT INTO [users]')
    })
  })

  describe('buildSingleValuesClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`
    const mockAddParam = (value: unknown): string => `$${JSON.stringify(value)}`

    it('should build VALUES clause for single row', () => {
      query.values = { name: 'John', email: 'john@example.com' }

      const result = InsertMixin.buildSingleValuesClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('("name", "email") VALUES ($"John", $"john@example.com")')
    })

    it('should handle single column', () => {
      query.values = { name: 'John' }

      const result = InsertMixin.buildSingleValuesClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('("name") VALUES ($"John")')
    })

    it('should throw error when values is null', () => {
      query.values = null as any

      expect(() => {
        InsertMixin.buildSingleValuesClause(query, mockEscapeIdentifier, mockAddParam)
      }).toThrow('Expected single row values for single VALUES clause')
    })

    it('should throw error when values is array', () => {
      query.values = [{ name: 'John' }]

      expect(() => {
        InsertMixin.buildSingleValuesClause(query, mockEscapeIdentifier, mockAddParam)
      }).toThrow('Expected single row values for single VALUES clause')
    })
  })

  describe('buildBatchValuesClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`
    const mockAddParam = (value: unknown): string => `$${JSON.stringify(value)}`

    it('should build VALUES clause for batch insert', () => {
      query.values = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ]

      const result = InsertMixin.buildBatchValuesClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe(
        '("name", "email") VALUES ($"John", $"john@example.com"), ($"Jane", $"jane@example.com")'
      )
    })

    it('should handle single row in batch', () => {
      query.values = [{ name: 'John' }]

      const result = InsertMixin.buildBatchValuesClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('("name") VALUES ($"John")')
    })

    it('should throw error when values is not array', () => {
      query.values = { name: 'John' } as any

      expect(() => {
        InsertMixin.buildBatchValuesClause(query, mockEscapeIdentifier, mockAddParam)
      }).toThrow('Expected array of values for batch VALUES clause')
    })

    it('should throw error when values array is empty', () => {
      query.values = []

      expect(() => {
        InsertMixin.buildBatchValuesClause(query, mockEscapeIdentifier, mockAddParam)
      }).toThrow('Expected array of values for batch VALUES clause')
    })
  })

  describe('buildValuesClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`
    const mockAddParam = (value: unknown): string => `$${JSON.stringify(value)}`

    it('should build single row VALUES clause', () => {
      query.values = { name: 'John' }

      const result = InsertMixin.buildValuesClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('("name") VALUES ($"John")')
    })

    it('should build batch VALUES clause', () => {
      query.values = [{ name: 'John' }, { name: 'Jane' }]

      const result = InsertMixin.buildValuesClause(query, mockEscapeIdentifier, mockAddParam)

      expect(result).toBe('("name") VALUES ($"John"), ($"Jane")')
    })

    it('should throw error when values is null', () => {
      query.values = null as any

      expect(() => {
        InsertMixin.buildValuesClause(query, mockEscapeIdentifier, mockAddParam)
      }).toThrow('No values provided for INSERT query')
    })

    it('should throw error when values is undefined', () => {
      query.values = undefined as any

      expect(() => {
        InsertMixin.buildValuesClause(query, mockEscapeIdentifier, mockAddParam)
      }).toThrow('No values provided for INSERT query')
    })
  })
})
