import { SqlEscapeHelper } from '@builders/helpers/SqlEscape'
import { SqlSanitizer } from '@core/security/index'
import type { DatabaseType, QueryStatement } from '@interfaces/index'

// Mock SqlSanitizer
jest.mock('@core/security/index', () => ({
  SqlSanitizer: {
    sanitizeIdentifier: jest.fn().mockImplementation((id: string) => `"${id}"`),
    sanitizeValue: jest.fn().mockImplementation((value: unknown) => value),
    sanitizeForDatabase: jest.fn().mockImplementation((value: unknown) => value),
    escapeLikePattern: jest
      .fn()
      .mockImplementation((pattern: string) => pattern.replace(/[%_]/g, '\\$&')),
    validateIdentifier: jest.fn().mockImplementation((id: string) => /^[a-zA-Z_]\w*$/.test(id)),
    buildParameterizedQuery: jest.fn().mockImplementation((sql: string, params: unknown[]) => ({
      sql,
      params
    }))
  }
}))

describe('SqlEscapeHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('escapeIdentifier', () => {
    it('should escape a simple identifier', () => {
      const result = SqlEscapeHelper.escapeIdentifier('users')

      expect(result).toBe('"users"')
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledWith('users')
    })

    it('should escape identifiers with underscores', () => {
      const result = SqlEscapeHelper.escapeIdentifier('user_name')

      expect(result).toBe('"user_name"')
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledWith('user_name')
    })

    it('should escape identifiers with numbers', () => {
      const result = SqlEscapeHelper.escapeIdentifier('user123')

      expect(result).toBe('"user123"')
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledWith('user123')
    })
  })

  describe('escapeColumnExpression', () => {
    it('should escape simple column expression', () => {
      const result = SqlEscapeHelper.escapeColumnExpression('name')

      expect(result).toBe('"name"')
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledWith('name')
    })

    it('should escape column expression with alias', () => {
      const result = SqlEscapeHelper.escapeColumnExpression('name AS user_name')

      expect(result).toBe('"name" AS "user_name"')
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledWith('name')
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledWith('user_name')
    })

    it('should handle case-insensitive AS keyword', () => {
      const result = SqlEscapeHelper.escapeColumnExpression('name as user_name')

      expect(result).toBe('"name" AS "user_name"')
    })

    it('should handle function expressions', () => {
      const result = SqlEscapeHelper.escapeColumnExpression('COUNT(*)')

      expect(result).toBe('COUNT(*)')
    })

    it('should handle function expressions with alias', () => {
      const result = SqlEscapeHelper.escapeColumnExpression('COUNT(*) AS total')

      expect(result).toBe('COUNT(*) AS "total"')
    })
  })

  describe('escapeFunctionExpression', () => {
    it('should escape simple function with parameters', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('COUNT(id)')

      expect(result).toBe('COUNT("id")')
    })

    it('should escape function with multiple parameters', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('CONCAT(first_name, last_name)')

      expect(result).toBe('CONCAT("first_name", "last_name")')
    })

    it('should handle function with asterisk parameter', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('COUNT(*)')

      expect(result).toBe('COUNT(*)')
    })

    it('should handle function with mixed parameters', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('CONCAT(name, " ", surname)')

      expect(result).toBe('CONCAT("name", " ", "surname")')
    })

    it('should handle invalid function syntax', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('invalid_function')

      expect(result).toBe('"invalid_function"')
    })

    it('should handle complex expressions', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('(a + b) * c')

      expect(result).toBe('(a + b) * c')
    })

    it('should handle function with spaces', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('COUNT ( id )')

      expect(result).toBe('COUNT("id")')
    })
  })

  describe('isValidIdentifier', () => {
    it('should validate simple identifiers', () => {
      expect(SqlEscapeHelper.isValidIdentifier('users')).toBe(true)
      expect(SqlEscapeHelper.isValidIdentifier('user_name')).toBe(true)
      expect(SqlEscapeHelper.isValidIdentifier('user123')).toBe(true)
      expect(SqlEscapeHelper.isValidIdentifier('_private')).toBe(true)
    })

    it('should validate qualified identifiers', () => {
      expect(SqlEscapeHelper.isValidIdentifier('schema.users')).toBe(true)
      expect(SqlEscapeHelper.isValidIdentifier('public.user_name')).toBe(true)
    })

    it('should reject invalid identifiers', () => {
      expect(SqlEscapeHelper.isValidIdentifier('123users')).toBe(false)
      expect(SqlEscapeHelper.isValidIdentifier('user-name')).toBe(false)
      expect(SqlEscapeHelper.isValidIdentifier('user.name.value')).toBe(false)
      expect(SqlEscapeHelper.isValidIdentifier('')).toBe(false)
    })

    it('should reject identifiers that are too long', () => {
      const longIdentifier = 'a'.repeat(31)
      expect(SqlEscapeHelper.isValidIdentifier(longIdentifier)).toBe(false)
    })

    it('should reject identifiers with special characters', () => {
      expect(SqlEscapeHelper.isValidIdentifier('user@name')).toBe(false)
      expect(SqlEscapeHelper.isValidIdentifier('user#name')).toBe(false)
      expect(SqlEscapeHelper.isValidIdentifier('user$name')).toBe(false)
    })
  })

  describe('addParam', () => {
    it('should add parameter and return placeholder', () => {
      const params: unknown[] = []

      const result = SqlEscapeHelper.addParam('John', params)

      expect(result).toBe('$1')
      expect(params).toEqual(['John'])
      expect(SqlSanitizer.sanitizeValue).toHaveBeenCalledWith('John')
    })

    it('should add multiple parameters with correct numbering', () => {
      const params: unknown[] = []

      const result1 = SqlEscapeHelper.addParam('John', params)
      const result2 = SqlEscapeHelper.addParam('Doe', params)
      const result3 = SqlEscapeHelper.addParam(25, params)

      expect(result1).toBe('$1')
      expect(result2).toBe('$2')
      expect(result3).toBe('$3')
      expect(params).toEqual(['John', 'Doe', 25])
    })

    it('should handle null values', () => {
      const params: unknown[] = []

      const result = SqlEscapeHelper.addParam(null, params)

      expect(result).toBe('$1')
      expect(params).toEqual([null])
    })

    it('should handle undefined values', () => {
      const params: unknown[] = []

      const result = SqlEscapeHelper.addParam(undefined, params)

      expect(result).toBe('$1')
      expect(params).toEqual([undefined])
    })

    it('should handle object values', () => {
      const params: unknown[] = []
      const obj = { name: 'John', age: 25 }

      const result = SqlEscapeHelper.addParam(obj, params)

      expect(result).toBe('$1')
      expect(params).toEqual([obj])
    })

    it('should handle array values', () => {
      const params: unknown[] = []
      const arr = [1, 2, 3]

      const result = SqlEscapeHelper.addParam(arr, params)

      expect(result).toBe('$1')
      expect(params).toEqual([arr])
    })
  })

  describe('addDatabaseParam', () => {
    it('should add database-specific parameter', () => {
      const params: unknown[] = []
      const databaseType: DatabaseType = 'postgresql'

      const result = SqlEscapeHelper.addDatabaseParam('John', params, databaseType)

      expect(result).toBe('$1')
      expect(params).toEqual(['John'])
      expect(SqlSanitizer.sanitizeForDatabase).toHaveBeenCalledWith('John', databaseType)
    })

    it('should handle different database types', () => {
      const params: unknown[] = []

      SqlEscapeHelper.addDatabaseParam('John', params, 'mysql')
      SqlEscapeHelper.addDatabaseParam('Doe', params, 'sqlite')

      expect(SqlSanitizer.sanitizeForDatabase).toHaveBeenCalledWith('John', 'mysql')
      expect(SqlSanitizer.sanitizeForDatabase).toHaveBeenCalledWith('Doe', 'sqlite')
    })
  })

  describe('escapeLikePattern', () => {
    it('should escape LIKE pattern characters', () => {
      const result = SqlEscapeHelper.escapeLikePattern('John%')

      expect(result).toBe('John\\%')
      expect(SqlSanitizer.escapeLikePattern).toHaveBeenCalledWith('John%')
    })

    it('should escape underscore characters', () => {
      const result = SqlEscapeHelper.escapeLikePattern('John_Doe')

      expect(result).toBe('John\\_Doe')
    })

    it('should escape multiple special characters', () => {
      const result = SqlEscapeHelper.escapeLikePattern('John%_Doe')

      expect(result).toBe('John\\%\\_Doe')
    })

    it('should handle patterns without special characters', () => {
      const result = SqlEscapeHelper.escapeLikePattern('JohnDoe')

      expect(result).toBe('JohnDoe')
    })
  })

  describe('validateIdentifier', () => {
    it('should validate identifiers using SqlSanitizer', () => {
      const result = SqlEscapeHelper.validateIdentifier('users')

      expect(result).toBe(true)
      expect(SqlSanitizer.validateIdentifier).toHaveBeenCalledWith('users')
    })

    it('should reject invalid identifiers', () => {
      const result = SqlEscapeHelper.validateIdentifier('123users')

      expect(result).toBe(false)
      expect(SqlSanitizer.validateIdentifier).toHaveBeenCalledWith('123users')
    })
  })

  describe('buildParameterizedQuery', () => {
    it('should build parameterized query', () => {
      const sql = 'SELECT * FROM users WHERE id = ?'
      const params = [1, 'John']

      const result = SqlEscapeHelper.buildParameterizedQuery(sql, params)

      expect(result).toEqual({ sql, params })
      expect(SqlSanitizer.buildParameterizedQuery).toHaveBeenCalledWith(sql, params)
    })

    it('should handle empty parameters', () => {
      const sql = 'SELECT * FROM users'
      const params: unknown[] = []

      const result = SqlEscapeHelper.buildParameterizedQuery(sql, params)

      expect(result).toEqual({ sql, params })
    })
  })

  describe('escapeIdentifierList', () => {
    it('should escape multiple identifiers', () => {
      const result = SqlEscapeHelper.escapeIdentifierList(['id', 'name', 'email'])

      expect(result).toBe('"id", "name", "email"')
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledTimes(3)
    })

    it('should handle single identifier', () => {
      const result = SqlEscapeHelper.escapeIdentifierList(['id'])

      expect(result).toBe('"id"')
    })

    it('should handle empty array', () => {
      const result = SqlEscapeHelper.escapeIdentifierList([])

      expect(result).toBe('')
    })
  })

  describe('escapeColumnExpressionList', () => {
    it('should escape multiple column expressions', () => {
      const result = SqlEscapeHelper.escapeColumnExpressionList([
        'id',
        'name AS user_name',
        'COUNT(*)'
      ])

      expect(result).toBe('"id", "name" AS "user_name", COUNT(*)')
    })

    it('should handle mixed expressions', () => {
      const result = SqlEscapeHelper.escapeColumnExpressionList([
        'id',
        'name AS user_name',
        'COUNT(*) AS total',
        'CONCAT(first, last) AS full_name'
      ])

      expect(result).toBe(
        '"id", "name" AS "user_name", COUNT(*) AS "total", CONCAT("first", "last") AS "full_name"'
      )
    })

    it('should handle empty array', () => {
      const result = SqlEscapeHelper.escapeColumnExpressionList([])

      expect(result).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(SqlEscapeHelper.escapeIdentifier('')).toBe('""')
      expect(SqlEscapeHelper.isValidIdentifier('')).toBe(false)
    })

    it('should handle whitespace in expressions', () => {
      const result = SqlEscapeHelper.escapeColumnExpression('  name  AS  user_name  ')

      expect(result).toBe('"name" AS "user_name"')
    })

    it('should handle complex function expressions', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression(
        'COALESCE(first_name, last_name, "Unknown")'
      )

      expect(result).toBe('COALESCE("first_name", "last_name", "Unknown")')
    })

    it('should handle nested function calls', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression(
        'UPPER(CONCAT(first_name, " ", last_name))'
      )

      expect(result).toBe('UPPER(CONCAT(first_name, " ", last_name))')
    })

    it('should handle function with no parameters', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('NOW()')

      expect(result).toBe('NOW()')
    })

    it('should handle malformed function expressions', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('COUNT(')

      expect(result).toBe('COUNT(')
    })

    it('should handle expressions with parentheses but not functions', () => {
      const result = SqlEscapeHelper.escapeFunctionExpression('(a + b)')

      expect(result).toBe('(a + b)')
    })
  })

  describe('security considerations', () => {
    it('should sanitize potentially malicious identifiers', () => {
      const maliciousId = "'; DROP TABLE users; --"

      const result = SqlEscapeHelper.escapeIdentifier(maliciousId)

      expect(result).toBe(`"'; DROP TABLE users; --"`)
      expect(SqlSanitizer.sanitizeIdentifier).toHaveBeenCalledWith(maliciousId)
    })

    it('should sanitize potentially malicious values', () => {
      const maliciousValue = "'; DROP TABLE users; --"
      const params: unknown[] = []

      const result = SqlEscapeHelper.addParam(maliciousValue, params)

      expect(result).toBe('$1')
      expect(SqlSanitizer.sanitizeValue).toHaveBeenCalledWith(maliciousValue)
    })

    it('should handle SQL injection attempts in LIKE patterns', () => {
      const maliciousPattern = "'; DROP TABLE users; --%"

      const result = SqlEscapeHelper.escapeLikePattern(maliciousPattern)

      expect(SqlSanitizer.escapeLikePattern).toHaveBeenCalledWith(maliciousPattern)
    })
  })
})
