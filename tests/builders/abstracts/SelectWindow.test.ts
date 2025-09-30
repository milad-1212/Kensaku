import { SelectWindowBuilder } from '@builders/abstracts/SelectWindow'
import { SelectSortingBuilder } from '@builders/abstracts/SelectSorting'
import { SelectGroupingBuilder } from '@builders/abstracts/SelectGrouping'
import { SelectJoinBuilder } from '@builders/abstracts/SelectJoin'
import { SelectConditionalBuilder } from '@builders/abstracts/SelectConditional'
import { SelectBaseBuilder } from '@builders/abstracts/SelectBase'
import { Connection as ConnectionManager } from '@core/index'
import { WindowMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn()
}))

jest.mock('@builders/mixins/index', () => ({
  WindowMixin: {
    addRowNumber: jest.fn(),
    addRank: jest.fn(),
    addDenseRank: jest.fn(),
    addLag: jest.fn(),
    addLead: jest.fn(),
    addFirstValue: jest.fn(),
    addLastValue: jest.fn(),
    addNtile: jest.fn(),
    addCumeDist: jest.fn(),
    addPercentRank: jest.fn(),
    addNthValue: jest.fn()
  },
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
    WINDOW: {
      NTILE_REQUIRES_POSITIVE: 'NTILE requires positive number of buckets'
    },
    VALIDATION: {
      INVALID_ORDER_DIRECTION: 'Invalid order direction',
      EMPTY_RAW_SQL: 'Raw SQL cannot be empty'
    }
  }
}))

// Create a concrete implementation for testing
class TestSelectWindowBuilder extends SelectWindowBuilder {
  constructor(connectionManager: ConnectionManager) {
    super(connectionManager)
  }
}

describe('SelectWindowBuilder', () => {
  let builder: TestSelectWindowBuilder
  let mockConnectionManager: jest.Mocked<ConnectionManager>

  beforeEach(() => {
    mockConnectionManager = {
      getDialect: jest.fn()
    } as any

    builder = new TestSelectWindowBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('rowNumber', () => {
    it('should call WindowMixin.addRowNumber without window spec', () => {
      builder.rowNumber()

      expect(WindowMixin.addRowNumber).toHaveBeenCalledWith(builder['query'], undefined)
    })

    it('should call WindowMixin.addRowNumber with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.rowNumber(windowSpec)

      expect(WindowMixin.addRowNumber).toHaveBeenCalledWith(builder['query'], windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.rowNumber()
      expect(result).toBe(builder)
    })
  })

  describe('rank', () => {
    it('should call WindowMixin.addRank without window spec', () => {
      builder.rank()

      expect(WindowMixin.addRank).toHaveBeenCalledWith(builder['query'], undefined)
    })

    it('should call WindowMixin.addRank with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.rank(windowSpec)

      expect(WindowMixin.addRank).toHaveBeenCalledWith(builder['query'], windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.rank()
      expect(result).toBe(builder)
    })
  })

  describe('denseRank', () => {
    it('should call WindowMixin.addDenseRank without window spec', () => {
      builder.denseRank()

      expect(WindowMixin.addDenseRank).toHaveBeenCalledWith(builder['query'], undefined)
    })

    it('should call WindowMixin.addDenseRank with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.denseRank(windowSpec)

      expect(WindowMixin.addDenseRank).toHaveBeenCalledWith(builder['query'], windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.denseRank()
      expect(result).toBe(builder)
    })
  })

  describe('lag', () => {
    it('should call WindowMixin.addLag with default offset', () => {
      builder.lag('name')

      expect(WindowMixin.addLag).toHaveBeenCalledWith(builder['query'], 'name', 1, undefined)
    })

    it('should call WindowMixin.addLag with custom offset', () => {
      builder.lag('name', 3)

      expect(WindowMixin.addLag).toHaveBeenCalledWith(builder['query'], 'name', 3, undefined)
    })

    it('should call WindowMixin.addLag with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.lag('name', 2, windowSpec)

      expect(WindowMixin.addLag).toHaveBeenCalledWith(builder['query'], 'name', 2, windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.lag('name')
      expect(result).toBe(builder)
    })
  })

  describe('lead', () => {
    it('should call WindowMixin.addLead with default offset', () => {
      builder.lead('name')

      expect(WindowMixin.addLead).toHaveBeenCalledWith(builder['query'], 'name', 1, undefined)
    })

    it('should call WindowMixin.addLead with custom offset', () => {
      builder.lead('name', 3)

      expect(WindowMixin.addLead).toHaveBeenCalledWith(builder['query'], 'name', 3, undefined)
    })

    it('should call WindowMixin.addLead with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.lead('name', 2, windowSpec)

      expect(WindowMixin.addLead).toHaveBeenCalledWith(builder['query'], 'name', 2, windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.lead('name')
      expect(result).toBe(builder)
    })
  })

  describe('firstValue', () => {
    it('should call WindowMixin.addFirstValue without window spec', () => {
      builder.firstValue('name')

      expect(WindowMixin.addFirstValue).toHaveBeenCalledWith(builder['query'], 'name', undefined)
    })

    it('should call WindowMixin.addFirstValue with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.firstValue('name', windowSpec)

      expect(WindowMixin.addFirstValue).toHaveBeenCalledWith(builder['query'], 'name', windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.firstValue('name')
      expect(result).toBe(builder)
    })
  })

  describe('lastValue', () => {
    it('should call WindowMixin.addLastValue without window spec', () => {
      builder.lastValue('name')

      expect(WindowMixin.addLastValue).toHaveBeenCalledWith(builder['query'], 'name', undefined)
    })

    it('should call WindowMixin.addLastValue with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.lastValue('name', windowSpec)

      expect(WindowMixin.addLastValue).toHaveBeenCalledWith(builder['query'], 'name', windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.lastValue('name')
      expect(result).toBe(builder)
    })
  })

  describe('ntile', () => {
    it('should call WindowMixin.addNtile without window spec', () => {
      builder.ntile(4)

      expect(WindowMixin.addNtile).toHaveBeenCalledWith(builder['query'], 4, undefined)
    })

    it('should call WindowMixin.addNtile with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.ntile(4, windowSpec)

      expect(WindowMixin.addNtile).toHaveBeenCalledWith(builder['query'], 4, windowSpec)
    })

    it('should throw error for non-positive buckets', () => {
      expect(() => {
        builder.ntile(0)
      }).toThrow(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE)
    })

    it('should throw error for negative buckets', () => {
      expect(() => {
        builder.ntile(-1)
      }).toThrow(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE)
    })

    it('should return this for method chaining', () => {
      const result = builder.ntile(4)
      expect(result).toBe(builder)
    })
  })

  describe('cumeDist', () => {
    it('should call WindowMixin.addCumeDist without window spec', () => {
      builder.cumeDist()

      expect(WindowMixin.addCumeDist).toHaveBeenCalledWith(builder['query'], undefined)
    })

    it('should call WindowMixin.addCumeDist with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.cumeDist(windowSpec)

      expect(WindowMixin.addCumeDist).toHaveBeenCalledWith(builder['query'], windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.cumeDist()
      expect(result).toBe(builder)
    })
  })

  describe('percentRank', () => {
    it('should call WindowMixin.addPercentRank without window spec', () => {
      builder.percentRank()

      expect(WindowMixin.addPercentRank).toHaveBeenCalledWith(builder['query'], undefined)
    })

    it('should call WindowMixin.addPercentRank with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.percentRank(windowSpec)

      expect(WindowMixin.addPercentRank).toHaveBeenCalledWith(builder['query'], windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.percentRank()
      expect(result).toBe(builder)
    })
  })

  describe('nthValue', () => {
    it('should call WindowMixin.addNthValue without window spec', () => {
      builder.nthValue('name', 3)

      expect(WindowMixin.addNthValue).toHaveBeenCalledWith(builder['query'], 'name', 3, undefined)
    })

    it('should call WindowMixin.addNthValue with window spec', () => {
      const windowSpec = {
        partitionBy: ['category'],
        orderBy: [{ column: 'name', direction: 'ASC' as const }]
      }

      builder.nthValue('name', 3, windowSpec)

      expect(WindowMixin.addNthValue).toHaveBeenCalledWith(builder['query'], 'name', 3, windowSpec)
    })

    it('should return this for method chaining', () => {
      const result = builder.nthValue('name', 3)
      expect(result).toBe(builder)
    })
  })

  describe('inheritance', () => {
    it('should extend SelectSortingBuilder', () => {
      expect(builder).toBeInstanceOf(SelectSortingBuilder)
    })

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

    it('should have access to SelectSortingBuilder methods', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.orderBy('name')

      expect(SelectMixin.addOrderBy).toHaveBeenCalledWith(builder['query'], 'name', 'ASC')
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
