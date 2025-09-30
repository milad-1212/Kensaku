import { SelectJoinBuilder } from '@builders/abstracts/SelectJoin'
import { SelectConditionalBuilder } from '@builders/abstracts/SelectConditional'
import { SelectBaseBuilder } from '@builders/abstracts/SelectBase'
import { Connection as ConnectionManager } from '@core/index'
import { JoinMixin } from '@builders/mixins/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn()
}))

jest.mock('@builders/mixins/index', () => ({
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
  SelectMixin: {
    setColumns: jest.fn(),
    setSelectAll: jest.fn(),
    setDistinct: jest.fn(),
    setFrom: jest.fn()
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
      EMPTY_RAW_SQL: 'Raw SQL cannot be empty'
    }
  }
}))

// Create a concrete implementation for testing
class TestSelectJoinBuilder extends SelectJoinBuilder {
  constructor(connectionManager: ConnectionManager) {
    super(connectionManager)
  }
}

describe('SelectJoinBuilder', () => {
  let builder: TestSelectJoinBuilder
  let mockConnectionManager: jest.Mocked<ConnectionManager>

  beforeEach(() => {
    mockConnectionManager = {
      getDialect: jest.fn()
    } as any

    builder = new TestSelectJoinBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('join', () => {
    it('should call JoinMixin.addInnerJoin with table and conditions', () => {
      const conditions = [
        {
          column: 'users.id',
          operator: '=' as const,
          value: 'orders.user_id'
        }
      ]

      builder.join('orders', conditions)

      expect(JoinMixin.addInnerJoin).toHaveBeenCalledWith(builder['query'], 'orders', conditions)
    })

    it('should return this for method chaining', () => {
      const conditions = [
        {
          column: 'users.id',
          operator: '=' as const,
          value: 'orders.user_id'
        }
      ]

      const result = builder.join('orders', conditions)
      expect(result).toBe(builder)
    })
  })

  describe('innerJoin', () => {
    it('should call JoinMixin.addInnerJoin with conditions array', () => {
      const conditions = [
        {
          column: 'users.id',
          operator: '=' as const,
          value: 'orders.user_id'
        }
      ]

      builder.innerJoin('orders', conditions)

      expect(JoinMixin.addInnerJoin).toHaveBeenCalledWith(builder['query'], 'orders', conditions)
    })

    it('should call JoinMixin.addInnerJoin with simple column matching', () => {
      builder.innerJoin('orders', 'users.id', 'orders.user_id')

      expect(JoinMixin.addInnerJoin).toHaveBeenCalledWith(builder['query'], 'orders', [
        {
          column: 'users.id',
          operator: '=',
          value: 'orders.user_id'
        }
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.innerJoin('orders', 'users.id', 'orders.user_id')
      expect(result).toBe(builder)
    })
  })

  describe('leftJoin', () => {
    it('should call JoinMixin.addLeftJoin with conditions array', () => {
      const conditions = [
        {
          column: 'users.id',
          operator: '=' as const,
          value: 'orders.user_id'
        }
      ]

      builder.leftJoin('orders', conditions)

      expect(JoinMixin.addLeftJoin).toHaveBeenCalledWith(builder['query'], 'orders', conditions)
    })

    it('should call JoinMixin.addLeftJoin with simple column matching', () => {
      builder.leftJoin('orders', 'users.id', 'orders.user_id')

      expect(JoinMixin.addLeftJoin).toHaveBeenCalledWith(builder['query'], 'orders', [
        {
          column: 'users.id',
          operator: '=',
          value: 'orders.user_id'
        }
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.leftJoin('orders', 'users.id', 'orders.user_id')
      expect(result).toBe(builder)
    })
  })

  describe('rightJoin', () => {
    it('should call JoinMixin.addRightJoin with conditions array', () => {
      const conditions = [
        {
          column: 'users.id',
          operator: '=' as const,
          value: 'orders.user_id'
        }
      ]

      builder.rightJoin('orders', conditions)

      expect(JoinMixin.addRightJoin).toHaveBeenCalledWith(builder['query'], 'orders', conditions)
    })

    it('should call JoinMixin.addRightJoin with simple column matching', () => {
      builder.rightJoin('orders', 'users.id', 'orders.user_id')

      expect(JoinMixin.addRightJoin).toHaveBeenCalledWith(builder['query'], 'orders', [
        {
          column: 'users.id',
          operator: '=',
          value: 'orders.user_id'
        }
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.rightJoin('orders', 'users.id', 'orders.user_id')
      expect(result).toBe(builder)
    })
  })

  describe('fullJoin', () => {
    it('should call JoinMixin.addFullJoin with conditions array', () => {
      const conditions = [
        {
          column: 'users.id',
          operator: '=' as const,
          value: 'orders.user_id'
        }
      ]

      builder.fullJoin('orders', conditions)

      expect(JoinMixin.addFullJoin).toHaveBeenCalledWith(builder['query'], 'orders', conditions)
    })

    it('should call JoinMixin.addFullJoin with simple column matching', () => {
      builder.fullJoin('orders', 'users.id', 'orders.user_id')

      expect(JoinMixin.addFullJoin).toHaveBeenCalledWith(builder['query'], 'orders', [
        {
          column: 'users.id',
          operator: '=',
          value: 'orders.user_id'
        }
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.fullJoin('orders', 'users.id', 'orders.user_id')
      expect(result).toBe(builder)
    })
  })

  describe('crossJoin', () => {
    it('should call JoinMixin.addCrossJoin with table', () => {
      builder.crossJoin('orders')

      expect(JoinMixin.addCrossJoin).toHaveBeenCalledWith(builder['query'], 'orders')
    })

    it('should return this for method chaining', () => {
      const result = builder.crossJoin('orders')
      expect(result).toBe(builder)
    })
  })

  describe('lateralJoin', () => {
    it('should call JoinMixin.addLateralJoin with conditions array', () => {
      const conditions = [
        {
          column: 'users.id',
          operator: '=' as const,
          value: 'orders.user_id'
        }
      ]

      builder.lateralJoin('orders', conditions)

      expect(JoinMixin.addLateralJoin).toHaveBeenCalledWith(builder['query'], 'orders', conditions)
    })

    it('should call JoinMixin.addLateralJoin with simple column matching', () => {
      builder.lateralJoin('orders', 'users.id', 'orders.user_id')

      expect(JoinMixin.addLateralJoin).toHaveBeenCalledWith(builder['query'], 'orders', [
        {
          column: 'users.id',
          operator: '=',
          value: 'orders.user_id'
        }
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.lateralJoin('orders', 'users.id', 'orders.user_id')
      expect(result).toBe(builder)
    })
  })

  describe('inheritance', () => {
    it('should extend SelectConditionalBuilder', () => {
      expect(builder).toBeInstanceOf(SelectConditionalBuilder)
    })

    it('should extend SelectBaseBuilder', () => {
      expect(builder).toBeInstanceOf(SelectBaseBuilder)
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
