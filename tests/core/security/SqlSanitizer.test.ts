/**
 * @fileoverview Unit tests for SqlSanitizer
 * @description Tests the SQL sanitization functionality for security
 */

import { SqlSanitizer } from '@core/security/SqlSanitizer'
import type { DatabaseType } from '@interfaces/index'

describe('SqlSanitizer', () => {
  describe('sanitizeIdentifier', () => {
    it('should sanitize simple identifiers', () => {
      expect(SqlSanitizer.sanitizeIdentifier('users')).toBe('users')
      expect(SqlSanitizer.sanitizeIdentifier('user_id')).toBe('user_id')
      expect(SqlSanitizer.sanitizeIdentifier('table_name')).toBe('table_name')
    })

    it('should sanitize identifiers with dots', () => {
      expect(SqlSanitizer.sanitizeIdentifier('schema.users')).toBe('schema.users')
      expect(SqlSanitizer.sanitizeIdentifier('public.table_name')).toBe('public.table_name')
    })

    it('should sanitize function identifiers', () => {
      expect(SqlSanitizer.sanitizeIdentifier('COUNT(*)')).toBe('COUNT(*)')
      expect(SqlSanitizer.sanitizeIdentifier('SUM(amount)')).toBe('SUM(amount)')
      expect(SqlSanitizer.sanitizeIdentifier('AVG(score)')).toBe('AVG(score)')
    })

    it('should sanitize complex expressions', () => {
      expect(SqlSanitizer.sanitizeIdentifier('EXTRACT(year FROM date)')).toBe(
        'EXTRACT(year FROM date)'
      )
      expect(SqlSanitizer.sanitizeIdentifier('DATE(created_at)')).toBe('DATE(created_at)')
      expect(SqlSanitizer.sanitizeIdentifier('CASE WHEN active THEN 1 ELSE 0 END')).toBe(
        'CASE WHEN active THEN 1 ELSE 0 END'
      )
    })

    it('should throw error for invalid identifiers', () => {
      expect(() => {
        SqlSanitizer.sanitizeIdentifier('')
      }).toThrow('Invalid identifier')

      expect(() => {
        SqlSanitizer.sanitizeIdentifier('user;name')
      }).toThrow('Invalid identifier: user;name')

      expect(() => {
        SqlSanitizer.sanitizeIdentifier('user--name')
      }).toThrow('Invalid identifier: user--name')
    })

    it('should throw error for null/undefined identifiers', () => {
      expect(() => {
        SqlSanitizer.sanitizeIdentifier(null as any)
      }).toThrow('Invalid identifier')

      expect(() => {
        SqlSanitizer.sanitizeIdentifier(undefined as any)
      }).toThrow('Invalid identifier')
    })

    it('should throw error for non-string identifiers', () => {
      expect(() => {
        SqlSanitizer.sanitizeIdentifier(123 as any)
      }).toThrow('Invalid identifier')
    })
  })

  describe('sanitizeValue', () => {
    it('should handle null and undefined values', () => {
      expect(SqlSanitizer.sanitizeValue(null)).toBe(null)
      expect(SqlSanitizer.sanitizeValue(undefined)).toBe(null)
    })

    it('should sanitize string values', () => {
      expect(SqlSanitizer.sanitizeValue('hello')).toBe('hello')
      expect(SqlSanitizer.sanitizeValue('test string')).toBe('test string')
    })

    it('should escape backslashes in strings', () => {
      expect(SqlSanitizer.sanitizeValue('path\\to\\file')).toBe('path\\\\to\\\\file')
    })

    it('should escape single quotes in strings', () => {
      expect(SqlSanitizer.sanitizeValue("it's a test")).toBe("it''s a test")
    })

    it('should escape double quotes in strings', () => {
      expect(SqlSanitizer.sanitizeValue('say "hello"')).toBe('say ""hello""')
    })

    it('should remove null characters', () => {
      expect(SqlSanitizer.sanitizeValue('test\0string')).toBe('teststring')
    })

    it('should filter out control characters', () => {
      expect(SqlSanitizer.sanitizeValue('test\x01string')).toBe('teststring')
      expect(SqlSanitizer.sanitizeValue('test\x7Fstring')).toBe('teststring')
    })

    it('should preserve numbers', () => {
      expect(SqlSanitizer.sanitizeValue(123)).toBe(123)
      expect(SqlSanitizer.sanitizeValue(45.67)).toBe(45.67)
    })

    it('should preserve booleans', () => {
      expect(SqlSanitizer.sanitizeValue(true)).toBe(true)
      expect(SqlSanitizer.sanitizeValue(false)).toBe(false)
    })

    it('should preserve arrays', () => {
      const arr = [1, 2, 3]
      expect(SqlSanitizer.sanitizeValue(arr)).toEqual(arr)
    })

    it('should preserve objects', () => {
      const obj = { key: 'value' }
      expect(SqlSanitizer.sanitizeValue(obj)).toBe('{"key":"value"}')
    })
  })

  describe('escapeLikePattern', () => {
    it('should escape LIKE pattern characters', () => {
      expect(SqlSanitizer.escapeLikePattern('test%pattern')).toBe('test\\%pattern')
      expect(SqlSanitizer.escapeLikePattern('test_pattern')).toBe('test\\_pattern')
      expect(SqlSanitizer.escapeLikePattern('test%_pattern')).toBe('test\\%\\_pattern')
    })

    it('should handle patterns without special characters', () => {
      expect(SqlSanitizer.escapeLikePattern('simple text')).toBe('simple text')
    })

    it('should handle empty patterns', () => {
      expect(SqlSanitizer.escapeLikePattern('')).toBe('')
    })
  })

  describe('validateIdentifier', () => {
    it('should validate simple identifiers', () => {
      expect(SqlSanitizer.validateIdentifier('users')).toBe(true)
      expect(SqlSanitizer.validateIdentifier('user_id')).toBe(true)
      expect(SqlSanitizer.validateIdentifier('table_name')).toBe(true)
    })

    it('should validate identifiers with dots', () => {
      expect(SqlSanitizer.validateIdentifier('schema.users')).toBe(true)
      expect(SqlSanitizer.validateIdentifier('public.table_name')).toBe(true)
    })

    it('should reject invalid identifiers', () => {
      expect(SqlSanitizer.validateIdentifier('')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('user;name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('user--name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('user name')).toBe(false)
    })

    it('should reject identifiers with special characters', () => {
      expect(SqlSanitizer.validateIdentifier('user@name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('user#name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('user$name')).toBe(false)
    })
  })

  describe('buildParameterizedQuery', () => {
    it('should build parameterized query', () => {
      const sql = 'SELECT * FROM users WHERE id = ? AND name = ?'
      const params = [1, 'John']

      const result = SqlSanitizer.buildParameterizedQuery(sql, params)

      expect(result.sql).toBe(sql)
      expect(result.params).toEqual([1, 'John'])
    })

    it('should sanitize parameters', () => {
      const sql = 'SELECT * FROM users WHERE name = ?'
      const params = ["it's a test"]

      const result = SqlSanitizer.buildParameterizedQuery(sql, params)

      expect(result.sql).toBe(sql)
      expect(result.params).toEqual(["it''s a test"])
    })

    it('should handle empty parameters', () => {
      const sql = 'SELECT * FROM users'
      const params: unknown[] = []

      const result = SqlSanitizer.buildParameterizedQuery(sql, params)

      expect(result.sql).toBe(sql)
      expect(result.params).toEqual([])
    })
  })

  describe('sanitizeForDatabase', () => {
    it('should sanitize for PostgreSQL', () => {
      const result = SqlSanitizer.sanitizeForDatabase("test'value", 'postgres')
      expect(result).toBe("test''value")
    })

    it('should sanitize for MySQL', () => {
      const result = SqlSanitizer.sanitizeForDatabase("test'value", 'mysql')
      expect(result).toBe("test''value")
    })

    it('should sanitize for SQLite', () => {
      const result = SqlSanitizer.sanitizeForDatabase("test'value", 'sqlite')
      expect(result).toBe("test''value")
    })

    it('should handle non-string values', () => {
      expect(SqlSanitizer.sanitizeForDatabase(123, 'postgres')).toBe(123)
      expect(SqlSanitizer.sanitizeForDatabase(true, 'mysql')).toBe(true)
      expect(SqlSanitizer.sanitizeForDatabase(null, 'sqlite')).toBe(null)
    })
  })
})
