import { InsertBuilder } from '@builders/Insert'
import { Connection } from '@core/index'
import { QueryValidator } from '@core/security/index'
import { ReturningClauseHelper } from '@builders/helpers/index'
import { InsertMixin } from '@builders/mixins/index'
import type { QueryWhereCondition } from '@interfaces/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getDialect: jest.fn().mockReturnValue({
      buildInsertQuery: jest.fn().mockReturnValue({
        sql: 'INSERT INTO "users" ("name", "email") VALUES ($1, $2)',
        params: ['John', 'john@example.com']
      })
    }),
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({
        rows: [{ id: 1, name: 'John', email: 'john@example.com' }],
        rowCount: 1
      })
    }),
    releaseConnection: jest.fn().mockResolvedValue(undefined)
  }))
}))

jest.mock('@core/security/index', () => ({
  QueryValidator: {
    validateInsertQuery: jest.fn()
  }
}))

jest.mock('@builders/helpers/index', () => ({
  ReturningClauseHelper: {
    setReturningColumns: jest.fn(),
    buildReturningClause: jest.fn().mockReturnValue('RETURNING "id"')
  }
}))

jest.mock('@builders/mixins/index', () => ({
  InsertMixin: {
    setIntoTable: jest.fn(),
    setValues: jest.fn(),
    buildInsertClause: jest.fn().mockReturnValue('INSERT INTO "users"'),
    buildValuesClause: jest.fn().mockReturnValue('VALUES ($1, $2)')
  }
}))

jest.mock('@core/dialects/index', () => ({
  Base: jest.fn().mockImplementation(() => ({
    buildInsertQuery: jest.fn().mockReturnValue({
      sql: 'INSERT INTO "users" ("name", "email") VALUES ($1, $2)',
      params: ['John', 'john@example.com']
    })
  }))
}))

describe('InsertBuilder', () => {
  let mockConnectionManager: any
  let insertBuilder: InsertBuilder

  beforeEach(() => {
    mockConnectionManager = new Connection({} as any)
    insertBuilder = new InsertBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create InsertBuilder instance', () => {
      expect(insertBuilder).toBeInstanceOf(InsertBuilder)
    })

    it('should initialize with empty query object', () => {
      expect(insertBuilder).toBeDefined()
    })
  })

  describe('into', () => {
    it('should set the table to insert into', () => {
      const result = insertBuilder.into('users')

      expect(result).toBe(insertBuilder)
      expect(InsertMixin.setIntoTable).toHaveBeenCalledWith(expect.any(Object), 'users')
    })

    it('should support method chaining', () => {
      const result = insertBuilder.into('users')
      expect(result).toBe(insertBuilder)
    })
  })

  describe('values', () => {
    it('should set single record values', () => {
      const data = { name: 'John', email: 'john@example.com' }
      const result = insertBuilder.values(data)

      expect(result).toBe(insertBuilder)
      expect(InsertMixin.setValues).toHaveBeenCalledWith(expect.any(Object), data)
    })

    it('should set multiple records values', () => {
      const data = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ]
      const result = insertBuilder.values(data)

      expect(result).toBe(insertBuilder)
      expect(InsertMixin.setValues).toHaveBeenCalledWith(expect.any(Object), data)
    })

    it('should support method chaining', () => {
      const result = insertBuilder.values({ name: 'John' })
      expect(result).toBe(insertBuilder)
    })
  })

  describe('returning', () => {
    it('should set RETURNING columns as string', () => {
      const result = insertBuilder.returning('id')

      expect(result).toBe(insertBuilder)
      expect(ReturningClauseHelper.setReturningColumns).toHaveBeenCalledWith(
        expect.any(Object),
        'id'
      )
    })

    it('should set RETURNING columns as array', () => {
      const result = insertBuilder.returning(['id', 'name'])

      expect(result).toBe(insertBuilder)
      expect(ReturningClauseHelper.setReturningColumns).toHaveBeenCalledWith(expect.any(Object), [
        'id',
        'name'
      ])
    })

    it('should support method chaining', () => {
      const result = insertBuilder.returning('id')
      expect(result).toBe(insertBuilder)
    })
  })

  describe('onConflict', () => {
    it('should set ON CONFLICT DO NOTHING with single column', () => {
      const result = insertBuilder.onConflict('email')

      expect(result).toBe(insertBuilder)
      // Check that conflict is set on the query object
      const query = (insertBuilder as any).query
      expect(query.conflict).toBeDefined()
      expect(query.conflict.target).toEqual(['email'])
      expect(query.conflict.action).toBe('DO_NOTHING')
    })

    it('should set ON CONFLICT DO NOTHING with multiple columns', () => {
      const result = insertBuilder.onConflict(['email', 'username'])

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict.target).toEqual(['email', 'username'])
      expect(query.conflict.action).toBe('DO_NOTHING')
    })

    it('should set ON CONFLICT DO UPDATE with custom action', () => {
      const result = insertBuilder.onConflict('email', 'DO_UPDATE')

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict.action).toBe('DO_UPDATE')
    })

    it('should support method chaining', () => {
      const result = insertBuilder.onConflict('email')
      expect(result).toBe(insertBuilder)
    })
  })

  describe('onConflictUpdate', () => {
    it('should set ON CONFLICT DO UPDATE with update data', () => {
      const updateData = { name: 'Updated Name', updated_at: new Date() }
      const result = insertBuilder.onConflictUpdate(updateData)

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict).toBeDefined()
      expect(query.conflict.action).toBe('DO_UPDATE')
      expect(query.conflict.update).toEqual(updateData)
    })

    it('should set ON CONFLICT DO UPDATE with WHERE conditions', () => {
      const updateData = { name: 'Updated Name' }
      const whereConditions: QueryWhereCondition[] = [
        { column: 'status', operator: '=', value: 'active' }
      ]
      const result = insertBuilder.onConflictUpdate(updateData, whereConditions)

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict.update).toEqual(updateData)
      expect(query.conflict.where).toEqual(whereConditions)
    })

    it('should preserve existing conflict target when updating', () => {
      insertBuilder.onConflict('email')
      const updateData = { name: 'Updated Name' }
      const result = insertBuilder.onConflictUpdate(updateData)

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict.target).toEqual(['email'])
      expect(query.conflict.action).toBe('DO_UPDATE')
      expect(query.conflict.update).toEqual(updateData)
    })

    it('should support method chaining', () => {
      const result = insertBuilder.onConflictUpdate({ name: 'Updated' })
      expect(result).toBe(insertBuilder)
    })
  })

  describe('query building', () => {
    it('should call toSQL method which internally calls buildQuery', () => {
      insertBuilder.into('users').values({ name: 'John' })

      const sql = insertBuilder.toSQL()

      expect(sql).toBeDefined()
      expect(typeof sql).toBe('string')
    })

    it('should call toParams method which internally calls buildQuery', () => {
      insertBuilder.into('users').values({ name: 'John', email: 'john@example.com' })

      const params = insertBuilder.toParams()

      expect(params).toBeDefined()
      expect(Array.isArray(params)).toBe(true)
    })

    it('should call execute method which internally calls buildQuery', async () => {
      insertBuilder.into('users').values({ name: 'John' }).returning('id')

      const result = await insertBuilder.execute()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('method chaining', () => {
    it('should support complex method chaining', () => {
      const result = insertBuilder
        .into('users')
        .values({ name: 'John', email: 'john@example.com' })
        .onConflict('email')
        .returning(['id', 'name'])

      expect(result).toBe(insertBuilder)
    })

    it('should support ON CONFLICT DO UPDATE chaining', () => {
      const result = insertBuilder
        .into('users')
        .values({ name: 'John', email: 'john@example.com' })
        .onConflict('email')
        .onConflictUpdate({ name: 'Updated Name' })
        .returning('id')

      expect(result).toBe(insertBuilder)
    })
  })

  describe('query validation', () => {
    it('should validate INSERT query before building', () => {
      insertBuilder.into('users').values({ name: 'John' })

      insertBuilder.toSQL()

      expect(QueryValidator.validateInsertQuery).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('edge cases', () => {
    it('should handle empty table name', () => {
      expect(() => {
        insertBuilder.into('')
      }).not.toThrow()
    })

    it('should handle empty values object', () => {
      const result = insertBuilder.values({})
      expect(result).toBe(insertBuilder)
    })

    it('should handle null values in data', () => {
      const result = insertBuilder.values({ name: 'John', description: null })
      expect(result).toBe(insertBuilder)
    })

    it('should handle undefined values in data', () => {
      const result = insertBuilder.values({ name: 'John', optional_field: undefined })
      expect(result).toBe(insertBuilder)
    })

    it('should handle array values in data', () => {
      const result = insertBuilder.values({
        name: 'John',
        tags: ['admin', 'user']
      })
      expect(result).toBe(insertBuilder)
    })

    it('should handle object values in data', () => {
      const result = insertBuilder.values({
        name: 'John',
        metadata: { key: 'value' }
      })
      expect(result).toBe(insertBuilder)
    })

    it('should handle empty array for multiple records', () => {
      const result = insertBuilder.values([])
      expect(result).toBe(insertBuilder)
    })

    it('should handle single record in array', () => {
      const result = insertBuilder.values([{ name: 'John' }])
      expect(result).toBe(insertBuilder)
    })
  })

  describe('conflict handling', () => {
    it('should handle multiple calls to onConflict', () => {
      insertBuilder.onConflict('email')
      const result = insertBuilder.onConflict('username')

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict.target).toEqual(['username'])
    })

    it('should handle onConflictUpdate without prior onConflict', () => {
      const result = insertBuilder.onConflictUpdate({ name: 'Updated' })

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict.action).toBe('DO_UPDATE')
      expect(query.conflict.target).toEqual([])
    })

    it('should handle complex conflict scenarios', () => {
      const result = insertBuilder
        .into('users')
        .values({ name: 'John', email: 'john@example.com' })
        .onConflict(['email', 'username'])
        .onConflictUpdate({ name: 'Updated Name', updated_at: new Date() }, [
          { column: 'status', operator: '=', value: 'active' }
        ])
        .returning(['id', 'name'])

      expect(result).toBe(insertBuilder)
      const query = (insertBuilder as any).query
      expect(query.conflict.target).toEqual(['email', 'username'])
      expect(query.conflict.action).toBe('DO_UPDATE')
      expect(query.conflict.update).toBeDefined()
      expect(query.conflict.where).toBeDefined()
    })
  })
})
