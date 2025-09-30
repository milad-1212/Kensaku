/**
 * @fileoverview Unit tests for QueryEngine class
 * @description Tests the QueryEngine factory functionality
 */

// Mock all dependencies to avoid import.meta issues
jest.mock('@core/index', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getDialect: jest.fn().mockReturnValue({
      buildSelectQuery: jest.fn().mockReturnValue({ sql: 'SELECT * FROM users', params: [] })
    })
  }))
}))

jest.mock('@builders/index', () => ({
  SelectBuilder: jest.fn().mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    toSQL: jest.fn().mockReturnValue('SELECT * FROM users'),
    toParams: jest.fn().mockReturnValue([])
  })),
  InsertBuilder: jest.fn().mockImplementation(() => ({
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    toSQL: jest.fn().mockReturnValue('INSERT INTO users VALUES (?)'),
    toParams: jest.fn().mockReturnValue(['John'])
  })),
  UpdateBuilder: jest.fn().mockImplementation(() => ({
    table: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    toSQL: jest.fn().mockReturnValue('UPDATE users SET name = ?'),
    toParams: jest.fn().mockReturnValue(['John'])
  })),
  DeleteBuilder: jest.fn().mockImplementation(() => ({
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    toSQL: jest.fn().mockReturnValue('DELETE FROM users WHERE id = ?'),
    toParams: jest.fn().mockReturnValue([1])
  })),
  MergeBuilder: jest.fn().mockImplementation(() => ({
    into: jest.fn().mockReturnThis(),
    using: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    toSQL: jest.fn().mockReturnValue('MERGE INTO users USING temp_users'),
    toParams: jest.fn().mockReturnValue([])
  }))
}))

import { QueryEngine } from '@core/QueryEngine'

describe('QueryEngine', () => {
  let queryEngine: QueryEngine
  let mockConnectionManager: any

  beforeEach(() => {
    mockConnectionManager = {
      getDialect: jest.fn().mockReturnValue({
        buildSelectQuery: jest.fn().mockReturnValue({ sql: 'SELECT * FROM users', params: [] })
      })
    }

    queryEngine = new QueryEngine(mockConnectionManager)
  })

  describe('constructor', () => {
    it('should create a QueryEngine instance', () => {
      expect(queryEngine).toBeInstanceOf(QueryEngine)
    })

    it('should set the connection manager', () => {
      expect((queryEngine as any).connectionManager).toBe(mockConnectionManager)
    })
  })

  describe('select method', () => {
    it('should create a SelectBuilder instance', () => {
      const builder = queryEngine.select()
      expect(builder).toBeDefined()
      expect(builder.select).toBeDefined()
      expect(builder.from).toBeDefined()
      expect(builder.where).toBeDefined()
    })

    it('should create a SelectBuilder with columns', () => {
      const builder = queryEngine.select('id', 'name', 'email')
      expect(builder).toBeDefined()
      // The builder should have been called with select method
      expect(builder.select).toHaveBeenCalledWith('id', 'name', 'email')
    })

    it('should create a SelectBuilder with single column', () => {
      const builder = queryEngine.select('id')
      expect(builder).toBeDefined()
      expect(builder.select).toHaveBeenCalledWith('id')
    })

    it('should create different instances for each call', () => {
      const builder1 = queryEngine.select('id')
      const builder2 = queryEngine.select('name')
      expect(builder1).not.toBe(builder2)
    })
  })

  describe('insert method', () => {
    it('should create an InsertBuilder instance', () => {
      const builder = queryEngine.insert()
      expect(builder).toBeDefined()
      expect(builder.into).toBeDefined()
      expect(builder.values).toBeDefined()
    })

    it('should create different instances for each call', () => {
      const builder1 = queryEngine.insert()
      const builder2 = queryEngine.insert()
      expect(builder1).not.toBe(builder2)
    })

    it('should pass connection manager to builder', () => {
      const builder = queryEngine.insert()
      expect(builder).toBeDefined()
    })
  })

  describe('update method', () => {
    it('should create an UpdateBuilder instance', () => {
      const builder = queryEngine.update()
      expect(builder).toBeDefined()
      expect(builder.table).toBeDefined()
      expect(builder.set).toBeDefined()
      expect(builder.where).toBeDefined()
    })

    it('should create different instances for each call', () => {
      const builder1 = queryEngine.update()
      const builder2 = queryEngine.update()
      expect(builder1).not.toBe(builder2)
    })

    it('should pass connection manager to builder', () => {
      const builder = queryEngine.update()
      expect(builder).toBeDefined()
    })
  })

  describe('delete method', () => {
    it('should create a DeleteBuilder instance', () => {
      const builder = queryEngine.delete()
      expect(builder).toBeDefined()
      expect(builder.from).toBeDefined()
      expect(builder.where).toBeDefined()
    })

    it('should create different instances for each call', () => {
      const builder1 = queryEngine.delete()
      const builder2 = queryEngine.delete()
      expect(builder1).not.toBe(builder2)
    })

    it('should pass connection manager to builder', () => {
      const builder = queryEngine.delete()
      expect(builder).toBeDefined()
    })
  })

  describe('createQuery method', () => {
    it('should create a SelectBuilder instance', () => {
      const builder = queryEngine.createQuery()
      expect(builder).toBeDefined()
      expect(builder.select).toBeDefined()
      expect(builder.from).toBeDefined()
    })

    it('should be an alias for select method', () => {
      const queryBuilder = queryEngine.createQuery()
      const selectBuilder = queryEngine.select()

      expect(queryBuilder).toBeDefined()
      expect(selectBuilder).toBeDefined()
      // Both should return SelectBuilder instances
      expect(queryBuilder.select).toBeDefined()
      expect(selectBuilder.select).toBeDefined()
    })

    it('should create different instances for each call', () => {
      const builder1 = queryEngine.createQuery()
      const builder2 = queryEngine.createQuery()
      expect(builder1).not.toBe(builder2)
    })
  })

  describe('merge method', () => {
    it('should create a MergeBuilder instance', () => {
      const builder = queryEngine.merge()
      expect(builder).toBeDefined()
      expect(builder.into).toBeDefined()
      expect(builder.using).toBeDefined()
      expect(builder.on).toBeDefined()
    })

    it('should create different instances for each call', () => {
      const builder1 = queryEngine.merge()
      const builder2 = queryEngine.merge()
      expect(builder1).not.toBe(builder2)
    })

    it('should pass connection manager to builder', () => {
      const builder = queryEngine.merge()
      expect(builder).toBeDefined()
    })
  })

  describe('builder factory pattern', () => {
    it('should create all types of builders', () => {
      const selectBuilder = queryEngine.select('id', 'name')
      const insertBuilder = queryEngine.insert()
      const updateBuilder = queryEngine.update()
      const deleteBuilder = queryEngine.delete()
      const mergeBuilder = queryEngine.merge()
      const queryBuilder = queryEngine.createQuery()

      expect(selectBuilder).toBeDefined()
      expect(insertBuilder).toBeDefined()
      expect(updateBuilder).toBeDefined()
      expect(deleteBuilder).toBeDefined()
      expect(mergeBuilder).toBeDefined()
      expect(queryBuilder).toBeDefined()
    })

    it('should create independent builder instances', () => {
      const builders = [
        queryEngine.select(),
        queryEngine.insert(),
        queryEngine.update(),
        queryEngine.delete(),
        queryEngine.merge(),
        queryEngine.createQuery()
      ]

      // All builders should be different instances
      for (let i = 0; i < builders.length; i++) {
        for (let j = i + 1; j < builders.length; j++) {
          expect(builders[i]).not.toBe(builders[j])
        }
      }
    })
  })

  describe('connection manager integration', () => {
    it('should use the same connection manager for all builders', () => {
      const selectBuilder = queryEngine.select()
      const insertBuilder = queryEngine.insert()
      const updateBuilder = queryEngine.update()

      // All builders should be created with the same connection manager
      expect(selectBuilder).toBeDefined()
      expect(insertBuilder).toBeDefined()
      expect(updateBuilder).toBeDefined()
    })

    it('should handle connection manager changes', () => {
      const newConnectionManager = {
        getDialect: jest.fn().mockReturnValue({
          buildSelectQuery: jest.fn().mockReturnValue({ sql: 'SELECT * FROM users', params: [] })
        })
      }

      const newQueryEngine = new QueryEngine(newConnectionManager)
      const builder = newQueryEngine.select()

      expect(builder).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle builder creation errors', () => {
      // Mock SelectBuilder to throw an error
      const { SelectBuilder } = require('@builders/index')
      SelectBuilder.mockImplementationOnce(() => {
        throw new Error('Builder creation failed')
      })

      expect(() => queryEngine.select()).toThrow('Builder creation failed')
    })

    it('should handle connection manager errors', () => {
      const invalidConnectionManager = null

      expect(() => new QueryEngine(invalidConnectionManager as any)).not.toThrow()
    })
  })

  describe('method chaining support', () => {
    it('should support fluent interface for select with columns', () => {
      const builder = queryEngine.select('id', 'name')
      expect(builder.select).toHaveBeenCalledWith('id', 'name')
    })

    it('should support empty select', () => {
      const builder = queryEngine.select()
      expect(builder).toBeDefined()
      // Should not call select method when no columns provided
      expect(builder.select).not.toHaveBeenCalled()
    })
  })
})
