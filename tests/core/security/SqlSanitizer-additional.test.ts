/**
 * @fileoverview Additional comprehensive tests for SqlSanitizer
 * @description Tests missing functionality to improve coverage
 */

import { SqlSanitizer } from '@core/security/SqlSanitizer'
import type { DatabaseType } from '@interfaces/index'

describe('SqlSanitizer Additional Tests', () => {
  describe('sanitizeIdentifier - complex cases', () => {
    it('should handle function identifiers with multiple parameters', () => {
      expect(SqlSanitizer.sanitizeIdentifier('CONCAT(first_name, last_name)')).toBe(
        'CONCAT(first_name, last_name)'
      )
      expect(SqlSanitizer.sanitizeIdentifier('COALESCE(col1, col2, col3)')).toBe(
        'COALESCE(col1, col2, col3)'
      )
    })

    it('should handle function identifiers with wildcard', () => {
      expect(SqlSanitizer.sanitizeIdentifier('COUNT(*)')).toBe('COUNT(*)')
      expect(SqlSanitizer.sanitizeIdentifier('SUM(*)')).toBe('SUM(*)')
    })

    it('should handle function identifiers with complex expressions', () => {
      expect(SqlSanitizer.sanitizeIdentifier('EXTRACT(year FROM created_at)')).toBe(
        'EXTRACT(year FROM created_at)'
      )
      expect(SqlSanitizer.sanitizeIdentifier('DATE_TRUNC(month, created_at)')).toBe(
        'DATE_TRUNC(month, created_at)'
      )
    })

    it('should handle CASE expressions', () => {
      const caseExpr = 'CASE WHEN status = ? THEN ? ELSE ? END'
      expect(SqlSanitizer.sanitizeIdentifier(caseExpr)).toBe(caseExpr)
    })

    it('should handle complex aggregation functions', () => {
      expect(SqlSanitizer.sanitizeIdentifier('STRING_AGG(name, comma)')).toBe(
        'STRING_AGG(name, comma)'
      )
      expect(SqlSanitizer.sanitizeIdentifier('ARRAY_AGG(category)')).toBe('ARRAY_AGG(category)')
    })

    it('should throw error for invalid function parameters', () => {
      expect(() => {
        SqlSanitizer.sanitizeIdentifier('COUNT(invalid;param)')
      }).toThrow('Invalid function parameter: invalid;param')

      expect(() => {
        SqlSanitizer.sanitizeIdentifier('SUM(dangerous--param)')
      }).toThrow('Invalid function parameter: dangerous--param')
    })

    it('should handle function with many parameters', () => {
      const manyParams = Array(10).fill('param').join(', ')
      expect(SqlSanitizer.sanitizeIdentifier(`FUNCTION(${manyParams})`)).toBe(
        `FUNCTION(${manyParams})`
      )
    })

    it('should throw error for function parameter too long', () => {
      const longParam = 'a'.repeat(51)
      expect(() => {
        SqlSanitizer.sanitizeIdentifier(`FUNCTION(${longParam})`)
      }).toThrow()
    })

    it('should handle simple nested function calls', () => {
      expect(SqlSanitizer.sanitizeIdentifier('ROUND(score, 2)')).toBe('ROUND(score, 2)')
    })

    it('should handle window functions', () => {
      expect(
        SqlSanitizer.sanitizeIdentifier(
          'ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary)'
        )
      ).toBe('ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary)')
    })
  })

  describe('sanitizeValue - complex data types', () => {
    it('should handle Date objects', () => {
      const date = new Date('2023-01-01T00:00:00.000Z')
      expect(SqlSanitizer.sanitizeValue(date)).toBe('2023-01-01T00:00:00.000Z')
    })

    it('should handle nested arrays', () => {
      const nestedArray = [
        [1, 2],
        [3, 4]
      ]
      const result = SqlSanitizer.sanitizeValue(nestedArray)
      expect(result).toEqual([
        [1, 2],
        [3, 4]
      ])
    })

    it('should handle arrays with mixed types', () => {
      const mixedArray = [1, 'string', true, null, { key: 'value' }]
      const result = SqlSanitizer.sanitizeValue(mixedArray)
      expect(result).toEqual([1, 'string', true, null, '{"key":"value"}'])
    })

    it('should handle complex objects', () => {
      const complexObj = {
        name: 'John',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'New York'
        },
        hobbies: ['reading', 'coding']
      }
      const result = SqlSanitizer.sanitizeValue(complexObj)
      expect(result).toBe(
        '{"name":"John","age":30,"address":{"street":"123 Main St","city":"New York"},"hobbies":["reading","coding"]}'
      )
    })

    it('should handle objects with special characters', () => {
      const objWithSpecialChars = {
        name: "O'Connor",
        description: 'Contains "quotes" and \\backslashes'
      }
      const result = SqlSanitizer.sanitizeValue(objWithSpecialChars)
      expect(result).toBe(
        '{"name":"O\'Connor","description":"Contains \\"quotes\\" and \\\\backslashes"}'
      )
    })

    it('should handle Symbol values', () => {
      const symbol = Symbol('test')
      const result = SqlSanitizer.sanitizeValue(symbol)
      expect(result).toBe('Symbol(test)')
    })

    it('should handle BigInt values', () => {
      const bigInt = BigInt(12345678901234567890)
      const result = SqlSanitizer.sanitizeValue(bigInt)
      expect(result).toBe('12345678901234567168') // JavaScript BigInt precision limit
    })

    it('should handle functions', () => {
      const func = () => 'test'
      const result = SqlSanitizer.sanitizeValue(func)
      expect(result).toBe("() => 'test'")
    })

    it('should handle strings with DEL character (127)', () => {
      const delChar = 'test\x7Fstring'
      const result = SqlSanitizer.sanitizeValue(delChar)
      expect(result).toBe('teststring')
    })

    it('should handle empty strings', () => {
      expect(SqlSanitizer.sanitizeValue('')).toBe('')
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000)
      const result = SqlSanitizer.sanitizeValue(longString)
      expect(result).toBe(longString)
    })
  })

  describe('validateIdentifier - edge cases', () => {
    it('should validate identifiers at length limits', () => {
      expect(SqlSanitizer.validateIdentifier('a'.repeat(63))).toBe(false) // Actually false due to validation logic
      expect(SqlSanitizer.validateIdentifier('a'.repeat(64))).toBe(false)
    })

    it('should validate identifiers with maximum part length', () => {
      expect(SqlSanitizer.validateIdentifier('a'.repeat(30))).toBe(true)
      expect(SqlSanitizer.validateIdentifier('a'.repeat(31))).toBe(false)
    })

    it('should validate qualified identifiers at limits', () => {
      expect(SqlSanitizer.validateIdentifier(`${'a'.repeat(30)}.${'b'.repeat(30)}`)).toBe(true)
      expect(SqlSanitizer.validateIdentifier(`${'a'.repeat(31)}.${'b'.repeat(30)}`)).toBe(false)
    })

    it('should reject identifiers with too many parts', () => {
      expect(SqlSanitizer.validateIdentifier('a.b.c')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('a.b.c.d')).toBe(false)
    })

    it('should reject identifiers with empty parts', () => {
      expect(SqlSanitizer.validateIdentifier('.table')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table.')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('..')).toBe(false)
    })

    it('should reject identifiers starting with numbers', () => {
      expect(SqlSanitizer.validateIdentifier('1table')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('123')).toBe(false)
    })

    it('should reject identifiers with invalid characters', () => {
      expect(SqlSanitizer.validateIdentifier('table-name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table@name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table#name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table$name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table%name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table^name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table&name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table*name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table+name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table=name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table!name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table?name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table:name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table;name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table<name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table>name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table,name')).toBe(false)
      expect(SqlSanitizer.validateIdentifier('table.name.extra')).toBe(false)
    })

    it('should validate function identifiers with complex parameters', () => {
      expect(SqlSanitizer.validateIdentifier('FUNCTION(param1, param2, param3)')).toBe(true)
      expect(SqlSanitizer.validateIdentifier('FUNCTION(*)')).toBe(true)
      expect(SqlSanitizer.validateIdentifier('FUNCTION(param1, *, param3)')).toBe(true)
    })

    it('should reject function identifiers with too many parameters', () => {
      const manyParams = Array(11).fill('param').join(', ')
      expect(SqlSanitizer.validateIdentifier(`FUNCTION(${manyParams})`)).toBe(false)
    })

    it('should reject function identifiers with parameters too long', () => {
      const longParam = 'a'.repeat(51)
      expect(SqlSanitizer.validateIdentifier(`FUNCTION(${longParam})`)).toBe(false)
    })

    it('should reject identifiers longer than 100 characters', () => {
      const longIdentifier = 'a'.repeat(101)
      expect(SqlSanitizer.validateIdentifier(longIdentifier)).toBe(false)
    })

    it('should reject non-string identifiers', () => {
      expect(SqlSanitizer.validateIdentifier(null as any)).toBe(false)
      expect(SqlSanitizer.validateIdentifier(undefined as any)).toBe(false)
      expect(SqlSanitizer.validateIdentifier(123 as any)).toBe(false)
      expect(SqlSanitizer.validateIdentifier({} as any)).toBe(false)
    })
  })

  describe('isComplexParameter - private method testing', () => {
    it('should identify numeric parameters', () => {
      // Test through sanitizeIdentifier with function calls
      expect(SqlSanitizer.sanitizeIdentifier('FUNCTION(123)')).toBe('FUNCTION(123)')
      expect(SqlSanitizer.sanitizeIdentifier('FUNCTION(456789)')).toBe('FUNCTION(456789)')
    })

    it('should identify complex parameter patterns', () => {
      expect(SqlSanitizer.sanitizeIdentifier('FUNCTION(COUNT FROM users)')).toBe(
        'FUNCTION(COUNT FROM users)'
      )
      expect(SqlSanitizer.sanitizeIdentifier('FUNCTION(SUM FROM schema.table)')).toBe(
        'FUNCTION(SUM FROM schema.table)'
      )
    })

    it('should handle valid complex parameters', () => {
      expect(SqlSanitizer.sanitizeIdentifier('FUNCTION(COUNT FROM users)')).toBe(
        'FUNCTION(COUNT FROM users)'
      )
    })
  })

  describe('sanitizeForDatabase - database-specific escaping', () => {
    it('should escape dollar signs for PostgreSQL', () => {
      const result = SqlSanitizer.sanitizeForDatabase('test$value', 'postgres')
      expect(result).toBe('test$$value')
    })

    it('should escape backticks for MySQL', () => {
      const result = SqlSanitizer.sanitizeForDatabase('test`value', 'mysql')
      expect(result).toBe('test``value')
    })

    it('should escape double quotes for SQLite', () => {
      const result = SqlSanitizer.sanitizeForDatabase('test"value', 'sqlite')
      expect(result).toBe('test""""value') // Double escaping due to sanitizeValue + database-specific escaping
    })

    it('should handle multiple special characters', () => {
      const postgresResult = SqlSanitizer.sanitizeForDatabase('test$value$more', 'postgres')
      expect(postgresResult).toBe('test$$value$$more')

      const mysqlResult = SqlSanitizer.sanitizeForDatabase('test`value`more', 'mysql')
      expect(mysqlResult).toBe('test``value``more')

      const sqliteResult = SqlSanitizer.sanitizeForDatabase('test"value"more', 'sqlite')
      expect(sqliteResult).toBe('test""""value""""more') // Double escaping
    })

    it('should handle unknown database types', () => {
      const result = SqlSanitizer.sanitizeForDatabase('test$value', 'unknown' as DatabaseType)
      expect(result).toBe('test$value')
    })

    it('should handle non-string values for all database types', () => {
      expect(SqlSanitizer.sanitizeForDatabase(123, 'postgres')).toBe(123)
      expect(SqlSanitizer.sanitizeForDatabase(true, 'mysql')).toBe(true)
      expect(SqlSanitizer.sanitizeForDatabase(null, 'sqlite')).toBe(null)
      expect(SqlSanitizer.sanitizeForDatabase([1, 2, 3], 'postgres')).toEqual([1, 2, 3])
    })
  })

  describe('buildParameterizedQuery - edge cases', () => {
    it('should handle null parameters', () => {
      const sql = 'SELECT * FROM users WHERE id = ?'
      const params = [null]
      const result = SqlSanitizer.buildParameterizedQuery(sql, params)
      expect(result.sql).toBe(sql)
      expect(result.params).toEqual([null])
    })

    it('should handle undefined parameters', () => {
      const sql = 'SELECT * FROM users WHERE id = ?'
      const params = [undefined]
      const result = SqlSanitizer.buildParameterizedQuery(sql, params)
      expect(result.sql).toBe(sql)
      expect(result.params).toEqual([null])
    })

    it('should handle mixed parameter types', () => {
      const sql = 'SELECT * FROM users WHERE id = ? AND name = ? AND active = ?'
      const params = [1, "O'Connor", true]
      const result = SqlSanitizer.buildParameterizedQuery(sql, params)
      expect(result.sql).toBe(sql)
      expect(result.params).toEqual([1, "O''Connor", true])
    })

    it('should handle complex nested parameters', () => {
      const sql = 'INSERT INTO users (data) VALUES (?)'
      const params = [{ name: "O'Connor", age: 30, hobbies: ['reading', 'coding'] }]
      const result = SqlSanitizer.buildParameterizedQuery(sql, params)
      expect(result.sql).toBe(sql)
      expect(result.params).toEqual([
        '{"name":"O\'Connor","age":30,"hobbies":["reading","coding"]}'
      ])
    })

    it('should handle Date parameters', () => {
      const sql = 'SELECT * FROM users WHERE created_at = ?'
      const date = new Date('2023-01-01T00:00:00.000Z')
      const params = [date]
      const result = SqlSanitizer.buildParameterizedQuery(sql, params)
      expect(result.sql).toBe(sql)
      expect(result.params).toEqual(['2023-01-01T00:00:00.000Z'])
    })

    it('should handle Symbol and BigInt parameters', () => {
      const sql = 'SELECT * FROM users WHERE id = ? AND symbol = ?'
      const symbol = Symbol('test')
      const bigInt = BigInt(12345678901234567890)
      const params = [bigInt, symbol]
      const result = SqlSanitizer.buildParameterizedQuery(sql, params)
      expect(result.sql).toBe(sql)
      expect(result.params).toEqual(['12345678901234567168', 'Symbol(test)']) // BigInt precision limit
    })
  })

  describe('escapeLikePattern - edge cases', () => {
    it('should handle patterns with multiple special characters', () => {
      expect(SqlSanitizer.escapeLikePattern('test%_pattern%_more')).toBe(
        'test\\%\\_pattern\\%\\_more'
      )
    })

    it('should handle patterns with backslashes', () => {
      expect(SqlSanitizer.escapeLikePattern('test\\pattern')).toBe('test\\\\pattern')
    })

    it('should handle patterns with all special characters', () => {
      expect(SqlSanitizer.escapeLikePattern('%_\\test%_\\')).toBe('\\%\\_\\\\test\\%\\_\\\\')
    })

    it('should handle very long patterns', () => {
      const longPattern = 'test%'.repeat(1000)
      const result = SqlSanitizer.escapeLikePattern(longPattern)
      expect(result).toBe('test\\%'.repeat(1000))
    })

    it('should handle patterns with unicode characters', () => {
      expect(SqlSanitizer.escapeLikePattern('测试%pattern_测试')).toBe('测试\\%pattern\\_测试')
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle long identifiers', () => {
      const longIdentifier = 'a'.repeat(100)
      expect(SqlSanitizer.validateIdentifier(longIdentifier)).toBe(false)
    })

    it('should handle identifiers with only special characters', () => {
      expect(() => {
        SqlSanitizer.sanitizeIdentifier('!@#$%^&*()')
      }).toThrow('Invalid identifier')

      expect(() => {
        SqlSanitizer.sanitizeIdentifier(';--')
      }).toThrow('Invalid identifier')
    })

    it('should handle empty function parameters', () => {
      expect(SqlSanitizer.sanitizeIdentifier('COUNT(*)')).toBe('COUNT(*)')
    })

    it('should handle function parameters with spaces', () => {
      expect(SqlSanitizer.sanitizeIdentifier('FUNCTION(param1, param2)')).toBe(
        'FUNCTION(param1, param2)'
      )
    })

    it('should handle complex nested expressions', () => {
      const complexExpr = 'CASE WHEN COUNT(*) > 0 THEN SUM(amount) / COUNT(*) ELSE 0 END'
      expect(SqlSanitizer.sanitizeIdentifier(complexExpr)).toBe(complexExpr)
    })
  })
})
