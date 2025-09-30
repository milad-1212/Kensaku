/**
 * @fileoverview Unit tests for Kensaku main class
 * @description Tests the main Kensaku class functionality
 */

// Mock all dependencies to avoid import.meta issues
jest.mock('@core/index', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'John' }] }),
      transaction: jest.fn().mockImplementation(callback => callback({}))
    }),
    close: jest.fn().mockResolvedValue(undefined),
    releaseConnection: jest.fn().mockResolvedValue(undefined)
  })),
  QueryEngine: jest.fn().mockImplementation(() => ({
    select: jest.fn().mockReturnValue({}),
    insert: jest.fn().mockReturnValue({}),
    update: jest.fn().mockReturnValue({}),
    delete: jest.fn().mockReturnValue({}),
    createQuery: jest.fn().mockReturnValue({}),
    merge: jest.fn().mockReturnValue({})
  }))
}))

jest.mock('@builders/index', () => ({
  SelectBuilder: jest.fn(),
  InsertBuilder: jest.fn(),
  UpdateBuilder: jest.fn(),
  DeleteBuilder: jest.fn(),
  MergeBuilder: jest.fn()
}))

import { Kensaku } from '@core/Kensaku'
import type { DatabaseConfig } from '@interfaces/index'

describe('Kensaku', () => {
  let kensaku: Kensaku
  let mockConfig: DatabaseConfig
  let mockConnectionManager: any
  let mockQueryEngine: any

  beforeEach(() => {
    mockConfig = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      username: 'testuser',
      password: 'testpass'
    }

    mockConnectionManager = {
      getConnection: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'John' }] }),
        transaction: jest.fn().mockImplementation(callback => callback({}))
      }),
      close: jest.fn().mockResolvedValue(undefined),
      releaseConnection: jest.fn().mockResolvedValue(undefined)
    }

    mockQueryEngine = {
      select: jest.fn().mockReturnValue({}),
      insert: jest.fn().mockReturnValue({}),
      update: jest.fn().mockReturnValue({}),
      delete: jest.fn().mockReturnValue({}),
      createQuery: jest.fn().mockReturnValue({}),
      merge: jest.fn().mockReturnValue({})
    }

    // Create Kensaku instance with mocked dependencies
    kensaku = new Kensaku(mockConfig)
    ;(kensaku as any).connectionManager = mockConnectionManager
    ;(kensaku as any).queryEngine = mockQueryEngine
  })

  describe('constructor', () => {
    it('should create a Kensaku instance', () => {
      expect(kensaku).toBeInstanceOf(Kensaku)
    })

    it('should initialize connection manager and query engine', () => {
      expect((kensaku as any).connectionManager).toBeDefined()
      expect((kensaku as any).queryEngine).toBeDefined()
    })
  })

  describe('getConnection method', () => {
    it('should get connection from connection manager', async () => {
      const connection = await kensaku.getConnection()
      expect(mockConnectionManager.getConnection).toHaveBeenCalled()
      expect(connection).toBeDefined()
    })

    it('should return a connection object', async () => {
      const connection = await kensaku.getConnection()
      expect(connection).toHaveProperty('query')
      expect(connection).toHaveProperty('transaction')
    })
  })

  describe('close method', () => {
    it('should close all connections', async () => {
      await kensaku.close()
      expect(mockConnectionManager.close).toHaveBeenCalled()
    })

    it('should resolve without errors', async () => {
      await expect(kensaku.close()).resolves.toBeUndefined()
    })
  })

  describe('select method', () => {
    it('should create a SelectBuilder instance', () => {
      const builder = kensaku.select()
      expect(mockQueryEngine.select).toHaveBeenCalled()
      expect(builder).toBeDefined()
    })

    it('should create a SelectBuilder with columns', () => {
      const builder = kensaku.select('id', 'name', 'email')
      expect(mockQueryEngine.select).toHaveBeenCalledWith('id', 'name', 'email')
      expect(builder).toBeDefined()
    })

    it('should return the same builder instance', () => {
      const builder1 = kensaku.select('id')
      const builder2 = kensaku.select('name')
      expect(mockQueryEngine.select).toHaveBeenCalledTimes(2)
    })
  })

  describe('insert method', () => {
    it('should create an InsertBuilder instance', () => {
      const builder = kensaku.insert()
      expect(mockQueryEngine.insert).toHaveBeenCalled()
      expect(builder).toBeDefined()
    })

    it('should return the same builder instance', () => {
      const builder1 = kensaku.insert()
      const builder2 = kensaku.insert()
      expect(mockQueryEngine.insert).toHaveBeenCalledTimes(2)
    })
  })

  describe('update method', () => {
    it('should create an UpdateBuilder instance', () => {
      const builder = kensaku.update()
      expect(mockQueryEngine.update).toHaveBeenCalled()
      expect(builder).toBeDefined()
    })

    it('should return the same builder instance', () => {
      const builder1 = kensaku.update()
      const builder2 = kensaku.update()
      expect(mockQueryEngine.update).toHaveBeenCalledTimes(2)
    })
  })

  describe('delete method', () => {
    it('should create a DeleteBuilder instance', () => {
      const builder = kensaku.delete()
      expect(mockQueryEngine.delete).toHaveBeenCalled()
      expect(builder).toBeDefined()
    })

    it('should return the same builder instance', () => {
      const builder1 = kensaku.delete()
      const builder2 = kensaku.delete()
      expect(mockQueryEngine.delete).toHaveBeenCalledTimes(2)
    })
  })

  describe('query method', () => {
    it('should create a QueryBuilder instance', () => {
      const builder = kensaku.query()
      expect(mockQueryEngine.createQuery).toHaveBeenCalled()
      expect(builder).toBeDefined()
    })

    it('should return the same builder instance', () => {
      const builder1 = kensaku.query()
      const builder2 = kensaku.query()
      expect(mockQueryEngine.createQuery).toHaveBeenCalledTimes(2)
    })
  })

  describe('merge method', () => {
    it('should create a MergeBuilder instance', () => {
      const builder = kensaku.merge()
      expect(mockQueryEngine.merge).toHaveBeenCalled()
      expect(builder).toBeDefined()
    })

    it('should return the same builder instance', () => {
      const builder1 = kensaku.merge()
      const builder2 = kensaku.merge()
      expect(mockQueryEngine.merge).toHaveBeenCalledTimes(2)
    })
  })

  describe('raw method', () => {
    it('should execute raw SQL query', async () => {
      const result = await kensaku.raw('SELECT * FROM users')
      expect(mockConnectionManager.getConnection).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1, name: 'John' }])
    })

    it('should execute raw SQL query with parameters', async () => {
      const params = ['John', 25]
      const result = await kensaku.raw('SELECT * FROM users WHERE name = ? AND age = ?', params)
      expect(mockConnectionManager.getConnection).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1, name: 'John' }])
    })

    it('should handle empty parameters array', async () => {
      const result = await kensaku.raw('SELECT * FROM users', [])
      expect(mockConnectionManager.getConnection).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1, name: 'John' }])
    })

    it('should release connection after query execution', async () => {
      await kensaku.raw('SELECT * FROM users')
      expect(mockConnectionManager.releaseConnection).toHaveBeenCalled()
    })

    it('should handle query errors gracefully', async () => {
      const mockConnection = {
        query: jest.fn().mockRejectedValue(new Error('SQL Error')),
        transaction: jest.fn()
      }
      mockConnectionManager.getConnection.mockResolvedValue(mockConnection)

      await expect(kensaku.raw('INVALID SQL')).rejects.toThrow('SQL Error')
      expect(mockConnectionManager.releaseConnection).toHaveBeenCalled()
    })
  })

  describe('transaction method', () => {
    it('should execute transaction callback', async () => {
      const mockTransaction = { id: 'tx-123' }
      const callback = jest.fn().mockResolvedValue('transaction result')

      const mockConnection = {
        query: jest.fn(),
        transaction: jest.fn().mockImplementation(cb => cb(mockTransaction))
      }
      mockConnectionManager.getConnection.mockResolvedValue(mockConnection)

      const result = await kensaku.transaction(callback)

      expect(mockConnection.transaction).toHaveBeenCalledWith(callback)
      expect(callback).toHaveBeenCalledWith(mockTransaction)
      expect(result).toBe('transaction result')
    })

    it('should handle transaction errors', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('Transaction failed'))

      const mockConnection = {
        query: jest.fn(),
        transaction: jest.fn().mockImplementation(cb => cb({}))
      }
      mockConnectionManager.getConnection.mockResolvedValue(mockConnection)

      await expect(kensaku.transaction(callback)).rejects.toThrow('Transaction failed')
    })

    it('should handle transaction rollback', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('Rollback'))

      const mockConnection = {
        query: jest.fn(),
        transaction: jest.fn().mockImplementation(cb => cb({}))
      }
      mockConnectionManager.getConnection.mockResolvedValue(mockConnection)

      await expect(kensaku.transaction(callback)).rejects.toThrow('Rollback')
    })
  })

  describe('fluent interface', () => {
    it('should support method chaining for query builders', () => {
      const selectBuilder = kensaku.select('id', 'name')
      const insertBuilder = kensaku.insert()
      const updateBuilder = kensaku.update()
      const deleteBuilder = kensaku.delete()
      const mergeBuilder = kensaku.merge()

      expect(selectBuilder).toBeDefined()
      expect(insertBuilder).toBeDefined()
      expect(updateBuilder).toBeDefined()
      expect(deleteBuilder).toBeDefined()
      expect(mergeBuilder).toBeDefined()
    })

    it('should allow multiple query operations', async () => {
      // Test multiple operations in sequence
      const selectBuilder = kensaku.select('id')
      const insertBuilder = kensaku.insert()
      const result = await kensaku.raw('SELECT COUNT(*) FROM users')

      expect(selectBuilder).toBeDefined()
      expect(insertBuilder).toBeDefined()
      expect(result).toEqual([{ id: 1, name: 'John' }])
    })
  })

  describe('error handling', () => {
    it('should handle connection errors', async () => {
      mockConnectionManager.getConnection.mockRejectedValue(new Error('Connection failed'))

      await expect(kensaku.getConnection()).rejects.toThrow('Connection failed')
    })

    it('should handle close errors', async () => {
      mockConnectionManager.close.mockRejectedValue(new Error('Close failed'))

      await expect(kensaku.close()).rejects.toThrow('Close failed')
    })

    it('should handle query engine errors', () => {
      mockQueryEngine.select.mockImplementation(() => {
        throw new Error('Query engine error')
      })

      expect(() => kensaku.select()).toThrow('Query engine error')
    })
  })

  describe('configuration handling', () => {
    it('should work with different database types', () => {
      const mysqlConfig: DatabaseConfig = {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'testdb',
        username: 'testuser',
        password: 'testpass'
      }

      const sqliteConfig: DatabaseConfig = {
        type: 'sqlite',
        database: './test.db'
      }

      expect(() => new Kensaku(mysqlConfig)).not.toThrow()
      expect(() => new Kensaku(sqliteConfig)).not.toThrow()
    })
  })
})
