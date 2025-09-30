import { SelectConditionalBuilder } from '@builders/abstracts/SelectConditional'
import { SelectBaseBuilder } from '@builders/abstracts/SelectBase'
import { Connection as ConnectionManager } from '@core/index'
import { WhereMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn()
}))

jest.mock('@builders/mixins/index', () => ({
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

// Create a concrete implementation for testing
class TestSelectConditionalBuilder extends SelectConditionalBuilder {
  constructor(connectionManager: ConnectionManager) {
    super(connectionManager)
  }
}

describe('SelectConditionalBuilder', () => {
  let builder: TestSelectConditionalBuilder
  let mockConnectionManager: jest.Mocked<ConnectionManager>

  beforeEach(() => {
    mockConnectionManager = {
      getDialect: jest.fn()
    } as any

    builder = new TestSelectConditionalBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('where', () => {
    it('should call WhereMixin.addWhereCondition with column, operator, and value', () => {
      builder.where('age', '>', 18)

      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(builder['query'], 'age', '>', 18)
    })

    it('should call WhereMixin.addWhereCondition with condition object', () => {
      const condition = {
        column: 'name',
        operator: '=' as const,
        value: 'John'
      }

      builder.where(condition)

      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        condition,
        undefined,
        undefined
      )
    })

    it('should call WhereMixin.addWhereCondition with column and value (default operator)', () => {
      builder.where('status', 'active')

      expect(WhereMixin.addWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        'status',
        'active',
        undefined
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.where('age', '>', 18)
      expect(result).toBe(builder)
    })
  })

  describe('andWhere', () => {
    it('should call WhereMixin.addAndWhereCondition with column, operator, and value', () => {
      builder.andWhere('age', '>', 18)

      expect(WhereMixin.addAndWhereCondition).toHaveBeenCalledWith(builder['query'], 'age', '>', 18)
    })

    it('should call WhereMixin.addAndWhereCondition with condition object', () => {
      const condition = {
        column: 'name',
        operator: '=' as const,
        value: 'John'
      }

      builder.andWhere(condition)

      expect(WhereMixin.addAndWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        condition,
        undefined,
        undefined
      )
    })

    it('should call WhereMixin.addAndWhereCondition with column and value (default operator)', () => {
      builder.andWhere('status', 'active')

      expect(WhereMixin.addAndWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        'status',
        'active',
        undefined
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.andWhere('age', '>', 18)
      expect(result).toBe(builder)
    })
  })

  describe('orWhere', () => {
    it('should call WhereMixin.addOrWhereCondition with column, operator, and value', () => {
      builder.orWhere('age', '>', 18)

      expect(WhereMixin.addOrWhereCondition).toHaveBeenCalledWith(builder['query'], 'age', '>', 18)
    })

    it('should call WhereMixin.addOrWhereCondition with condition object', () => {
      const condition = {
        column: 'name',
        operator: '=' as const,
        value: 'John'
      }

      builder.orWhere(condition)

      expect(WhereMixin.addOrWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        condition,
        undefined,
        undefined
      )
    })

    it('should call WhereMixin.addOrWhereCondition with column and value (default operator)', () => {
      builder.orWhere('status', 'active')

      expect(WhereMixin.addOrWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        'status',
        'active',
        undefined
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.orWhere('age', '>', 18)
      expect(result).toBe(builder)
    })
  })

  describe('whereRaw', () => {
    it('should call WhereMixin.addRawWhereCondition with valid SQL', () => {
      builder.whereRaw('age > ?', [18])

      expect(WhereMixin.addRawWhereCondition).toHaveBeenCalledWith(builder['query'], 'age > ?', [
        18
      ])
    })

    it('should call WhereMixin.addRawWhereCondition without params', () => {
      builder.whereRaw('age > 18')

      expect(WhereMixin.addRawWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        'age > 18',
        undefined
      )
    })

    it('should throw error for empty SQL', () => {
      expect(() => {
        builder.whereRaw('')
      }).toThrow(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    })

    it('should throw error for null SQL', () => {
      expect(() => {
        builder.whereRaw(null as any)
      }).toThrow(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    })

    it('should return this for method chaining', () => {
      const result = builder.whereRaw('age > 18')
      expect(result).toBe(builder)
    })
  })

  describe('andWhereRaw', () => {
    it('should call WhereMixin.addRawAndWhereCondition with valid SQL', () => {
      builder.andWhereRaw('age > ?', [18])

      expect(WhereMixin.addRawAndWhereCondition).toHaveBeenCalledWith(builder['query'], 'age > ?', [
        18
      ])
    })

    it('should call WhereMixin.addRawAndWhereCondition without params', () => {
      builder.andWhereRaw('age > 18')

      expect(WhereMixin.addRawAndWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        'age > 18',
        undefined
      )
    })

    it('should throw error for empty SQL', () => {
      expect(() => {
        builder.andWhereRaw('')
      }).toThrow(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    })

    it('should throw error for null SQL', () => {
      expect(() => {
        builder.andWhereRaw(null as any)
      }).toThrow(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    })

    it('should return this for method chaining', () => {
      const result = builder.andWhereRaw('age > 18')
      expect(result).toBe(builder)
    })
  })

  describe('orWhereRaw', () => {
    it('should call WhereMixin.addRawOrWhereCondition with valid SQL', () => {
      builder.orWhereRaw('age > ?', [18])

      expect(WhereMixin.addRawOrWhereCondition).toHaveBeenCalledWith(builder['query'], 'age > ?', [
        18
      ])
    })

    it('should call WhereMixin.addRawOrWhereCondition without params', () => {
      builder.orWhereRaw('age > 18')

      expect(WhereMixin.addRawOrWhereCondition).toHaveBeenCalledWith(
        builder['query'],
        'age > 18',
        undefined
      )
    })

    it('should throw error for empty SQL', () => {
      expect(() => {
        builder.orWhereRaw('')
      }).toThrow(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    })

    it('should throw error for null SQL', () => {
      expect(() => {
        builder.orWhereRaw(null as any)
      }).toThrow(errorMessages.VALIDATION.EMPTY_RAW_SQL)
    })

    it('should return this for method chaining', () => {
      const result = builder.orWhereRaw('age > 18')
      expect(result).toBe(builder)
    })
  })

  describe('inheritance', () => {
    it('should extend SelectBaseBuilder', () => {
      expect(builder).toBeInstanceOf(SelectBaseBuilder)
    })

    it('should have access to SelectBaseBuilder methods', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.select('id', 'name')

      expect(SelectMixin.setColumns).toHaveBeenCalledWith(builder['query'], 'id', 'name')
    })
  })
})
