import { ParameterBuilders } from '@core/dialects/builders/Parameter'

describe('ParameterBuilders', () => {
  let mockParams: unknown[]

  beforeEach(() => {
    mockParams = []
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('addParam', () => {
    it('should add string parameter and return MySQL/SQLite placeholder', () => {
      const result = ParameterBuilders.addParam('hello', mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual(['hello'])
    })

    it('should add number parameter and return MySQL/SQLite placeholder', () => {
      const result = ParameterBuilders.addParam(42, mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([42])
    })

    it('should add boolean parameter and return MySQL/SQLite placeholder', () => {
      const result = ParameterBuilders.addParam(true, mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([true])
    })

    it('should add null parameter and return MySQL/SQLite placeholder', () => {
      const result = ParameterBuilders.addParam(null, mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([null])
    })

    it('should add undefined parameter and return MySQL/SQLite placeholder', () => {
      const result = ParameterBuilders.addParam(undefined, mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([undefined])
    })

    it('should add array parameter and return MySQL/SQLite placeholder', () => {
      const result = ParameterBuilders.addParam([1, 2, 3], mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([[1, 2, 3]])
    })

    it('should add object parameter and return MySQL/SQLite placeholder', () => {
      const obj = { name: 'John', age: 30 }
      const result = ParameterBuilders.addParam(obj, mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([obj])
    })

    it('should add date parameter and return MySQL/SQLite placeholder', () => {
      const date = new Date('2023-01-01T00:00:00.000Z')
      const result = ParameterBuilders.addParam(date, mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([date])
    })

    it('should add multiple parameters sequentially', () => {
      const result1 = ParameterBuilders.addParam('hello', mockParams)
      const result2 = ParameterBuilders.addParam(42, mockParams)
      const result3 = ParameterBuilders.addParam(true, mockParams)

      expect(result1).toBe('?')
      expect(result2).toBe('?')
      expect(result3).toBe('?')
      expect(mockParams).toEqual(['hello', 42, true])
    })

    it('should handle empty array parameter', () => {
      const result = ParameterBuilders.addParam([], mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([[]])
    })

    it('should handle nested array parameter', () => {
      const result = ParameterBuilders.addParam(
        [
          [1, 2],
          [3, 4]
        ],
        mockParams
      )

      expect(result).toBe('?')
      expect(mockParams).toEqual([
        [
          [1, 2],
          [3, 4]
        ]
      ])
    })

    it('should handle complex object parameter', () => {
      const obj = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: { theme: 'dark' }
          }
        },
        tags: ['admin', 'user']
      }
      const result = ParameterBuilders.addParam(obj, mockParams)

      expect(result).toBe('?')
      expect(mockParams).toEqual([obj])
    })
  })

  describe('addParamPostgres', () => {
    it('should add string parameter and return PostgreSQL placeholder', () => {
      const result = ParameterBuilders.addParamPostgres('hello', mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual(['hello'])
    })

    it('should add number parameter and return PostgreSQL placeholder', () => {
      const result = ParameterBuilders.addParamPostgres(42, mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([42])
    })

    it('should add boolean parameter and return PostgreSQL placeholder', () => {
      const result = ParameterBuilders.addParamPostgres(true, mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([true])
    })

    it('should add null parameter and return PostgreSQL placeholder', () => {
      const result = ParameterBuilders.addParamPostgres(null, mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([null])
    })

    it('should add undefined parameter and return PostgreSQL placeholder', () => {
      const result = ParameterBuilders.addParamPostgres(undefined, mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([undefined])
    })

    it('should add array parameter and return PostgreSQL placeholder', () => {
      const result = ParameterBuilders.addParamPostgres([1, 2, 3], mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([[1, 2, 3]])
    })

    it('should add object parameter and return PostgreSQL placeholder', () => {
      const obj = { name: 'John', age: 30 }
      const result = ParameterBuilders.addParamPostgres(obj, mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([obj])
    })

    it('should add date parameter and return PostgreSQL placeholder', () => {
      const date = new Date('2023-01-01T00:00:00.000Z')
      const result = ParameterBuilders.addParamPostgres(date, mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([date])
    })

    it('should add multiple parameters sequentially with correct numbering', () => {
      const result1 = ParameterBuilders.addParamPostgres('hello', mockParams)
      const result2 = ParameterBuilders.addParamPostgres(42, mockParams)
      const result3 = ParameterBuilders.addParamPostgres(true, mockParams)

      expect(result1).toBe('$1')
      expect(result2).toBe('$2')
      expect(result3).toBe('$3')
      expect(mockParams).toEqual(['hello', 42, true])
    })

    it('should handle empty array parameter', () => {
      const result = ParameterBuilders.addParamPostgres([], mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([[]])
    })

    it('should handle nested array parameter', () => {
      const result = ParameterBuilders.addParamPostgres(
        [
          [1, 2],
          [3, 4]
        ],
        mockParams
      )

      expect(result).toBe('$1')
      expect(mockParams).toEqual([
        [
          [1, 2],
          [3, 4]
        ]
      ])
    })

    it('should handle complex object parameter', () => {
      const obj = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: { theme: 'dark' }
          }
        },
        tags: ['admin', 'user']
      }
      const result = ParameterBuilders.addParamPostgres(obj, mockParams)

      expect(result).toBe('$1')
      expect(mockParams).toEqual([obj])
    })

    it('should handle large number of parameters', () => {
      const results: string[] = []
      for (let i = 0; i < 10; i++) {
        results.push(ParameterBuilders.addParamPostgres(`value${i}`, mockParams))
      }

      expect(results).toEqual(['$1', '$2', '$3', '$4', '$5', '$6', '$7', '$8', '$9', '$10'])
      expect(mockParams).toEqual([
        'value0',
        'value1',
        'value2',
        'value3',
        'value4',
        'value5',
        'value6',
        'value7',
        'value8',
        'value9'
      ])
    })

    it('should handle mixed parameter types with correct numbering', () => {
      const result1 = ParameterBuilders.addParamPostgres('string', mockParams)
      const result2 = ParameterBuilders.addParamPostgres(123, mockParams)
      const result3 = ParameterBuilders.addParamPostgres(true, mockParams)
      const result4 = ParameterBuilders.addParamPostgres(null, mockParams)
      const result5 = ParameterBuilders.addParamPostgres([1, 2, 3], mockParams)

      expect(result1).toBe('$1')
      expect(result2).toBe('$2')
      expect(result3).toBe('$3')
      expect(result4).toBe('$4')
      expect(result5).toBe('$5')
      expect(mockParams).toEqual(['string', 123, true, null, [1, 2, 3]])
    })
  })

  describe('parameter comparison', () => {
    it('should handle same values with different placeholder formats', () => {
      const mysqlParams: unknown[] = []
      const postgresParams: unknown[] = []

      const mysqlResult = ParameterBuilders.addParam('test', mysqlParams)
      const postgresResult = ParameterBuilders.addParamPostgres('test', postgresParams)

      expect(mysqlResult).toBe('?')
      expect(postgresResult).toBe('$1')
      expect(mysqlParams).toEqual(['test'])
      expect(postgresParams).toEqual(['test'])
    })

    it('should maintain parameter order consistency', () => {
      const values = ['first', 'second', 'third']
      const mysqlParams: unknown[] = []
      const postgresParams: unknown[] = []

      values.forEach(value => {
        ParameterBuilders.addParam(value, mysqlParams)
        ParameterBuilders.addParamPostgres(value, postgresParams)
      })

      expect(mysqlParams).toEqual(values)
      expect(postgresParams).toEqual(values)
    })
  })
})
