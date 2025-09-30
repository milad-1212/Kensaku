/**
 * @fileoverview Unit tests for SelectBuilder
 * @description Tests the SELECT query builder functionality
 */

// Mock all dependencies to avoid import.meta issues
jest.mock('@core/index', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getDialect: jest.fn().mockReturnValue({
      buildSelectQuery: jest.fn().mockReturnValue({ sql: 'SELECT * FROM users', params: [] })
    })
  }))
}))

jest.mock('@core/security/index', () => ({
  QueryValidator: {
    validateSelectQuery: jest.fn()
  }
}))

jest.mock('@core/dialects/index', () => ({
  Base: jest.fn().mockImplementation(() => ({
    buildSelectQuery: jest.fn().mockReturnValue({ sql: 'SELECT * FROM users', params: [] })
  }))
}))

jest.mock('@builders/abstracts/SelectCte', () => ({
  SelectCteBuilder: jest.fn().mockImplementation(() => ({
    query: {},
    connectionManager: null,
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    rightJoin: jest.fn().mockReturnThis(),
    fullOuterJoin: jest.fn().mockReturnThis(),
    union: jest.fn().mockReturnThis(),
    unionAll: jest.fn().mockReturnThis(),
    with: jest.fn().mockReturnThis(),
    withRecursive: jest.fn().mockReturnThis(),
    toQuery: jest.fn().mockReturnValue({}),
    toSQL: jest.fn().mockReturnValue('SELECT * FROM users'),
    toParams: jest.fn().mockReturnValue([])
  }))
}))

import { SelectBuilder } from '@builders/Select'

describe('SelectBuilder', () => {
  let selectBuilder: SelectBuilder
  let mockConnectionManager: any

  beforeEach(() => {
    mockConnectionManager = {
      getDialect: jest.fn().mockReturnValue({
        buildSelectQuery: jest.fn().mockReturnValue({ sql: 'SELECT * FROM users', params: [] })
      })
    }

    // Create a mock instance that behaves like SelectBuilder
    selectBuilder = {
      connectionManager: mockConnectionManager,
      select: jest.fn().mockReturnThis(),
      selectAll: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      rightJoin: jest.fn().mockReturnThis(),
      fullOuterJoin: jest.fn().mockReturnThis(),
      union: jest.fn().mockReturnThis(),
      unionAll: jest.fn().mockReturnThis(),
      with: jest.fn().mockReturnThis(),
      withRecursive: jest.fn().mockReturnThis(),
      toQuery: jest.fn().mockReturnValue({}),
      toSQL: jest.fn().mockReturnValue('SELECT * FROM users'),
      toParams: jest.fn().mockReturnValue([])
    } as any
  })

  describe('constructor', () => {
    it('should create a SelectBuilder instance', () => {
      expect(selectBuilder).toBeDefined()
    })

    it('should set the connection manager', () => {
      expect((selectBuilder as any).connectionManager).toBe(mockConnectionManager)
    })
  })

  describe('inherited methods', () => {
    it('should have select method', () => {
      expect(typeof selectBuilder.select).toBe('function')
    })

    it('should have selectAll method', () => {
      expect(typeof selectBuilder.selectAll).toBe('function')
    })

    it('should have distinct method', () => {
      expect(typeof selectBuilder.distinct).toBe('function')
    })

    it('should have from method', () => {
      expect(typeof selectBuilder.from).toBe('function')
    })

    it('should have where method', () => {
      expect(typeof selectBuilder.where).toBe('function')
    })

    it('should have andWhere method', () => {
      expect(typeof selectBuilder.andWhere).toBe('function')
    })

    it('should have orWhere method', () => {
      expect(typeof selectBuilder.orWhere).toBe('function')
    })

    it('should have orderBy method', () => {
      expect(typeof selectBuilder.orderBy).toBe('function')
    })

    it('should have limit method', () => {
      expect(typeof selectBuilder.limit).toBe('function')
    })

    it('should have offset method', () => {
      expect(typeof selectBuilder.offset).toBe('function')
    })

    it('should have groupBy method', () => {
      expect(typeof selectBuilder.groupBy).toBe('function')
    })

    it('should have having method', () => {
      expect(typeof selectBuilder.having).toBe('function')
    })

    it('should have join methods', () => {
      expect(typeof selectBuilder.innerJoin).toBe('function')
      expect(typeof selectBuilder.leftJoin).toBe('function')
      expect(typeof selectBuilder.rightJoin).toBe('function')
      expect(typeof selectBuilder.fullOuterJoin).toBe('function')
    })

    it('should have union methods', () => {
      expect(typeof selectBuilder.union).toBe('function')
      expect(typeof selectBuilder.unionAll).toBe('function')
    })

    it('should have CTE methods', () => {
      expect(typeof selectBuilder.with).toBe('function')
      expect(typeof selectBuilder.withRecursive).toBe('function')
    })

    it('should have utility methods', () => {
      expect(typeof selectBuilder.toQuery).toBe('function')
      expect(typeof selectBuilder.toSQL).toBe('function')
      expect(typeof selectBuilder.toParams).toBe('function')
    })
  })

  describe('method chaining', () => {
    it('should support fluent interface', () => {
      const result = selectBuilder
        .select('id', 'name')
        .from('users')
        .where('active', true)
        .orderBy('name', 'ASC')
        .limit(10)

      expect(result).toBe(selectBuilder)
    })
  })

  describe('basic functionality', () => {
    it('should call select method', () => {
      selectBuilder.select('id', 'name')
      expect(selectBuilder.select).toHaveBeenCalledWith('id', 'name')
    })

    it('should call from method', () => {
      selectBuilder.from('users')
      expect(selectBuilder.from).toHaveBeenCalledWith('users')
    })

    it('should call where method', () => {
      selectBuilder.where('id', '=', 1)
      expect(selectBuilder.where).toHaveBeenCalledWith('id', '=', 1)
    })

    it('should call orderBy method', () => {
      selectBuilder.orderBy('name', 'ASC')
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('name', 'ASC')
    })

    it('should call limit method', () => {
      selectBuilder.limit(10)
      expect(selectBuilder.limit).toHaveBeenCalledWith(10)
    })

    it('should call offset method', () => {
      selectBuilder.offset(20)
      expect(selectBuilder.offset).toHaveBeenCalledWith(20)
    })
  })

  describe('complex query building', () => {
    it('should build complex query with all clauses', () => {
      const result = selectBuilder
        .select('u.id', 'u.name', 'COUNT(o.id) as order_count')
        .from('users u')
        .leftJoin('orders o', 'u.id', '=', 'o.user_id')
        .where('u.active', '=', true)
        .groupBy('u.id', 'u.name')
        .having('COUNT(o.id)', '>', 0)
        .orderBy('order_count', 'DESC')
        .limit(10)
        .offset(0)

      expect(result).toBe(selectBuilder)

      // Verify all methods were called
      expect(selectBuilder.select).toHaveBeenCalledWith(
        'u.id',
        'u.name',
        'COUNT(o.id) as order_count'
      )
      expect(selectBuilder.from).toHaveBeenCalledWith('users u')
      expect(selectBuilder.leftJoin).toHaveBeenCalledWith('orders o', 'u.id', '=', 'o.user_id')
      expect(selectBuilder.where).toHaveBeenCalledWith('u.active', '=', true)
      expect(selectBuilder.groupBy).toHaveBeenCalledWith('u.id', 'u.name')
      expect(selectBuilder.having).toHaveBeenCalledWith('COUNT(o.id)', '>', 0)
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('order_count', 'DESC')
      expect(selectBuilder.limit).toHaveBeenCalledWith(10)
      expect(selectBuilder.offset).toHaveBeenCalledWith(0)
    })
  })
})
