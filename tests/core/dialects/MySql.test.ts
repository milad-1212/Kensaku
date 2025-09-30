// Mock mysql2/promise first
jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn().mockResolvedValue({
    execute: jest
      .fn()
      .mockResolvedValue([[{ affectedRows: 1 }], [{ name: 'id', type: 3, flags: 0 }]]),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    end: jest.fn().mockResolvedValue(undefined)
  })
}))

// Mock DialectFactory
jest.mock('@core/dialects/builders', () => ({
  DialectFactory: {
    createGetDataTypeMethod: jest.fn().mockReturnValue(jest.fn().mockReturnValue('VARCHAR(255)'))
  },
  QueryBuilders: {
    buildSetOperations: jest.fn(),
    buildSelectClause: jest.fn().mockImplementation((query, parts) => {
      if (query.columns) {
        parts.push('SELECT', query.columns.join(', '))
      }
    }),
    buildFromClause: jest.fn().mockImplementation((query, parts) => {
      if (query.from) {
        parts.push('FROM', query.from)
      }
    }),
    buildJoinClauses: jest.fn(),
    buildWhereClause: jest.fn(),
    buildGroupByClause: jest.fn(),
    buildHavingClause: jest.fn(),
    buildOrderByClause: jest.fn(),
    buildLimitClause: jest.fn(),
    buildOffsetClause: jest.fn()
  },
  ClauseBuilders: {
    buildWhereConditions: jest.fn().mockImplementation((conditions, params) => {
      // Add the WHERE parameter to the params array
      conditions.forEach((condition: any) => {
        if (condition.value !== undefined) {
          params.push(condition.value)
        }
      })
      return 'id = ?'
    })
  },
  ParameterBuilders: {
    addParam: jest.fn().mockImplementation((value, params) => {
      params.push(value)
      return '?'
    })
  }
}))

// Mock the problematic Sqlite import
jest.mock('@core/dialects/Sqlite', () => ({
  Sqlite: jest.fn()
}))

import { MySql } from '@core/dialects/MySql'
import { Base } from '@core/dialects/Base'
import { DialectFactory } from '@core/dialects/builders'

describe('MySql Dialect', () => {
  let mysql: MySql
  let mockConfig: any

  beforeEach(() => {
    mockConfig = {
      host: 'localhost',
      port: 3306,
      database: 'test',
      username: 'root',
      password: 'password'
    }
    mysql = new MySql(mockConfig)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should extend Base class', () => {
      expect(mysql).toBeInstanceOf(Base)
    })

    it('should initialize with config', () => {
      expect(mysql['config']).toBe(mockConfig)
    })
  })

  describe('createConnection', () => {
    it('should create MySQL connection with default values', async () => {
      const mysql2 = await import('mysql2/promise')

      await mysql.createConnection(mockConfig)

      expect(mysql2.createConnection).toHaveBeenCalledWith({
        host: 'localhost',
        port: 3306,
        database: 'test',
        user: 'root',
        password: 'password'
      })
    })

    it('should create MySQL connection with custom values', async () => {
      const customConfig = {
        host: 'remote-host',
        port: 3307,
        database: 'custom_db',
        username: 'custom_user',
        password: 'custom_pass'
      }
      const mysql2 = await import('mysql2/promise')

      await mysql.createConnection(customConfig)

      expect(mysql2.createConnection).toHaveBeenCalledWith({
        host: 'remote-host',
        port: 3307,
        database: 'custom_db',
        user: 'custom_user',
        password: 'custom_pass'
      })
    })

    it('should return connection with query method', async () => {
      const connection = await mysql.createConnection(mockConfig)

      expect(typeof connection.query).toBe('function')
      expect(typeof connection.transaction).toBe('function')
      expect(typeof connection.close).toBe('function')
    })

    it('should execute query and return results', async () => {
      const connection = await mysql.createConnection(mockConfig)
      const mysql2 = await import('mysql2/promise')
      const mockConnection = await mysql2.createConnection()

      const result = await connection.query('SELECT * FROM users', [1])

      expect(mockConnection.execute).toHaveBeenCalledWith('SELECT * FROM users', [1])
      expect(result).toEqual({
        rows: [{ affectedRows: 1 }],
        rowCount: 1,
        fields: [
          {
            name: 'id',
            type: '3',
            nullable: true
          }
        ]
      })
    })

    it('should handle transaction successfully', async () => {
      const connection = await mysql.createConnection(mockConfig)
      const mysql2 = await import('mysql2/promise')
      const mockConnection = await mysql2.createConnection()

      const result = await connection.transaction(async tx => {
        await tx.query('INSERT INTO users VALUES (?)', ['John'])
        await tx.commit()
        return 'success'
      })

      expect(mockConnection.beginTransaction).toHaveBeenCalled()
      expect(mockConnection.commit).toHaveBeenCalledTimes(2) // Once in callback, once after
      expect(result).toBe('success')
    })

    it('should handle transaction rollback on error', async () => {
      const connection = await mysql.createConnection(mockConfig)
      const mysql2 = await import('mysql2/promise')
      const mockConnection = await mysql2.createConnection()

      await expect(
        connection.transaction(async tx => {
          await tx.query('INSERT INTO users VALUES (?)', ['John'])
          throw new Error('Transaction failed')
        })
      ).rejects.toThrow('Transaction failed')

      expect(mockConnection.beginTransaction).toHaveBeenCalled()
      expect(mockConnection.rollback).toHaveBeenCalled()
      expect(mockConnection.commit).not.toHaveBeenCalled()
    })

    it('should close connection', async () => {
      const connection = await mysql.createConnection(mockConfig)
      const mysql2 = await import('mysql2/promise')
      const mockConnection = await mysql2.createConnection()

      await connection.close()

      expect(mockConnection.end).toHaveBeenCalled()
    })
  })

  describe('buildSelectQuery', () => {
    it('should build basic SELECT query', () => {
      const query = {
        columns: ['id', 'name'],
        from: 'users'
      }

      const result = mysql.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('FROM')
      expect(result.params).toEqual([])
    })

    it('should build SELECT query with CTE', () => {
      const query = {
        ctes: [
          {
            name: 'cte1',
            query: { columns: ['id'], from: 'users' },
            recursive: false
          }
        ],
        columns: ['id'],
        from: 'cte1'
      }

      const result = mysql.buildSelectQuery(query as any)

      expect(result.sql).toContain('WITH')
      expect(result.sql).toContain('cte1')
    })

    it('should call QueryBuilders.buildSetOperations', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {
        columns: ['id'],
        from: 'users',
        unions: [
          {
            type: 'UNION',
            query: { columns: ['id'], from: 'profiles' }
          }
        ]
      }

      mysql.buildSelectQuery(query as any)

      expect(QueryBuilders.buildSetOperations).toHaveBeenCalledWith(
        query,
        expect.any(Array),
        expect.any(Array),
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  describe('buildInsertQuery', () => {
    it('should build INSERT query with single row', () => {
      const query = {
        into: 'users',
        values: {
          name: 'John',
          age: 30
        }
      }

      const result = mysql.buildInsertQuery(query as any)

      expect(result.sql).toBe('INSERT INTO `users` (`name`, `age`) VALUES (?, ?)')
      expect(result.params).toEqual(['John', 30])
    })

    it('should build INSERT query with multiple rows', () => {
      const query = {
        into: 'users',
        values: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      }

      const result = mysql.buildInsertQuery(query as any)

      expect(result.sql).toBe('INSERT INTO `users` (`name`, `age`) VALUES (?, ?), (?, ?)')
      expect(result.params).toEqual(['John', 30, 'Jane', 25])
    })

    it('should handle empty values', () => {
      const query = {
        into: 'users',
        values: []
      }

      const result = mysql.buildInsertQuery(query as any)

      expect(result.sql).toBe('INSERT INTO `users`')
      expect(result.params).toEqual([])
    })
  })

  describe('buildUpdateQuery', () => {
    it('should build UPDATE query', () => {
      const query = {
        table: 'users',
        set: {
          name: 'John',
          age: 30
        },
        where: [
          {
            column: 'id',
            operator: '=' as const,
            value: 1
          }
        ]
      }

      const result = mysql.buildUpdateQuery(query as any)

      expect(result.sql).toBe('UPDATE `users` SET `name` = ?, `age` = ? WHERE id = ?')
      expect(result.params).toEqual(['John', 30, 1])
    })

    it('should build UPDATE query without WHERE clause', () => {
      const query = {
        table: 'users',
        set: {
          name: 'John'
        }
      }

      const result = mysql.buildUpdateQuery(query as any)

      expect(result.sql).toBe('UPDATE `users` SET `name` = ?')
      expect(result.params).toEqual(['John'])
    })
  })

  describe('buildDeleteQuery', () => {
    it('should build DELETE query', () => {
      const query = {
        from: 'users',
        where: [
          {
            column: 'id',
            operator: '=' as const,
            value: 1
          }
        ]
      }

      const result = mysql.buildDeleteQuery(query as any)

      expect(result.sql).toBe('DELETE FROM `users` WHERE id = ?')
      expect(result.params).toEqual([1])
    })

    it('should build DELETE query without WHERE clause', () => {
      const query = {
        from: 'users'
      }

      const result = mysql.buildDeleteQuery(query as any)

      expect(result.sql).toBe('DELETE FROM `users`')
      expect(result.params).toEqual([])
    })
  })

  describe('escapeIdentifier', () => {
    it('should escape simple identifier with backticks', () => {
      const result = mysql.escapeIdentifier('users')
      expect(result).toBe('`users`')
    })

    it('should escape identifier with backticks', () => {
      const result = mysql.escapeIdentifier('user`name')
      expect(result).toBe('`user``name`')
    })

    it('should escape qualified identifier', () => {
      const result = mysql.escapeIdentifier('schema.users')
      expect(result).toBe('`schema`.`users`')
    })

    it('should escape qualified identifier with backticks', () => {
      const result = mysql.escapeIdentifier('schema.user`name')
      expect(result).toBe('`schema`.`user``name`')
    })
  })

  describe('escapeValue', () => {
    it('should escape null value', () => {
      const result = mysql.escapeValue(null)
      expect(result).toBe('NULL')
    })

    it('should escape undefined value', () => {
      const result = mysql.escapeValue(undefined)
      expect(result).toBe('NULL')
    })

    it('should escape string value', () => {
      const result = mysql.escapeValue('hello')
      expect(result).toBe("'hello'")
    })

    it('should escape string with quotes', () => {
      const result = mysql.escapeValue("hello'world")
      expect(result).toBe("'hello''world'")
    })

    it('should escape boolean true as 1', () => {
      const result = mysql.escapeValue(true)
      expect(result).toBe('1')
    })

    it('should escape boolean false as 0', () => {
      const result = mysql.escapeValue(false)
      expect(result).toBe('0')
    })

    it('should escape Date value in MySQL format', () => {
      const date = new Date('2023-01-01T12:30:45.000Z')
      const result = mysql.escapeValue(date)
      expect(result).toBe("'2023-01-01 12:30:45'")
    })

    it('should escape array value', () => {
      const result = mysql.escapeValue([1, 'hello', true])
      expect(result).toBe("(1, 'hello', 1)")
    })

    it('should escape nested array value', () => {
      const result = mysql.escapeValue([1, [2, 3]])
      expect(result).toBe('(1, (2, 3))')
    })

    it('should escape object value', () => {
      const result = mysql.escapeValue({ name: 'John', age: 30 })
      expect(result).toBe('\'{"name":"John","age":30}\'')
    })

    it('should escape number value', () => {
      const result = mysql.escapeValue(42)
      expect(result).toBe('42')
    })

    it('should escape decimal value', () => {
      const result = mysql.escapeValue(3.14)
      expect(result).toBe('3.14')
    })

    it('should escape symbol value', () => {
      const symbol = Symbol('test')
      const result = mysql.escapeValue(symbol)
      expect(result).toBe('Symbol(test)')
    })

    it('should escape bigint value', () => {
      const result = mysql.escapeValue(BigInt(123))
      expect(result).toBe('123')
    })
  })

  describe('getDataType', () => {
    it('should call DialectFactory.createGetDataTypeMethod', () => {
      mysql.getDataType('string')

      expect(DialectFactory.createGetDataTypeMethod).toHaveBeenCalledWith('mysql')
    })

    it('should return MySQL data type', () => {
      const result = mysql.getDataType('string')
      expect(result).toBe('VARCHAR(255)')
    })
  })

  describe('getLimitSyntax', () => {
    it('should return empty string when no limit or offset', () => {
      const result = mysql.getLimitSyntax()
      expect(result).toBe('')
    })

    it('should return LIMIT only', () => {
      const result = mysql.getLimitSyntax(10)
      expect(result).toBe('LIMIT 10')
    })

    it('should return LIMIT with offset', () => {
      const result = mysql.getLimitSyntax(10, 20)
      expect(result).toBe('LIMIT 20, 10')
    })

    it('should return LIMIT with offset only', () => {
      const result = mysql.getLimitSyntax(undefined, 20)
      expect(result).toBe('LIMIT 20, 1000000')
    })

    it('should cap limit at MAX_LIMIT', () => {
      const result = mysql.getLimitSyntax(2000000)
      expect(result).toBe('LIMIT 1000000')
    })

    it('should handle zero offset', () => {
      const result = mysql.getLimitSyntax(10, 0)
      expect(result).toBe('LIMIT 10')
    })

    it('should handle negative limit', () => {
      const result = mysql.getLimitSyntax(-5)
      expect(result).toBe('')
    })
  })

  describe('private methods', () => {
    it('should call buildBasicSelectClauses', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = mysql.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('FROM')
    })

    it('should call buildAdvancedClauses', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = mysql.buildSelectQuery(query as any)

      // Should build successfully without advanced clauses
      expect(result.sql).toBeDefined()
      expect(result.sql).toContain('SELECT')
    })
  })
})
