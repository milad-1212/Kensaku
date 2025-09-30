import { SelectBaseBuilder } from '@builders/abstracts/SelectBase'
import { Connection as ConnectionManager } from '@core/index'
import { QueryValidator } from '@core/security/index'
import { Base } from '@core/dialects/index'

// Mock dependencies
jest.mock('@core/index', () => ({
  Connection: jest.fn()
}))

jest.mock('@core/security/index', () => ({
  QueryValidator: {
    validateSelectQuery: jest.fn()
  }
}))

jest.mock('@core/dialects/index', () => ({
  Base: jest.fn()
}))

jest.mock('@builders/mixins/index', () => ({
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

// Create a concrete implementation for testing
class TestSelectBuilder extends SelectBaseBuilder {
  constructor(connectionManager: ConnectionManager) {
    super(connectionManager)
  }
}

describe('SelectBaseBuilder', () => {
  let builder: TestSelectBuilder
  let mockConnectionManager: jest.Mocked<ConnectionManager>
  let mockDialect: jest.Mocked<Base>

  beforeEach(() => {
    mockDialect = {
      buildSelectQuery: jest.fn().mockReturnValue({
        sql: 'SELECT * FROM test',
        params: []
      })
    } as any

    mockConnectionManager = {
      getDialect: jest.fn().mockReturnValue(mockDialect)
    } as any

    builder = new TestSelectBuilder(mockConnectionManager)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('select', () => {
    it('should call SelectMixin.setColumns with provided columns', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.select('id', 'name', 'email')

      expect(SelectMixin.setColumns).toHaveBeenCalledWith(builder['query'], 'id', 'name', 'email')
    })

    it('should return this for method chaining', () => {
      const result = builder.select('id', 'name')
      expect(result).toBe(builder)
    })
  })

  describe('selectAll', () => {
    it('should call SelectMixin.setSelectAll', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.selectAll()

      expect(SelectMixin.setSelectAll).toHaveBeenCalledWith(builder['query'])
    })

    it('should return this for method chaining', () => {
      const result = builder.selectAll()
      expect(result).toBe(builder)
    })
  })

  describe('distinct', () => {
    it('should call SelectMixin.setDistinct', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.distinct()

      expect(SelectMixin.setDistinct).toHaveBeenCalledWith(builder['query'])
    })

    it('should return this for method chaining', () => {
      const result = builder.distinct()
      expect(result).toBe(builder)
    })
  })

  describe('from', () => {
    it('should call SelectMixin.setFrom with string table', () => {
      const { SelectMixin } = require('@builders/mixins/index')

      builder.from('users')

      expect(SelectMixin.setFrom).toHaveBeenCalledWith(builder['query'], 'users')
    })

    it('should call SelectMixin.setFrom with QuerySubQuery', () => {
      const { SelectMixin } = require('@builders/mixins/index')
      const subquery = {
        query: 'SELECT * FROM temp',
        params: [],
        alias: 'temp_table'
      }

      builder.from(subquery)

      expect(SelectMixin.setFrom).toHaveBeenCalledWith(builder['query'], subquery)
    })

    it('should handle SelectBaseBuilder instance by converting to subquery', () => {
      const { SelectMixin } = require('@builders/mixins/index')
      const subBuilder = new TestSelectBuilder(mockConnectionManager)

      // Mock the toSQL and toParams methods
      jest.spyOn(subBuilder, 'toSQL').mockReturnValue('SELECT * FROM temp')
      jest.spyOn(subBuilder, 'toParams').mockReturnValue([])

      builder.from(subBuilder)

      expect(SelectMixin.setFrom).toHaveBeenCalledWith(builder['query'], {
        query: 'SELECT * FROM temp',
        params: [],
        alias: 'subquery'
      })
    })

    it('should return this for method chaining', () => {
      const result = builder.from('users')
      expect(result).toBe(builder)
    })
  })

  describe('buildQuery', () => {
    it('should validate query and build SQL using dialect', () => {
      builder.buildQuery()

      expect(QueryValidator.validateSelectQuery).toHaveBeenCalledWith(builder['query'])
      expect(mockConnectionManager.getDialect).toHaveBeenCalled()
      expect(mockDialect.buildSelectQuery).toHaveBeenCalledWith(builder['query'])
    })
  })

  describe('toQuery', () => {
    it('should return a copy of the query object', () => {
      const query = builder.toQuery()
      expect(query).toEqual(builder['query'])
      expect(query).not.toBe(builder['query']) // Should be a copy
    })
  })

  describe('pivot', () => {
    it('should call PivotMixin.addPivot with correct parameters', () => {
      const { PivotMixin } = require('@builders/mixins/index')

      builder.pivot('category', ['A', 'B', 'C'], 'SUM(amount)', 'pivot_result')

      expect(PivotMixin.addPivot).toHaveBeenCalledWith(
        builder['query'],
        'category',
        ['A', 'B', 'C'],
        'SUM(amount)',
        'pivot_result'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.pivot('category', ['A', 'B'], 'SUM(amount)')
      expect(result).toBe(builder)
    })
  })

  describe('unpivot', () => {
    it('should call PivotMixin.addUnpivot with correct parameters', () => {
      const { PivotMixin } = require('@builders/mixins/index')

      builder.unpivot(['col1', 'col2'], 'value', 'name')

      expect(PivotMixin.addUnpivot).toHaveBeenCalledWith(
        builder['query'],
        ['col1', 'col2'],
        'value',
        'name'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.unpivot(['col1'], 'value', 'name')
      expect(result).toBe(builder)
    })
  })

  describe('withOrdinality', () => {
    it('should call PivotMixin.addOrdinality with correct parameters', () => {
      const { PivotMixin } = require('@builders/mixins/index')

      builder.withOrdinality('value', 'ordinality')

      expect(PivotMixin.addOrdinality).toHaveBeenCalledWith(builder['query'], 'value', 'ordinality')
    })

    it('should return this for method chaining', () => {
      const result = builder.withOrdinality('value', 'ordinality')
      expect(result).toBe(builder)
    })
  })

  describe('jsonPath', () => {
    it('should call JsonMixin.addJsonPath with correct parameters', () => {
      const { JsonMixin } = require('@builders/mixins/index')

      builder.jsonPath('data', '$.name', '->>', 'name')

      expect(JsonMixin.addJsonPath).toHaveBeenCalledWith(
        builder['query'],
        'data',
        '$.name',
        '->>',
        'name'
      )
    })

    it('should use default operator when not provided', () => {
      const { JsonMixin } = require('@builders/mixins/index')

      builder.jsonPath('data', '$.name')

      expect(JsonMixin.addJsonPath).toHaveBeenCalledWith(
        builder['query'],
        'data',
        '$.name',
        '->>',
        undefined
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.jsonPath('data', '$.name')
      expect(result).toBe(builder)
    })
  })

  describe('jsonExtract', () => {
    it('should call JsonMixin.addJsonFunction with json_extract', () => {
      const { JsonMixin } = require('@builders/mixins/index')

      builder.jsonExtract('data', '$.name', 'name')

      expect(JsonMixin.addJsonFunction).toHaveBeenCalledWith(
        builder['query'],
        'json_extract',
        'data',
        '$.name',
        undefined,
        'name'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.jsonExtract('data', '$.name')
      expect(result).toBe(builder)
    })
  })

  describe('jsonSet', () => {
    it('should call JsonMixin.addJsonFunction with json_set', () => {
      const { JsonMixin } = require('@builders/mixins/index')

      builder.jsonSet('data', '$.name', 'John', 'name')

      expect(JsonMixin.addJsonFunction).toHaveBeenCalledWith(
        builder['query'],
        'json_set',
        'data',
        '$.name',
        'John',
        'name'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.jsonSet('data', '$.name', 'John')
      expect(result).toBe(builder)
    })
  })

  describe('jsonRemove', () => {
    it('should call JsonMixin.addJsonFunction with json_remove', () => {
      const { JsonMixin } = require('@builders/mixins/index')

      builder.jsonRemove('data', '$.name', 'name')

      expect(JsonMixin.addJsonFunction).toHaveBeenCalledWith(
        builder['query'],
        'json_remove',
        'data',
        '$.name',
        undefined,
        'name'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.jsonRemove('data', '$.name')
      expect(result).toBe(builder)
    })
  })

  describe('jsonValid', () => {
    it('should call JsonMixin.addJsonFunction with json_valid', () => {
      const { JsonMixin } = require('@builders/mixins/index')

      builder.jsonValid('data', 'is_valid')

      expect(JsonMixin.addJsonFunction).toHaveBeenCalledWith(
        builder['query'],
        'json_valid',
        'data',
        '',
        undefined,
        'is_valid'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.jsonValid('data')
      expect(result).toBe(builder)
    })
  })

  describe('arrayContains', () => {
    it('should call ArrayMixin.addArrayOperation with @> operator', () => {
      const { ArrayMixin } = require('@builders/mixins/index')

      builder.arrayContains('tags', ['tag1', 'tag2'])

      expect(ArrayMixin.addArrayOperation).toHaveBeenCalledWith(builder['query'], 'tags', '@>', [
        'tag1',
        'tag2'
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.arrayContains('tags', ['tag1'])
      expect(result).toBe(builder)
    })
  })

  describe('arrayContainedBy', () => {
    it('should call ArrayMixin.addArrayOperation with <@ operator', () => {
      const { ArrayMixin } = require('@builders/mixins/index')

      builder.arrayContainedBy('tags', ['tag1', 'tag2'])

      expect(ArrayMixin.addArrayOperation).toHaveBeenCalledWith(builder['query'], 'tags', '<@', [
        'tag1',
        'tag2'
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.arrayContainedBy('tags', ['tag1'])
      expect(result).toBe(builder)
    })
  })

  describe('arrayOverlaps', () => {
    it('should call ArrayMixin.addArrayOperation with && operator', () => {
      const { ArrayMixin } = require('@builders/mixins/index')

      builder.arrayOverlaps('tags', ['tag1', 'tag2'])

      expect(ArrayMixin.addArrayOperation).toHaveBeenCalledWith(builder['query'], 'tags', '&&', [
        'tag1',
        'tag2'
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.arrayOverlaps('tags', ['tag1'])
      expect(result).toBe(builder)
    })
  })

  describe('arrayConcat', () => {
    it('should call ArrayMixin.addArrayOperation with || operator', () => {
      const { ArrayMixin } = require('@builders/mixins/index')

      builder.arrayConcat('tags', ['tag1', 'tag2'])

      expect(ArrayMixin.addArrayOperation).toHaveBeenCalledWith(builder['query'], 'tags', '||', [
        'tag1',
        'tag2'
      ])
    })

    it('should return this for method chaining', () => {
      const result = builder.arrayConcat('tags', ['tag1'])
      expect(result).toBe(builder)
    })
  })

  describe('arrayAgg', () => {
    it('should call ArrayMixin.addArrayFunction with array_agg', () => {
      const { ArrayMixin } = require('@builders/mixins/index')

      builder.arrayAgg('tags', 'tag_list', ['id'])

      expect(ArrayMixin.addArrayFunction).toHaveBeenCalledWith(
        builder['query'],
        'array_agg',
        'tags',
        'tag_list',
        ['id']
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.arrayAgg('tags')
      expect(result).toBe(builder)
    })
  })

  describe('unnest', () => {
    it('should call ArrayMixin.addArrayFunction with unnest', () => {
      const { ArrayMixin } = require('@builders/mixins/index')

      builder.unnest('tags', 'tag')

      expect(ArrayMixin.addArrayFunction).toHaveBeenCalledWith(
        builder['query'],
        'unnest',
        'tags',
        'tag'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.unnest('tags')
      expect(result).toBe(builder)
    })
  })

  describe('arrayLength', () => {
    it('should call ArrayMixin.addArrayFunction with array_length', () => {
      const { ArrayMixin } = require('@builders/mixins/index')

      builder.arrayLength('tags', 'tag_count')

      expect(ArrayMixin.addArrayFunction).toHaveBeenCalledWith(
        builder['query'],
        'array_length',
        'tags',
        'tag_count'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.arrayLength('tags')
      expect(result).toBe(builder)
    })
  })

  describe('arraySlice', () => {
    it('should call ArraySliceMixin.addArraySlice with correct parameters', () => {
      const { ArraySliceMixin } = require('@builders/mixins/index')

      builder.arraySlice('tags', 1, 3, 'tag_slice')

      expect(ArraySliceMixin.addArraySlice).toHaveBeenCalledWith(
        builder['query'],
        'tags',
        1,
        3,
        'tag_slice'
      )
    })

    it('should return this for method chaining', () => {
      const result = builder.arraySlice('tags', 1, 3)
      expect(result).toBe(builder)
    })
  })
})
