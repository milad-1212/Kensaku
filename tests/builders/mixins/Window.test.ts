import { WindowMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'
import type { QuerySelect, QueryWindowSpec } from '@interfaces/index'

describe('WindowMixin', () => {
  let mockQuery: QuerySelect
  let mockWindowSpec: QueryWindowSpec

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'users'
    }
    mockWindowSpec = {
      partitionBy: ['department'],
      orderBy: [{ column: 'salary', direction: 'DESC' }]
    }
  })

  describe('addRowNumber', () => {
    it('should add ROW_NUMBER window function without window spec', () => {
      WindowMixin.addRowNumber(mockQuery)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'ROW_NUMBER'
      })
    })

    it('should add ROW_NUMBER window function with window spec', () => {
      WindowMixin.addRowNumber(mockQuery, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'ROW_NUMBER',
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addRowNumber(mockQuery)

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })

    it('should append to existing windowFunctions array', () => {
      WindowMixin.addRowNumber(mockQuery)
      WindowMixin.addRowNumber(mockQuery, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(2)
      expect(mockQuery.windowFunctions![0].over).toBeUndefined()
      expect(mockQuery.windowFunctions![1].over).toBe(mockWindowSpec)
    })
  })

  describe('addRank', () => {
    it('should add RANK window function without window spec', () => {
      WindowMixin.addRank(mockQuery)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'RANK'
      })
    })

    it('should add RANK window function with window spec', () => {
      WindowMixin.addRank(mockQuery, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'RANK',
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addRank(mockQuery)

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })
  })

  describe('addDenseRank', () => {
    it('should add DENSE_RANK window function without window spec', () => {
      WindowMixin.addDenseRank(mockQuery)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'DENSE_RANK'
      })
    })

    it('should add DENSE_RANK window function with window spec', () => {
      WindowMixin.addDenseRank(mockQuery, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'DENSE_RANK',
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addDenseRank(mockQuery)

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })
  })

  describe('addLag', () => {
    it('should add LAG window function with default offset', () => {
      WindowMixin.addLag(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LAG',
        args: ['salary', '1']
      })
    })

    it('should add LAG window function with custom offset', () => {
      WindowMixin.addLag(mockQuery, 'salary', 3)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LAG',
        args: ['salary', '3']
      })
    })

    it('should add LAG window function with window spec', () => {
      WindowMixin.addLag(mockQuery, 'salary', 2, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LAG',
        args: ['salary', '2'],
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addLag(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })

    it('should handle zero offset', () => {
      WindowMixin.addLag(mockQuery, 'salary', 0)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LAG',
        args: ['salary', '0']
      })
    })
  })

  describe('addLead', () => {
    it('should add LEAD window function with default offset', () => {
      WindowMixin.addLead(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LEAD',
        args: ['salary', '1']
      })
    })

    it('should add LEAD window function with custom offset', () => {
      WindowMixin.addLead(mockQuery, 'salary', 5)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LEAD',
        args: ['salary', '5']
      })
    })

    it('should add LEAD window function with window spec', () => {
      WindowMixin.addLead(mockQuery, 'salary', 3, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LEAD',
        args: ['salary', '3'],
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addLead(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })

    it('should handle zero offset', () => {
      WindowMixin.addLead(mockQuery, 'salary', 0)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LEAD',
        args: ['salary', '0']
      })
    })
  })

  describe('addFirstValue', () => {
    it('should add FIRST_VALUE window function without window spec', () => {
      WindowMixin.addFirstValue(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'FIRST_VALUE',
        args: ['salary']
      })
    })

    it('should add FIRST_VALUE window function with window spec', () => {
      WindowMixin.addFirstValue(mockQuery, 'salary', mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'FIRST_VALUE',
        args: ['salary'],
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addFirstValue(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })
  })

  describe('addLastValue', () => {
    it('should add LAST_VALUE window function without window spec', () => {
      WindowMixin.addLastValue(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LAST_VALUE',
        args: ['salary']
      })
    })

    it('should add LAST_VALUE window function with window spec', () => {
      WindowMixin.addLastValue(mockQuery, 'salary', mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'LAST_VALUE',
        args: ['salary'],
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addLastValue(mockQuery, 'salary')

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })
  })

  describe('addNtile', () => {
    it('should add NTILE window function without window spec', () => {
      WindowMixin.addNtile(mockQuery, 4)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTILE',
        args: ['4']
      })
    })

    it('should add NTILE window function with window spec', () => {
      WindowMixin.addNtile(mockQuery, 5, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTILE',
        args: ['5'],
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addNtile(mockQuery, 3)

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })

    it('should throw error for zero buckets', () => {
      expect(() => {
        WindowMixin.addNtile(mockQuery, 0)
      }).toThrow(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE)
    })

    it('should throw error for negative buckets', () => {
      expect(() => {
        WindowMixin.addNtile(mockQuery, -1)
      }).toThrow(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE)
    })

    it('should handle single bucket', () => {
      WindowMixin.addNtile(mockQuery, 1)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTILE',
        args: ['1']
      })
    })

    it('should handle large number of buckets', () => {
      WindowMixin.addNtile(mockQuery, 1000)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTILE',
        args: ['1000']
      })
    })
  })

  describe('addCumeDist', () => {
    it('should add CUME_DIST window function without window spec', () => {
      WindowMixin.addCumeDist(mockQuery)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'CUME_DIST'
      })
    })

    it('should add CUME_DIST window function with window spec', () => {
      WindowMixin.addCumeDist(mockQuery, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'CUME_DIST',
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addCumeDist(mockQuery)

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })
  })

  describe('addPercentRank', () => {
    it('should add PERCENT_RANK window function without window spec', () => {
      WindowMixin.addPercentRank(mockQuery)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'PERCENT_RANK'
      })
    })

    it('should add PERCENT_RANK window function with window spec', () => {
      WindowMixin.addPercentRank(mockQuery, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'PERCENT_RANK',
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addPercentRank(mockQuery)

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })
  })

  describe('addNthValue', () => {
    it('should add NTH_VALUE window function without window spec', () => {
      WindowMixin.addNthValue(mockQuery, 'salary', 3)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTH_VALUE',
        args: ['salary', '3']
      })
    })

    it('should add NTH_VALUE window function with window spec', () => {
      WindowMixin.addNthValue(mockQuery, 'salary', 5, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTH_VALUE',
        args: ['salary', '5'],
        over: mockWindowSpec
      })
    })

    it('should initialize windowFunctions array if undefined', () => {
      expect(mockQuery.windowFunctions).toBeUndefined()

      WindowMixin.addNthValue(mockQuery, 'salary', 2)

      expect(mockQuery.windowFunctions).toBeDefined()
      expect(mockQuery.windowFunctions).toHaveLength(1)
    })

    it('should handle first value (n=1)', () => {
      WindowMixin.addNthValue(mockQuery, 'salary', 1)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTH_VALUE',
        args: ['salary', '1']
      })
    })

    it('should handle zero position', () => {
      WindowMixin.addNthValue(mockQuery, 'salary', 0)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTH_VALUE',
        args: ['salary', '0']
      })
    })

    it('should handle large position', () => {
      WindowMixin.addNthValue(mockQuery, 'salary', 1000)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0]).toEqual({
        function: 'NTH_VALUE',
        args: ['salary', '1000']
      })
    })
  })

  describe('mixed window functions', () => {
    it('should handle multiple different window functions', () => {
      WindowMixin.addRowNumber(mockQuery)
      WindowMixin.addRank(mockQuery, mockWindowSpec)
      WindowMixin.addLag(mockQuery, 'salary', 2)
      WindowMixin.addNtile(mockQuery, 4, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(4)
      expect(mockQuery.windowFunctions![0].function).toBe('ROW_NUMBER')
      expect(mockQuery.windowFunctions![1].function).toBe('RANK')
      expect(mockQuery.windowFunctions![2].function).toBe('LAG')
      expect(mockQuery.windowFunctions![3].function).toBe('NTILE')
    })

    it('should handle functions with and without window specs', () => {
      WindowMixin.addRowNumber(mockQuery)
      WindowMixin.addRank(mockQuery, mockWindowSpec)
      WindowMixin.addDenseRank(mockQuery)
      WindowMixin.addCumeDist(mockQuery, mockWindowSpec)

      expect(mockQuery.windowFunctions).toHaveLength(4)
      expect(mockQuery.windowFunctions![0].over).toBeUndefined()
      expect(mockQuery.windowFunctions![1].over).toBe(mockWindowSpec)
      expect(mockQuery.windowFunctions![2].over).toBeUndefined()
      expect(mockQuery.windowFunctions![3].over).toBe(mockWindowSpec)
    })

    it('should handle functions with different argument patterns', () => {
      WindowMixin.addRowNumber(mockQuery)
      WindowMixin.addLag(mockQuery, 'salary', 1)
      WindowMixin.addFirstValue(mockQuery, 'name')
      WindowMixin.addNthValue(mockQuery, 'salary', 3)

      expect(mockQuery.windowFunctions).toHaveLength(4)
      expect(mockQuery.windowFunctions![0].args).toBeUndefined()
      expect(mockQuery.windowFunctions![1].args).toEqual(['salary', '1'])
      expect(mockQuery.windowFunctions![2].args).toEqual(['name'])
      expect(mockQuery.windowFunctions![3].args).toEqual(['salary', '3'])
    })
  })

  describe('window spec variations', () => {
    it('should handle window spec with only partitionBy', () => {
      const partitionOnlySpec: QueryWindowSpec = {
        partitionBy: ['department', 'team']
      }

      WindowMixin.addRowNumber(mockQuery, partitionOnlySpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0].over).toEqual(partitionOnlySpec)
    })

    it('should handle window spec with only orderBy', () => {
      const orderOnlySpec: QueryWindowSpec = {
        orderBy: [
          { column: 'salary', direction: 'DESC' },
          { column: 'name', direction: 'ASC' }
        ]
      }

      WindowMixin.addRank(mockQuery, orderOnlySpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0].over).toEqual(orderOnlySpec)
    })

    it('should handle empty window spec', () => {
      const emptySpec: QueryWindowSpec = {}

      WindowMixin.addDenseRank(mockQuery, emptySpec)

      expect(mockQuery.windowFunctions).toHaveLength(1)
      expect(mockQuery.windowFunctions![0].over).toEqual(emptySpec)
    })
  })
})
