import { SelectSortingBuilder } from '@builders/abstracts/SelectSorting'
import { SelectGroupingBuilder } from '@builders/abstracts/SelectGrouping'
import { SelectJoinBuilder } from '@builders/abstracts/SelectJoin'
import { SelectConditionalBuilder } from '@builders/abstracts/SelectConditional'
import { SelectBaseBuilder } from '@builders/abstracts/SelectBase'
import { Connection as ConnectionManager } from '@core/index'
import { SelectMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn()
}))

jest.mock('@builders/mixins/index', () => ({
  SelectMixin: {
    addOrderBy: jest.fn(),
    addOrderByExpression: jest.fn(),
    setLimit: jest.fn(),
    setOffset: jest.fn(),
    setLimitRaw: jest.fn(),
    setGroupBy: jest.fn(),
    setColumns: jest.fn(),
    setSelectAll: jest.fn(),
    setDistinct: jest.fn(),
    setFrom: jest.fn()
  },
  HavingMixin: {
    addHavingCondition: jest.fn()
  },
  JoinMixin: {
    addInnerJoin: jest.fn(),
    addLeftJoin: jest.fn(),
    addRightJoin: jest.fn(),
    addFullJoin: jest.fn(),
    addCrossJoin: jest.fn(),
    addLateralJoin: jest.fn()
  },
  WhereMixin: {
    addWhereCondition: jest.fn(),
    addAndWhereCondition: jest.fn(),
    addOrWhereCondition: jest.fn(),
    addRawWhereCondition: jest.fn(),
    addRawAndWhereCondition: jest.fn(),
    addRawOrWhereCondition: jest.fn()
  },
  PivotMixin: {
    addPivot: jest.fn(),
    addUnpivot: jest.fn(),
    addOrdinality: jest.fn()
  },
  JsonMixin: {
    addJsonPath: jest.fn(),
    addJsonFunction: jest.fn()
  },
  ArrayMixin: {
    addArrayOperation: jest.fn(),
    addArrayFunction: jest.fn()
  },
  ArraySliceMixin: {
    addArraySlice: jest.fn()
  }
}))

jest.mock('@core/security/index', () => ({
  QueryValidator: {
    validateSelectQuery: jest.fn()
  }
}))

jest.mock('@core/dialects/index', () => ({
  Base: jest.fn()
}))

jest.mock('@constants/index', () => ({
  errorMessages: {
    VALIDATION: {
      INVALID_ORDER_DIRECTION: 'Invalid order direction',
      EMPTY_RAW_SQL: 'Raw SQL cannot be empty'
    }
  }
}))

// Create a concrete implementation for testing
class TestSelectSortingBuilder extends SelectSortingBuilder {
  constructor(connectionManager: ConnectionManager) {
    super(connectionManager)
  }
}

describe('SelectSortingBuilder', () => {
  let builder: TestSelectSortingBuilder
  let mockConnectionManager: jest.Mocked<ConnectionManager>

  beforeEach(() => {
    mockConnectionManager = {
      getDialect: jest.fn()
    } as any

    builder = new TestSelectSortingBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('orderBy', () => {
    it('should call SelectMixin.addOrderBy with column and default direction', () => {
      builder.orderBy('name')

      expect(SelectMixin.addOrderBy).toHaveBeenCalledWith(builder['query'], 'name', 'ASC')
    })

    it('should call SelectMixin.addOrderBy with column and specified direction', () => {
      builder.orderBy('name', 'DESC')

      expect(SelectMixin.addOrderBy).toHaveBeenCalledWith(builder['query'], 'name', 'DESC')
    })

    it('should throw error for invalid direction', () => {
      expect(() => {
        builder.orderBy('name', 'INVALID' as any)
      }).toThrow(errorMessages.VALIDATION.INVALID_ORDER_DIRECTION)
    })

    it('should return this for method chaining', () => {
      const result = builder.orderBy('name')
      expect(result).toBe(builder)
    })
  })

  describe('orderByExpression', () => {
    it('should call SelectMixin.addOrderByExpression with expression and default direction', () => {
      builder.orderByExpression('LENGTH(name)')

      expect(SelectMixin.addOrderByExpression).toHaveBeenCalledWith(
        builder['query'],
        'LENGTH(name)',
        'ASC'
      )
    })

    it('should call SelectMixin.addOrderByExpression with expression and specified direction', () => {
      builder.orderByExpression('LENGTH(name)', 'DESC')

      expect(SelectMixin.addOrderByExpression).toHaveBeenCalledWith(
        builder['query'],
        'LENGTH(name)',
        'DESC'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.orderByExpression('LENGTH(name)')
      expect(result).toBe(builder)
    })
  })

  describe('orderByRaw', () => {
    it('should call SelectMixin.addOrderByExpression with raw SQL', () => {
      builder.orderByRaw('CASE WHEN status = ? THEN 1 ELSE 2 END', ['active'])

      expect(SelectMixin.addOrderByExpression).toHaveBeenCalledWith(
        builder['query'],
        'CASE WHEN status = ? THEN 1 ELSE 2 END',
        'ASC',
        ['active']
      )
    })

    it('should call SelectMixin.addOrderByExpression without params', () => {
      builder.orderByRaw('RANDOM()')

      expect(SelectMixin.addOrderByExpression).toHaveBeenCalledWith(
        builder['query'],
        'RANDOM()',
        'ASC',
        undefined
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.orderByRaw('RANDOM()')
      expect(result).toBe(builder)
    })
  })

  describe('limit', () => {
    it('should call SelectMixin.setLimit with count', () => {
      builder.limit(10)

      expect(SelectMixin.setLimit).toHaveBeenCalledWith(builder['query'], 10)
    })

    it('should return this for method chaining', () => {
      const result = builder.limit(10)
      expect(result).toBe(builder)
    })
  })

  describe('offset', () => {
    it('should call SelectMixin.setOffset with count', () => {
      builder.offset(20)

      expect(SelectMixin.setOffset).toHaveBeenCalledWith(builder['query'], 20)
    })

    it('should return this for method chaining', () => {
      const result = builder.offset(20)
      expect(result).toBe(builder)
    })
  })

  describe('limitRaw', () => {
    it('should call SelectMixin.setLimitRaw with SQL and params', () => {
      builder.limitRaw('? + ?', [5, 10])

      expect(SelectMixin.setLimitRaw).toHaveBeenCalledWith(builder['query'], '? + ?', [5, 10])
      expect(builder['params']).toEqual([5, 10])
    })

    it('should call SelectMixin.setLimitRaw without params', () => {
      builder.limitRaw('10')

      expect(SelectMixin.setLimitRaw).toHaveBeenCalledWith(builder['query'], '10', undefined)
      expect(builder['params']).toEqual([])
    })

    it('should return this for method chaining', () => {
      const result = builder.limitRaw('10')
      expect(result).toBe(builder)
    })
  })

  describe('inheritance', () => {
    it('should extend SelectGroupingBuilder', () => {
      expect(builder).toBeInstanceOf(SelectGroupingBuilder)
    })

    it('should extend SelectJoinBuilder', () => {
      expect(builder).toBeInstanceOf(SelectJoinBuilder)
    })

    it('should extend SelectConditionalBuilder', () => {
      expect(builder).toBeInstanceOf(SelectConditionalBuilder)
    })

    it('should extend SelectBaseBuilder', () => {
      expect(builder).toBeInstanceOf(SelectBaseBuilder)
    })

    it('should have access to SelectGroupingBuilder methods', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.groupBy('category')

      expect(SelectMixin.setGroupBy).toHaveBeenCalledWith(builder['query'], 'category')
    })

    it('should have access to SelectJoinBuilder methods', () => {
      const { JoinMixin } = require('@builders/mixins/index')

      builder.innerJoin('orders', 'users.id', 'orders.user_id')

      expect(JoinMixin.addInnerJoin).toHaveBeenCalledWith(builder['query'], 'orders', [
        {
          column: 'users.id',
          operator: '=',
          value: 'orders.user_id'
        }
      ])
    })

    it('should have access to SelectConditionalBuilder methods', () => {
      const { WhereMixin } = require('@builders/mixins/index')

      builder.where('age', '>', 18)

      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(builder['query'], 'age', '>', 18)
    })

    it('should have access to SelectBaseBuilder methods', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.select('id', 'name')

      expect(SelectMixin.setColumns).toHaveBeenCalledWith(builder['query'], 'id', 'name')
    })
  })
})
