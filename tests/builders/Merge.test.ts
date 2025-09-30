import { MergeBuilder } from '@builders/Merge'
import { Connection } from '@core/index'
import { QueryValidator } from '@core/security/index'
import { Base } from '@core/dialects/index'
import type { QueryMerge, QueryWhereCondition, QuerySubQuery } from '@interfaces/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getDialect: jest.fn().mockReturnValue({
      buildMergeQuery: jest.fn().mockReturnValue({
        sql: 'MERGE INTO "users" USING "temp_users" ON "users"."id" = "temp_users"."user_id"',
        params: []
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
    validateMergeQuery: jest.fn()
  }
}))

const mockBuildMergeQuery = jest.fn().mockReturnValue({
  sql: 'MERGE INTO "users" USING "temp_users" ON "users"."id" = "temp_users"."user_id"',
  params: []
})

jest.mock('@core/dialects/index', () => ({
  Base: jest.fn().mockImplementation(() => ({
    buildMergeQuery: mockBuildMergeQuery
  }))
}))

describe('MergeBuilder', () => {
  let mockConnectionManager: any
  let mergeBuilder: MergeBuilder

  beforeEach(() => {
    mockConnectionManager = new Connection({} as any)
    mergeBuilder = new MergeBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create MergeBuilder instance', () => {
      expect(mergeBuilder).toBeInstanceOf(MergeBuilder)
    })

    it('should initialize with empty query object', () => {
      expect(mergeBuilder).toBeDefined()
    })
  })

  describe('into', () => {
    it('should set the target table', () => {
      const result = mergeBuilder.into('users')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.into).toBe('users')
    })

    it('should support method chaining', () => {
      const result = mergeBuilder.into('users')
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('using', () => {
    it('should set source table as string', () => {
      const result = mergeBuilder.using('temp_users')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.using).toBe('temp_users')
    })

    it('should set source as subquery', () => {
      const subquery: QuerySubQuery = {
        sql: 'SELECT * FROM temp_users WHERE active = ?',
        params: [true]
      }
      const result = mergeBuilder.using(subquery)

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.using).toBe(subquery)
    })

    it('should support method chaining', () => {
      const result = mergeBuilder.using('temp_users')
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('on', () => {
    it('should set join conditions', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'users.id', operator: '=', value: 'temp_users.user_id' }
      ]
      const result = mergeBuilder.on(conditions)

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.on).toBe(conditions)
    })

    it('should set multiple join conditions', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'users.id', operator: '=', value: 'temp_users.user_id' },
        { column: 'users.status', operator: '=', value: 'temp_users.status' }
      ]
      const result = mergeBuilder.on(conditions)

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.on).toBe(conditions)
    })

    it('should support method chaining', () => {
      const result = mergeBuilder.on([{ column: 'id', operator: '=', value: 1 }])
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('whenMatchedUpdate', () => {
    it('should set WHEN MATCHED UPDATE clause', () => {
      const updateData = { name: 'Updated Name', updated_at: new Date() }
      const result = mergeBuilder.whenMatchedUpdate(updateData)

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched).toEqual({ update: updateData })
    })

    it('should handle single field update', () => {
      const updateData = { name: 'New Name' }
      const result = mergeBuilder.whenMatchedUpdate(updateData)

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched.update).toBe(updateData)
    })

    it('should handle empty update data', () => {
      const result = mergeBuilder.whenMatchedUpdate({})

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched.update).toEqual({})
    })

    it('should support method chaining', () => {
      const result = mergeBuilder.whenMatchedUpdate({ name: 'Updated' })
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('whenMatchedDelete', () => {
    it('should set WHEN MATCHED DELETE clause', () => {
      const result = mergeBuilder.whenMatchedDelete()

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched).toEqual({ delete: true })
    })

    it('should support method chaining', () => {
      const result = mergeBuilder.whenMatchedDelete()
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('whenNotMatchedInsert', () => {
    it('should set WHEN NOT MATCHED INSERT clause', () => {
      const insertData = { name: 'New User', email: 'new@example.com' }
      const result = mergeBuilder.whenNotMatchedInsert(insertData)

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenNotMatched).toEqual({ insert: insertData })
    })

    it('should handle single field insert', () => {
      const insertData = { name: 'New User' }
      const result = mergeBuilder.whenNotMatchedInsert(insertData)

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenNotMatched.insert).toBe(insertData)
    })

    it('should handle empty insert data', () => {
      const result = mergeBuilder.whenNotMatchedInsert({})

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenNotMatched.insert).toEqual({})
    })

    it('should support method chaining', () => {
      const result = mergeBuilder.whenNotMatchedInsert({ name: 'New User' })
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('returning', () => {
    it('should set RETURNING columns as string', () => {
      const result = mergeBuilder.returning('id')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.returning).toEqual(['id'])
    })

    it('should set RETURNING columns as multiple arguments', () => {
      const result = mergeBuilder.returning('id', 'name')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.returning).toEqual(['id', 'name'])
    })

    it('should handle multiple returning calls', () => {
      mergeBuilder.returning('id')
      const result = mergeBuilder.returning('name')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.returning).toEqual(['name'])
    })

    it('should support method chaining', () => {
      const result = mergeBuilder.returning('id')
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('query building', () => {
    it('should call toSQL method which internally calls buildQuery', () => {
      mergeBuilder.into('users').using('temp_users')

      const sql = mergeBuilder.toSQL()

      expect(sql).toBeDefined()
      expect(typeof sql).toBe('string')
    })

    it('should call toParams method which internally calls buildQuery', () => {
      mergeBuilder.into('users').using('temp_users')

      const params = mergeBuilder.toParams()

      expect(params).toBeDefined()
      expect(Array.isArray(params)).toBe(true)
    })

    it('should call execute method which internally calls buildQuery', async () => {
      mergeBuilder.into('users').using('temp_users')

      const result = await mergeBuilder.execute()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('toSQL', () => {
    it('should return SQL string', () => {
      mergeBuilder.into('users').using('temp_users')

      const sql = mergeBuilder.toSQL()

      expect(sql).toBeDefined()
      expect(typeof sql).toBe('string')
    })

    it('should handle complex MERGE query', () => {
      mergeBuilder
        .into('users')
        .using('temp_users')
        .on([{ column: 'users.id', operator: '=', value: 'temp_users.user_id' }])
        .whenMatchedUpdate({ name: 'Updated' })
        .whenNotMatchedInsert({ name: 'New User' })
        .returning(['id', 'name'])

      const sql = mergeBuilder.toSQL()

      expect(sql).toBeDefined()
      expect(typeof sql).toBe('string')
    })
  })

  describe('toParams', () => {
    it('should return parameters array', () => {
      mergeBuilder.into('users').using('temp_users')

      const params = mergeBuilder.toParams()

      expect(params).toBeDefined()
      expect(Array.isArray(params)).toBe(true)
    })

    it('should handle parameters from subquery', () => {
      const subquery: QuerySubQuery = {
        sql: 'SELECT * FROM temp_users WHERE active = ?',
        params: [true]
      }
      mergeBuilder.into('users').using(subquery)

      const params = mergeBuilder.toParams()

      expect(params).toBeDefined()
      expect(Array.isArray(params)).toBe(true)
    })
  })

  describe('execute', () => {
    it('should execute MERGE query', async () => {
      mergeBuilder.into('users').using('temp_users')

      const result = await mergeBuilder.execute()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should execute complex MERGE query', async () => {
      mergeBuilder
        .into('users')
        .using('temp_users')
        .on([{ column: 'users.id', operator: '=', value: 'temp_users.user_id' }])
        .whenMatchedUpdate({ name: 'Updated' })
        .whenNotMatchedInsert({ name: 'New User' })
        .returning(['id', 'name'])

      const result = await mergeBuilder.execute()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('method chaining', () => {
    it('should support complex method chaining', () => {
      const result = mergeBuilder
        .into('users')
        .using('temp_users')
        .on([{ column: 'users.id', operator: '=', value: 'temp_users.user_id' }])
        .whenMatchedUpdate({ name: 'Updated Name' })
        .whenNotMatchedInsert({ name: 'New User', email: 'new@example.com' })
        .returning(['id', 'name'])

      expect(result).toBe(mergeBuilder)
    })

    it('should support multiple WHEN MATCHED operations', () => {
      const result = mergeBuilder
        .into('users')
        .using('temp_users')
        .whenMatchedUpdate({ name: 'Updated' })
        .whenMatchedDelete()

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched.delete).toBe(true)
    })

    it('should support multiple WHEN NOT MATCHED operations', () => {
      const result = mergeBuilder
        .into('users')
        .using('temp_users')
        .whenNotMatchedInsert({ name: 'New User' })
        .whenNotMatchedInsert({ email: 'new@example.com' })

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenNotMatched.insert).toEqual({ email: 'new@example.com' })
    })
  })

  describe('query validation', () => {
    it('should validate MERGE query before building', () => {
      mergeBuilder.into('users').using('temp_users')

      mergeBuilder.buildQuery()

      expect(QueryValidator.validateMergeQuery).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('edge cases', () => {
    it('should handle empty table name', () => {
      expect(() => {
        mergeBuilder.into('')
      }).not.toThrow()
    })

    it('should handle empty source table', () => {
      expect(() => {
        mergeBuilder.using('')
      }).not.toThrow()
    })

    it('should handle empty ON conditions', () => {
      expect(() => {
        mergeBuilder.on([])
      }).not.toThrow()
    })

    it('should handle null values in update data', () => {
      const result = mergeBuilder.whenMatchedUpdate({ name: 'John', description: null })
      expect(result).toBe(mergeBuilder)
    })

    it('should handle undefined values in update data', () => {
      const result = mergeBuilder.whenMatchedUpdate({ name: 'John', optional_field: undefined })
      expect(result).toBe(mergeBuilder)
    })

    it('should handle null values in insert data', () => {
      const result = mergeBuilder.whenNotMatchedInsert({ name: 'John', description: null })
      expect(result).toBe(mergeBuilder)
    })

    it('should handle undefined values in insert data', () => {
      const result = mergeBuilder.whenNotMatchedInsert({ name: 'John', optional_field: undefined })
      expect(result).toBe(mergeBuilder)
    })

    it('should handle array values in data', () => {
      const result = mergeBuilder.whenMatchedUpdate({
        name: 'John',
        tags: ['admin', 'user']
      })
      expect(result).toBe(mergeBuilder)
    })

    it('should handle object values in data', () => {
      const result = mergeBuilder.whenMatchedUpdate({
        name: 'John',
        metadata: { key: 'value' }
      })
      expect(result).toBe(mergeBuilder)
    })
  })

  describe('complex scenarios', () => {
    it('should handle full MERGE with UPDATE and INSERT', () => {
      const result = mergeBuilder
        .into('users')
        .using('temp_users')
        .on([
          { column: 'users.id', operator: '=', value: 'temp_users.user_id' },
          { column: 'users.status', operator: '=', value: 'temp_users.status' }
        ])
        .whenMatchedUpdate({
          name: 'Updated Name',
          updated_at: new Date(),
          status: 'active'
        })
        .whenNotMatchedInsert({
          name: 'New User',
          email: 'new@example.com',
          status: 'pending'
        })
        .returning('id', 'name', 'email', 'status')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.into).toBe('users')
      expect(query.using).toBe('temp_users')
      expect(query.on).toHaveLength(2)
      expect(query.whenMatched.update).toBeDefined()
      expect(query.whenNotMatched.insert).toBeDefined()
      expect(query.returning).toEqual(['id', 'name', 'email', 'status'])
    })

    it('should handle MERGE with DELETE only', () => {
      const result = mergeBuilder
        .into('users')
        .using('temp_users')
        .on([{ column: 'users.id', operator: '=', value: 'temp_users.user_id' }])
        .whenMatchedDelete()
        .returning('id')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched.delete).toBe(true)
      expect(query.whenNotMatched).toBeUndefined()
    })

    it('should handle MERGE with INSERT only', () => {
      const result = mergeBuilder
        .into('users')
        .using('temp_users')
        .on([{ column: 'users.id', operator: '=', value: 'temp_users.user_id' }])
        .whenNotMatchedInsert({ name: 'New User' })
        .returning('id')

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched).toBeUndefined()
      expect(query.whenNotMatched.insert).toBeDefined()
    })

    it('should handle MERGE with subquery source', () => {
      const subquery: QuerySubQuery = {
        sql: 'SELECT * FROM temp_users WHERE active = ? AND created_at > ?',
        params: [true, new Date('2023-01-01')]
      }

      const result = mergeBuilder
        .into('users')
        .using(subquery)
        .on([{ column: 'users.id', operator: '=', value: 'temp_users.user_id' }])
        .whenMatchedUpdate({ name: 'Updated' })
        .whenNotMatchedInsert({ name: 'New User' })

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.using).toBe(subquery)
    })
  })

  describe('security considerations', () => {
    it('should handle potentially malicious table names', () => {
      const result = mergeBuilder.into("'; DROP TABLE users; --")

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.into).toBe("'; DROP TABLE users; --")
    })

    it('should handle potentially malicious source names', () => {
      const result = mergeBuilder.using("'; DROP TABLE users; --")

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.using).toBe("'; DROP TABLE users; --")
    })

    it('should handle potentially malicious data values', () => {
      const result = mergeBuilder.whenMatchedUpdate({
        name: "'; DROP TABLE users; --"
      })

      expect(result).toBe(mergeBuilder)
      const query = (mergeBuilder as any).query
      expect(query.whenMatched.update.name).toBe("'; DROP TABLE users; --")
    })
  })
})
