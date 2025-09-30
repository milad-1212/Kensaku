/**
 * @fileoverview Unit tests for ReturningClauseHelper
 * @description Tests the RETURNING clause helper functionality
 */

import { ReturningClauseHelper } from '@builders/helpers/ReturningClause'

describe('ReturningClauseHelper', () => {
  describe('setReturningColumns', () => {
    it('should set a single column as returning', () => {
      const query: { returning?: string[] } = {}
      ReturningClauseHelper.setReturningColumns(query, 'id')
      expect(query.returning).toEqual(['id'])
    })

    it('should set multiple columns as returning', () => {
      const query: { returning?: string[] } = {}

      ReturningClauseHelper.setReturningColumns(query, ['id', 'name', 'email'])

      expect(query.returning).toEqual(['id', 'name', 'email'])
    })

    it('should handle existing returning columns', () => {
      const query: { returning?: string[] } = { returning: ['created_at'] }

      ReturningClauseHelper.setReturningColumns(query, 'updated_at')

      expect(query.returning).toEqual(['updated_at'])
    })

    it('should handle empty array input', () => {
      const query: { returning?: string[] } = {}

      ReturningClauseHelper.setReturningColumns(query, [])

      expect(query.returning).toEqual([])
    })
  })

  describe('buildReturningClause', () => {
    const mockEscapeIdentifier = (identifier: string): string => `"${identifier}"`

    it('should build RETURNING clause with single column', () => {
      const result = ReturningClauseHelper.buildReturningClause(['id'], mockEscapeIdentifier)

      expect(result).toBe('RETURNING "id"')
    })

    it('should build RETURNING clause with multiple columns', () => {
      const result = ReturningClauseHelper.buildReturningClause(
        ['id', 'name', 'email'],
        mockEscapeIdentifier
      )

      expect(result).toBe('RETURNING "id", "name", "email"')
    })

    it('should handle empty columns array', () => {
      const result = ReturningClauseHelper.buildReturningClause([], mockEscapeIdentifier)

      expect(result).toBe('RETURNING ')
    })

    it('should use custom escape function', () => {
      const customEscape = (identifier: string): string => `[${identifier}]`

      const result = ReturningClauseHelper.buildReturningClause(['id', 'name'], customEscape)

      expect(result).toBe('RETURNING [id], [name]')
    })

    it('should handle columns with special characters', () => {
      const result = ReturningClauseHelper.buildReturningClause(
        ['user_id', 'created_at', 'is_active'],
        mockEscapeIdentifier
      )

      expect(result).toBe('RETURNING "user_id", "created_at", "is_active"')
    })
  })
})
