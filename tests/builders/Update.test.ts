import { UpdateBuilder } from '@builders/Update'
import { Connection } from '@core/index'
import { QueryValidator } from '@core/security/index'
import { ReturningClauseHelper, WhereConditionHelper } from '@builders/helpers/index'
import { UpdateMixin, WhereMixin } from '@builders/mixins/index'
import type { QueryUpdate, QueryWhereCondition } from '@interfaces/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getDialect: jest.fn().mockReturnValue({
      buildUpdateQuery: jest.fn().mockReturnValue({
        sql: 'UPDATE "users" SET "name" = $1, "email" = $2 WHERE "id" = $3',
        params: ['John', 'john@example.com', 1]
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
    validateUpdateQuery: jest.fn()
  }
}))

jest.mock('@builders/helpers/index', () => ({
  ReturningClauseHelper: {
    setReturningColumns: jest.fn(),
    buildReturningClause: jest.fn().mockReturnValue('RETURNING "id"')
  },
  WhereConditionHelper: {
    buildWhereConditions: jest.fn().mockReturnValue('"id" = $1')
  }
}))

jest.mock('@builders/mixins/index', () => ({
  UpdateMixin: {
    setUpdateTable: jest.fn(),
    setUpdateData: jest.fn(),
    buildUpdateClause: jest.fn().mockReturnValue('UPDATE "users"'),
    buildSetClause: jest.fn().mockReturnValue('SET "name" = $1')
  },
  WhereMixin: {
    addWhereCondition: jest.fn(),
    addAndWhereCondition: jest.fn(),
    addOrWhereCondition: jest.fn()
  }
}))

describe('UpdateBuilder', () => {
  let mockConnectionManager: any
  let updateBuilder: UpdateBuilder

  beforeEach(() => {
    mockConnectionManager = new Connection({} as any)
    updateBuilder = new UpdateBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create UpdateBuilder instance', () => {
      expect(updateBuilder).toBeInstanceOf(UpdateBuilder)
    })

    it('should initialize with empty query object', () => {
      expect(updateBuilder).toBeDefined()
    })
  })

  describe('table', () => {
    it('should set the table to update', () => {
      const result = updateBuilder.table('users')

      expect(result).toBe(updateBuilder)
      expect(UpdateMixin.setUpdateTable).toHaveBeenCalledWith(expect.any(Object), 'users')
    })

    it('should support method chaining', () => {
      const result = updateBuilder.table('users')
      expect(result).toBe(updateBuilder)
    })
  })

  describe('set', () => {
    it('should set update data', () => {
      const data = { name: 'John', email: 'john@example.com' }
      const result = updateBuilder.set(data)

      expect(result).toBe(updateBuilder)
      expect(UpdateMixin.setUpdateData).toHaveBeenCalledWith(expect.any(Object), data)
    })

    it('should handle single field update', () => {
      const data = { name: 'John' }
      const result = updateBuilder.set(data)

      expect(result).toBe(updateBuilder)
      expect(UpdateMixin.setUpdateData).toHaveBeenCalledWith(expect.any(Object), data)
    })

    it('should handle multiple field update', () => {
      const data = {
        name: 'John',
        email: 'john@example.com',
        updated_at: new Date()
      }
      const result = updateBuilder.set(data)

      expect(result).toBe(updateBuilder)
      expect(UpdateMixin.setUpdateData).toHaveBeenCalledWith(expect.any(Object), data)
    })

    it('should support method chaining', () => {
      const result = updateBuilder.set({ name: 'John' })
      expect(result).toBe(updateBuilder)
    })
  })

  describe('where', () => {
    it('should add WHERE condition with column, operator, and value', () => {
      const result = updateBuilder.where('id', '=', 1)

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(expect.any(Object), 'id', '=', 1)
    })

    it('should add WHERE condition with condition object', () => {
      const condition: QueryWhereCondition = {
        column: 'status',
        operator: '=',
        value: 'active'
      }
      const result = updateBuilder.where(condition)

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        condition,
        undefined,
        undefined
      )
    })

    it('should add WHERE condition with column and value (default operator)', () => {
      const result = updateBuilder.where('id', 1)

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'id',
        1,
        undefined
      )
    })

    it('should handle different operators', () => {
      updateBuilder.where('age', '>', 18)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(expect.any(Object), 'age', '>', 18)

      updateBuilder.where('name', 'LIKE', 'John%')
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'name',
        'LIKE',
        'John%'
      )

      updateBuilder.where('status', 'IN', ['active', 'pending'])
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'status',
        'IN',
        ['active', 'pending']
      )
    })
  })

  describe('andWhere', () => {
    it('should add AND WHERE condition with column, operator, and value', () => {
      const result = updateBuilder.andWhere('status', '=', 'active')

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addAndWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'status',
        '=',
        'active'
      )
    })

    it('should add AND WHERE condition with condition object', () => {
      const condition: QueryWhereCondition = {
        column: 'deleted_at',
        operator: 'IS NULL',
        value: null
      }
      const result = updateBuilder.andWhere(condition)

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addAndWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        condition,
        undefined,
        undefined
      )
    })

    it('should add AND WHERE condition with column and value', () => {
      const result = updateBuilder.andWhere('age', 25)

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addAndWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'age',
        25,
        undefined
      )
    })
  })

  describe('orWhere', () => {
    it('should add OR WHERE condition with column, operator, and value', () => {
      const result = updateBuilder.orWhere('deleted_at', 'IS NULL')

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addOrWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'deleted_at',
        'IS NULL',
        undefined
      )
    })

    it('should add OR WHERE condition with condition object', () => {
      const condition: QueryWhereCondition = {
        column: 'status',
        operator: '=',
        value: 'inactive'
      }
      const result = updateBuilder.orWhere(condition)

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addOrWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        condition,
        undefined,
        undefined
      )
    })

    it('should add OR WHERE condition with column and value', () => {
      const result = updateBuilder.orWhere('priority', 'high')

      expect(result).toBe(updateBuilder)
      expect(WhereMixin.addOrWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'priority',
        'high',
        undefined
      )
    })
  })

  describe('returning', () => {
    it('should set RETURNING columns as string', () => {
      const result = updateBuilder.returning('id')

      expect(result).toBe(updateBuilder)
      expect(ReturningClauseHelper.setReturningColumns).toHaveBeenCalledWith(
        expect.any(Object),
        'id'
      )
    })

    it('should set RETURNING columns as array', () => {
      const result = updateBuilder.returning(['id', 'name'])

      expect(result).toBe(updateBuilder)
      expect(ReturningClauseHelper.setReturningColumns).toHaveBeenCalledWith(expect.any(Object), [
        'id',
        'name'
      ])
    })

    it('should support method chaining', () => {
      const result = updateBuilder.returning('id')
      expect(result).toBe(updateBuilder)
    })
  })

  describe('query building', () => {
    it('should call toSQL method which internally calls buildQuery', () => {
      updateBuilder.table('users').set({ name: 'John' })

      const sql = updateBuilder.toSQL()

      expect(sql).toBeDefined()
      expect(typeof sql).toBe('string')
    })

    it('should call toParams method which internally calls buildQuery', () => {
      updateBuilder.table('users').set({ name: 'John' }).where('id', '=', 1)

      const params = updateBuilder.toParams()

      expect(params).toBeDefined()
      expect(Array.isArray(params)).toBe(true)
    })

    it('should call execute method which internally calls buildQuery', async () => {
      updateBuilder.table('users').set({ name: 'John' }).returning('id')

      const result = await updateBuilder.execute()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('method chaining', () => {
    it('should support complex method chaining', () => {
      const result = updateBuilder
        .table('users')
        .set({ name: 'John', email: 'john@example.com' })
        .where('id', '=', 1)
        .andWhere('status', '=', 'active')
        .orWhere('deleted_at', 'IS NULL')
        .returning(['id', 'name'])

      expect(result).toBe(updateBuilder)
    })

    it('should support multiple WHERE conditions', () => {
      const result = updateBuilder
        .table('users')
        .set({ name: 'John' })
        .where('age', '>', 18)
        .andWhere('status', '=', 'active')
        .orWhere('priority', '=', 'high')
        .andWhere('deleted_at', 'IS NULL')

      expect(result).toBe(updateBuilder)
    })
  })

  describe('query validation', () => {
    it('should validate UPDATE query before building', () => {
      updateBuilder.table('users').set({ name: 'John' }).where('id', '=', 1)

      updateBuilder.toSQL()

      expect(QueryValidator.validateUpdateQuery).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('edge cases', () => {
    it('should handle empty table name', () => {
      expect(() => {
        updateBuilder.table('')
      }).not.toThrow()
    })

    it('should handle empty update data', () => {
      const result = updateBuilder.set({})
      expect(result).toBe(updateBuilder)
    })

    it('should handle null values in update data', () => {
      const result = updateBuilder.set({ name: 'John', description: null })
      expect(result).toBe(updateBuilder)
    })

    it('should handle undefined values in update data', () => {
      const result = updateBuilder.set({ name: 'John', optional_field: undefined })
      expect(result).toBe(updateBuilder)
    })

    it('should handle array values in update data', () => {
      const result = updateBuilder.set({
        name: 'John',
        tags: ['admin', 'user']
      })
      expect(result).toBe(updateBuilder)
    })

    it('should handle object values in update data', () => {
      const result = updateBuilder.set({
        name: 'John',
        metadata: { key: 'value' }
      })
      expect(result).toBe(updateBuilder)
    })

    it('should handle null values in WHERE conditions', () => {
      const result = updateBuilder.where('deleted_at', 'IS NULL', null)
      expect(result).toBe(updateBuilder)
    })

    it('should handle undefined values in WHERE conditions', () => {
      const result = updateBuilder.where('optional_field', '=', undefined)
      expect(result).toBe(updateBuilder)
    })

    it('should handle array values in WHERE conditions', () => {
      const result = updateBuilder.where('status', 'IN', ['active', 'pending', 'draft'])
      expect(result).toBe(updateBuilder)
    })

    it('should handle object values in WHERE conditions', () => {
      const result = updateBuilder.where('metadata', '=', { key: 'value' })
      expect(result).toBe(updateBuilder)
    })
  })

  describe('update scenarios', () => {
    it('should handle single field update', () => {
      const result = updateBuilder.table('users').set({ name: 'John' }).where('id', '=', 1)

      expect(result).toBe(updateBuilder)
    })

    it('should handle multiple field update', () => {
      const result = updateBuilder
        .table('users')
        .set({
          name: 'John',
          email: 'john@example.com',
          updated_at: new Date()
        })
        .where('id', '=', 1)

      expect(result).toBe(updateBuilder)
    })

    it('should handle conditional update', () => {
      const result = updateBuilder
        .table('users')
        .set({ status: 'inactive' })
        .where('last_login', '<', new Date('2023-01-01'))
        .andWhere('active', '=', true)

      expect(result).toBe(updateBuilder)
    })

    it('should handle bulk update', () => {
      const result = updateBuilder
        .table('users')
        .set({ status: 'inactive' })
        .where('status', '=', 'active')
        .andWhere('created_at', '<', new Date('2022-01-01'))

      expect(result).toBe(updateBuilder)
    })

    it('should handle update with RETURNING clause', () => {
      const result = updateBuilder
        .table('users')
        .set({ name: 'John' })
        .where('id', '=', 1)
        .returning(['id', 'name', 'email'])

      expect(result).toBe(updateBuilder)
    })
  })
})
