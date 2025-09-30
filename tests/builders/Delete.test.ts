import { DeleteBuilder } from '@builders/Delete'
import { Connection } from '@core/index'
import { QueryValidator } from '@core/security/index'
import { ReturningClauseHelper, WhereConditionHelper } from '@builders/helpers/index'
import { DeleteMixin, WhereMixin } from '@builders/mixins/index'
import type { QueryDelete, QueryWhereCondition } from '@interfaces/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getDialect: jest.fn().mockReturnValue({
      buildDeleteQuery: jest.fn().mockReturnValue({
        sql: 'DELETE FROM "users" WHERE "id" = $1',
        params: [1]
      })
    }),
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({
        rows: [],
        rowCount: 0
      })
    }),
    releaseConnection: jest.fn().mockResolvedValue(undefined)
  }))
}))

jest.mock('@core/security/index', () => ({
  QueryValidator: {
    validateDeleteQuery: jest.fn()
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
  DeleteMixin: {
    setDeleteFrom: jest.fn(),
    buildDeleteClause: jest.fn().mockReturnValue('DELETE FROM "users"')
  },
  WhereMixin: {
    addWhereCondition: jest.fn(),
    addAndWhereCondition: jest.fn(),
    addOrWhereCondition: jest.fn()
  }
}))

describe('DeleteBuilder', () => {
  let mockConnectionManager: any
  let deleteBuilder: DeleteBuilder

  beforeEach(() => {
    mockConnectionManager = new Connection({} as any)
    deleteBuilder = new DeleteBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create DeleteBuilder instance', () => {
      expect(deleteBuilder).toBeInstanceOf(DeleteBuilder)
    })

    it('should initialize with empty query object', () => {
      expect(deleteBuilder).toBeDefined()
    })
  })

  describe('from', () => {
    it('should set the table to delete from', () => {
      const result = deleteBuilder.from('users')

      expect(result).toBe(deleteBuilder)
      expect(DeleteMixin.setDeleteFrom).toHaveBeenCalledWith(expect.any(Object), 'users')
    })

    it('should support method chaining', () => {
      const result = deleteBuilder.from('users')
      expect(result).toBe(deleteBuilder)
    })
  })

  describe('where', () => {
    it('should add WHERE condition with column, operator, and value', () => {
      const result = deleteBuilder.where('id', '=', 1)

      expect(result).toBe(deleteBuilder)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(expect.any(Object), 'id', '=', 1)
    })

    it('should add WHERE condition with condition object', () => {
      const condition: QueryWhereCondition = {
        column: 'status',
        operator: '=',
        value: 'active'
      }
      const result = deleteBuilder.where(condition)

      expect(result).toBe(deleteBuilder)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        condition,
        undefined,
        undefined
      )
    })

    it('should add WHERE condition with column and value (default operator)', () => {
      const result = deleteBuilder.where('id', 1)

      expect(result).toBe(deleteBuilder)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'id',
        1,
        undefined
      )
    })

    it('should handle different operators', () => {
      deleteBuilder.where('age', '>', 18)
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(expect.any(Object), 'age', '>', 18)

      deleteBuilder.where('name', 'LIKE', 'John%')
      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        'name',
        'LIKE',
        'John%'
      )

      deleteBuilder.where('status', 'IN', ['active', 'pending'])
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
      const result = deleteBuilder.andWhere('status', '=', 'active')

      expect(result).toBe(deleteBuilder)
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
      const result = deleteBuilder.andWhere(condition)

      expect(result).toBe(deleteBuilder)
      expect(WhereMixin.addAndWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        condition,
        undefined,
        undefined
      )
    })

    it('should add AND WHERE condition with column and value', () => {
      const result = deleteBuilder.andWhere('age', 25)

      expect(result).toBe(deleteBuilder)
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
      const result = deleteBuilder.orWhere('deleted_at', 'IS NULL')

      expect(result).toBe(deleteBuilder)
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
      const result = deleteBuilder.orWhere(condition)

      expect(result).toBe(deleteBuilder)
      expect(WhereMixin.addOrWhereCondition).toHaveBeenCalledWith(
        expect.any(Object),
        condition,
        undefined,
        undefined
      )
    })

    it('should add OR WHERE condition with column and value', () => {
      const result = deleteBuilder.orWhere('priority', 'high')

      expect(result).toBe(deleteBuilder)
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
      const result = deleteBuilder.returning('id')

      expect(result).toBe(deleteBuilder)
      expect(ReturningClauseHelper.setReturningColumns).toHaveBeenCalledWith(
        expect.any(Object),
        'id'
      )
    })

    it('should set RETURNING columns as array', () => {
      const result = deleteBuilder.returning(['id', 'name'])

      expect(result).toBe(deleteBuilder)
      expect(ReturningClauseHelper.setReturningColumns).toHaveBeenCalledWith(expect.any(Object), [
        'id',
        'name'
      ])
    })

    it('should support method chaining', () => {
      const result = deleteBuilder.returning('id')
      expect(result).toBe(deleteBuilder)
    })
  })

  describe('query building', () => {
    it('should call toSQL method which internally calls buildQuery', () => {
      deleteBuilder.from('users')

      const sql = deleteBuilder.toSQL()

      expect(sql).toBeDefined()
      expect(typeof sql).toBe('string')
    })

    it('should call toParams method which internally calls buildQuery', () => {
      deleteBuilder.from('users').where('id', '=', 1)

      const params = deleteBuilder.toParams()

      expect(params).toBeDefined()
      expect(Array.isArray(params)).toBe(true)
    })

    it('should call execute method which internally calls buildQuery', async () => {
      deleteBuilder.from('users').returning('id')

      const result = await deleteBuilder.execute()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('method chaining', () => {
    it('should support complex method chaining', () => {
      const result = deleteBuilder
        .from('users')
        .where('id', '=', 1)
        .andWhere('status', '=', 'active')
        .orWhere('deleted_at', 'IS NULL')
        .returning(['id', 'name'])

      expect(result).toBe(deleteBuilder)
    })

    it('should support multiple WHERE conditions', () => {
      const result = deleteBuilder
        .from('users')
        .where('age', '>', 18)
        .andWhere('status', '=', 'active')
        .orWhere('priority', '=', 'high')
        .andWhere('deleted_at', 'IS NULL')

      expect(result).toBe(deleteBuilder)
    })
  })

  describe('query validation', () => {
    it('should validate DELETE query before building', () => {
      deleteBuilder.from('users').where('id', '=', 1)

      deleteBuilder.buildQuery()

      expect(QueryValidator.validateDeleteQuery).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('edge cases', () => {
    it('should handle empty table name', () => {
      expect(() => {
        deleteBuilder.from('')
      }).not.toThrow()
    })

    it('should handle null values in WHERE conditions', () => {
      const result = deleteBuilder.where('deleted_at', 'IS NULL', null)
      expect(result).toBe(deleteBuilder)
    })

    it('should handle undefined values in WHERE conditions', () => {
      const result = deleteBuilder.where('optional_field', '=', undefined)
      expect(result).toBe(deleteBuilder)
    })

    it('should handle array values in WHERE conditions', () => {
      const result = deleteBuilder.where('status', 'IN', ['active', 'pending', 'draft'])
      expect(result).toBe(deleteBuilder)
    })

    it('should handle object values in WHERE conditions', () => {
      const result = deleteBuilder.where('metadata', '=', { key: 'value' })
      expect(result).toBe(deleteBuilder)
    })
  })
})
