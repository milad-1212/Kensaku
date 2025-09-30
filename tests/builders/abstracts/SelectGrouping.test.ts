import { SelectGroupingBuilder } from '@builders/abstracts/SelectGrouping'
import { SelectJoinBuilder } from '@builders/abstracts/SelectJoin'
import { SelectConditionalBuilder } from '@builders/abstracts/SelectConditional'
import { SelectBaseBuilder } from '@builders/abstracts/SelectBase'
import { Connection as ConnectionManager } from '@core/index'
import { SelectMixin, HavingMixin } from '@builders/mixins/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn()
}))

jest.mock('@builders/mixins/index', () => ({
  SelectMixin: {
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
      EMPTY_RAW_SQL: 'Raw SQL cannot be empty'
    }
  }
}))

// Create a concrete implementation for testing
class TestSelectGroupingBuilder extends SelectGroupingBuilder {
  constructor(connectionManager: ConnectionManager) {
    super(connectionManager)
  }
}

describe('SelectGroupingBuilder', () => {
  let builder: TestSelectGroupingBuilder
  let mockConnectionManager: jest.Mocked<ConnectionManager>

  beforeEach(() => {
    mockConnectionManager = {
      getDialect: jest.fn()
    } as any

    builder = new TestSelectGroupingBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('groupBy', () => {
    it('should call SelectMixin.setGroupBy with single column', () => {
      builder.groupBy('category')

      expect(SelectMixin.setGroupBy).toHaveBeenCalledWith(builder['query'], 'category')
    })

    it('should call SelectMixin.setGroupBy with multiple columns', () => {
      builder.groupBy(['category', 'status'])

      expect(SelectMixin.setGroupBy).toHaveBeenCalledWith(builder['query'], ['category', 'status'])
    })

    it('should return this for method chaining', () => {
      const result = builder.groupBy('category')
      expect(result).toBe(builder)
    })
  })

  describe('having', () => {
    it('should call HavingMixin.addHavingCondition with column, operator, and value', () => {
      builder.having('COUNT(*)', '>', 5)

      expect(HavingMixin.addHavingCondition).toHaveBeenCalledWith(
        builder['query'],
        'COUNT(*)',
        '>',
        5
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.having('COUNT(*)', '>', 5)
      expect(result).toBe(builder)
    })
  })

  describe('inheritance', () => {
    it('should extend SelectJoinBuilder', () => {
      expect(builder).toBeInstanceOf(SelectJoinBuilder)
    })

    it('should extend SelectConditionalBuilder', () => {
      expect(builder).toBeInstanceOf(SelectConditionalBuilder)
    })

    it('should extend SelectBaseBuilder', () => {
      expect(builder).toBeInstanceOf(SelectBaseBuilder)
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
