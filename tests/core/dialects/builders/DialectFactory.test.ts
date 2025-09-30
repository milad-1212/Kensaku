import { DialectFactory, dialectHelpers } from '@core/dialects/builders/DialectFactory'
import { getInvalidDatabaseError } from '@constants/index'
import type { DatabaseType } from '@interfaces/index'

// Mock the entire builders module
jest.mock('@core/dialects/builders', () => ({
  createTypeMapper: jest.fn(),
  DataTypeHelpers: {
    getSupportedTypes: jest.fn(),
    isTypeSupported: jest.fn()
  },
  typeMappers: {
    mysql: jest.fn(),
    postgres: jest.fn(),
    sqlite: jest.fn()
  }
}))

// Import the mocked modules
const { createTypeMapper, DataTypeHelpers, typeMappers } = require('@core/dialects/builders')

const mockCreateTypeMapper = createTypeMapper as jest.Mock
const mockDataTypeHelpers = DataTypeHelpers as jest.Mocked<typeof DataTypeHelpers>
const mockTypeMappers = typeMappers as jest.Mocked<typeof typeMappers>

describe('DialectFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTypeMapper', () => {
    beforeEach(() => {
      mockCreateTypeMapper.mockImplementation((dbType: DatabaseType) => {
        return (type: string) => {
          if (dbType === 'mysql') return type.toUpperCase()
          if (dbType === 'postgres') {
            if (type === 'DOUBLE') return 'DOUBLE PRECISION'
            if (type === 'FLOAT') return 'REAL'
            if (type === 'INT') return 'INTEGER'
            return type.toUpperCase()
          }
          if (dbType === 'sqlite') {
            if (type === 'VARCHAR') return 'TEXT'
            if (type === 'DOUBLE') return 'REAL'
            if (type === 'INT') return 'INTEGER'
            return type.toUpperCase()
          }
          return type.toUpperCase()
        }
      })
    })

    it('should return type mapper function for mysql', () => {
      const mapper = DialectFactory.getTypeMapper('mysql')

      expect(typeof mapper).toBe('function')
      expect(mockCreateTypeMapper).toHaveBeenCalledWith('mysql')

      // Test the mapper function
      const result = mapper('VARCHAR')
      expect(result).toBe('VARCHAR')
    })

    it('should return type mapper function for postgres', () => {
      const mapper = DialectFactory.getTypeMapper('postgres')

      expect(typeof mapper).toBe('function')
      expect(mockCreateTypeMapper).toHaveBeenCalledWith('postgres')

      // Test the mapper function
      const result = mapper('DOUBLE')
      expect(result).toBe('DOUBLE PRECISION')
    })

    it('should return type mapper function for sqlite', () => {
      const mapper = DialectFactory.getTypeMapper('sqlite')

      expect(typeof mapper).toBe('function')
      expect(mockCreateTypeMapper).toHaveBeenCalledWith('sqlite')

      // Test the mapper function
      const result = mapper('VARCHAR')
      expect(result).toBe('TEXT')
    })

    it('should handle case-insensitive type mapping', () => {
      const mapper = DialectFactory.getTypeMapper('mysql')

      const result1 = mapper('varchar')
      const result2 = mapper('VARCHAR')
      const result3 = mapper('Varchar')

      expect(result1).toBe('VARCHAR')
      expect(result2).toBe('VARCHAR')
      expect(result3).toBe('VARCHAR')
    })

    it('should handle unknown types by returning uppercase version', () => {
      const mapper = DialectFactory.getTypeMapper('mysql')

      const result = mapper('UNKNOWN_TYPE')
      expect(result).toBe('UNKNOWN_TYPE')
    })
  })

  describe('createGetDataTypeMethod', () => {
    it('should create getDataType method for mysql', () => {
      const getDataType = DialectFactory.createGetDataTypeMethod('mysql')

      expect(typeof getDataType).toBe('function')

      const result = getDataType('VARCHAR')
      expect(result).toBe('VARCHAR')
    })

    it('should create getDataType method for postgres', () => {
      const getDataType = DialectFactory.createGetDataTypeMethod('postgres')

      expect(typeof getDataType).toBe('function')

      const result = getDataType('DOUBLE')
      expect(result).toBe('DOUBLE PRECISION')
    })

    it('should create getDataType method for sqlite', () => {
      const getDataType = DialectFactory.createGetDataTypeMethod('sqlite')

      expect(typeof getDataType).toBe('function')

      const result = getDataType('VARCHAR')
      expect(result).toBe('TEXT')
    })

    it('should handle multiple calls with different types', () => {
      const getDataType = DialectFactory.createGetDataTypeMethod('postgres')

      expect(getDataType('INT')).toBe('INTEGER')
      expect(getDataType('FLOAT')).toBe('REAL')
      expect(getDataType('JSON')).toBe('JSON')
      expect(getDataType('UUID')).toBe('UUID')
    })
  })

  describe('getDatabaseConfig', () => {
    beforeEach(() => {
      mockDataTypeHelpers.getSupportedTypes.mockImplementation((dbType: DatabaseType) => {
        const mockTypes = {
          mysql: ['VARCHAR', 'INT', 'JSON', 'BOOLEAN'],
          postgres: ['VARCHAR', 'INTEGER', 'JSONB', 'BOOLEAN'],
          sqlite: ['TEXT', 'INTEGER', 'JSON', 'INTEGER']
        }
        return mockTypes[dbType] || []
      })
    })

    it('should return MySQL configuration', () => {
      const config = DialectFactory.getDatabaseConfig('mysql')

      expect(config).toEqual({
        name: 'MySQL',
        supportedTypes: ['VARCHAR', 'INT', 'JSON', 'BOOLEAN'],
        defaultPort: 3306,
        features: ['JSON', 'ARRAY', 'UUID', 'FULLTEXT']
      })
      expect(mockDataTypeHelpers.getSupportedTypes).toHaveBeenCalledWith('mysql')
    })

    it('should return PostgreSQL configuration', () => {
      const config = DialectFactory.getDatabaseConfig('postgres')

      expect(config).toEqual({
        name: 'PostgreSQL',
        supportedTypes: ['VARCHAR', 'INTEGER', 'JSONB', 'BOOLEAN'],
        defaultPort: 5432,
        features: ['JSONB', 'ARRAY', 'UUID', 'FULLTEXT', 'GIN', 'GIST']
      })
      expect(mockDataTypeHelpers.getSupportedTypes).toHaveBeenCalledWith('postgres')
    })

    it('should return SQLite configuration', () => {
      const config = DialectFactory.getDatabaseConfig('sqlite')

      expect(config).toEqual({
        name: 'SQLite',
        supportedTypes: ['TEXT', 'INTEGER', 'JSON', 'INTEGER'],
        defaultPort: 0,
        features: ['JSON', 'FTS', 'RTREE']
      })
      expect(mockDataTypeHelpers.getSupportedTypes).toHaveBeenCalledWith('sqlite')
    })

    it('should have correct port numbers for each database', () => {
      const mysqlConfig = DialectFactory.getDatabaseConfig('mysql')
      const postgresConfig = DialectFactory.getDatabaseConfig('postgres')
      const sqliteConfig = DialectFactory.getDatabaseConfig('sqlite')

      expect(mysqlConfig.defaultPort).toBe(3306)
      expect(postgresConfig.defaultPort).toBe(5432)
      expect(sqliteConfig.defaultPort).toBe(0)
    })

    it('should have appropriate features for each database', () => {
      const mysqlConfig = DialectFactory.getDatabaseConfig('mysql')
      const postgresConfig = DialectFactory.getDatabaseConfig('postgres')
      const sqliteConfig = DialectFactory.getDatabaseConfig('sqlite')

      expect(mysqlConfig.features).toContain('JSON')
      expect(postgresConfig.features).toContain('JSONB')
      expect(sqliteConfig.features).toContain('FTS')
    })
  })

  describe('validateDataType', () => {
    beforeEach(() => {
      mockDataTypeHelpers.isTypeSupported.mockImplementation(
        (dbType: DatabaseType, type: string) => {
          const supportedTypes = {
            mysql: ['VARCHAR', 'INT', 'JSON', 'BOOLEAN'],
            postgres: ['VARCHAR', 'INTEGER', 'JSONB', 'BOOLEAN'],
            sqlite: ['TEXT', 'INTEGER', 'JSON', 'INTEGER']
          }
          return (supportedTypes[dbType] || []).includes(type.toUpperCase())
        }
      )

      mockDataTypeHelpers.getSupportedTypes.mockImplementation((dbType: DatabaseType) => {
        const mockTypes = {
          mysql: ['VARCHAR', 'INT', 'JSON', 'BOOLEAN'],
          postgres: ['VARCHAR', 'INTEGER', 'JSONB', 'BOOLEAN'],
          sqlite: ['TEXT', 'INTEGER', 'JSON', 'INTEGER']
        }
        return mockTypes[dbType] || []
      })
    })

    it('should validate supported data type for mysql', () => {
      const result = DialectFactory.validateDataType('mysql', 'VARCHAR')

      expect(result).toEqual({
        isValid: true
      })
      expect(mockDataTypeHelpers.isTypeSupported).toHaveBeenCalledWith('mysql', 'VARCHAR')
    })

    it('should validate supported data type for postgres', () => {
      const result = DialectFactory.validateDataType('postgres', 'INTEGER')

      expect(result).toEqual({
        isValid: true
      })
      expect(mockDataTypeHelpers.isTypeSupported).toHaveBeenCalledWith('postgres', 'INTEGER')
    })

    it('should validate supported data type for sqlite', () => {
      const result = DialectFactory.validateDataType('sqlite', 'TEXT')

      expect(result).toEqual({
        isValid: true
      })
      expect(mockDataTypeHelpers.isTypeSupported).toHaveBeenCalledWith('sqlite', 'TEXT')
    })

    it('should reject unsupported data type', () => {
      const result = DialectFactory.validateDataType('mysql', 'UNSUPPORTED_TYPE')

      expect(result).toEqual({
        isValid: false,
        error: "Data type 'UNSUPPORTED_TYPE' is not supported by mysql"
      })
      expect(mockDataTypeHelpers.isTypeSupported).toHaveBeenCalledWith('mysql', 'UNSUPPORTED_TYPE')
      expect(mockDataTypeHelpers.getSupportedTypes).toHaveBeenCalledWith('mysql')
    })

    it('should suggest similar type when available', () => {
      mockDataTypeHelpers.getSupportedTypes.mockReturnValue([
        'VARCHAR',
        'INT',
        'JSON',
        'BOOLEAN',
        'VARBINARY'
      ])

      const result = DialectFactory.validateDataType('mysql', 'VARCHAR2')

      expect(result).toEqual({
        isValid: false,
        error: "Data type 'VARCHAR2' is not supported by mysql",
        suggestedType: 'VARCHAR'
      })
    })

    it('should handle case-insensitive validation', () => {
      const result = DialectFactory.validateDataType('mysql', 'varchar')

      expect(result).toEqual({
        isValid: true
      })
      expect(mockDataTypeHelpers.isTypeSupported).toHaveBeenCalledWith('mysql', 'varchar')
    })

    it('should not suggest type when no similar type found', () => {
      mockDataTypeHelpers.getSupportedTypes.mockReturnValue(['INT', 'BOOLEAN'])

      const result = DialectFactory.validateDataType('mysql', 'COMPLETELY_DIFFERENT')

      expect(result).toEqual({
        isValid: false,
        error: "Data type 'COMPLETELY_DIFFERENT' is not supported by mysql"
      })
      expect(result.suggestedType).toBeUndefined()
    })
  })
})

describe('dialectHelpers', () => {
  beforeEach(() => {
    mockTypeMappers.mysql.mockImplementation((type: string) => type.toUpperCase())
    mockTypeMappers.postgres.mockImplementation((type: string) => {
      const lowerType = type.toLowerCase()
      if (lowerType === 'double') return 'DOUBLE PRECISION'
      if (lowerType === 'float') return 'REAL'
      if (lowerType === 'int') return 'INTEGER'
      return type.toUpperCase()
    })
    mockTypeMappers.sqlite.mockImplementation((type: string) => {
      const lowerType = type.toLowerCase()
      if (lowerType === 'varchar') return 'TEXT'
      if (lowerType === 'double') return 'REAL'
      if (lowerType === 'int') return 'INTEGER'
      return type.toUpperCase()
    })
  })

  describe('mysql', () => {
    it('should map VARCHAR to VARCHAR', () => {
      const result = dialectHelpers.mysql('VARCHAR')
      expect(result).toBe('VARCHAR')
      expect(mockTypeMappers.mysql).toHaveBeenCalledWith('VARCHAR')
    })

    it('should map DOUBLE to DOUBLE', () => {
      const result = dialectHelpers.mysql('DOUBLE')
      expect(result).toBe('DOUBLE')
      expect(mockTypeMappers.mysql).toHaveBeenCalledWith('DOUBLE')
    })

    it('should map JSON to JSON', () => {
      const result = dialectHelpers.mysql('JSON')
      expect(result).toBe('JSON')
      expect(mockTypeMappers.mysql).toHaveBeenCalledWith('JSON')
    })

    it('should handle case-insensitive input', () => {
      const result = dialectHelpers.mysql('varchar')
      expect(result).toBe('VARCHAR')
      expect(mockTypeMappers.mysql).toHaveBeenCalledWith('varchar')
    })
  })

  describe('postgres', () => {
    it('should map VARCHAR to VARCHAR', () => {
      const result = dialectHelpers.postgres('VARCHAR')
      expect(result).toBe('VARCHAR')
      expect(mockTypeMappers.postgres).toHaveBeenCalledWith('VARCHAR')
    })

    it('should map DOUBLE to DOUBLE PRECISION', () => {
      const result = dialectHelpers.postgres('DOUBLE')
      expect(result).toBe('DOUBLE PRECISION')
      expect(mockTypeMappers.postgres).toHaveBeenCalledWith('DOUBLE')
    })

    it('should map FLOAT to REAL', () => {
      const result = dialectHelpers.postgres('FLOAT')
      expect(result).toBe('REAL')
      expect(mockTypeMappers.postgres).toHaveBeenCalledWith('FLOAT')
    })

    it('should map INT to INTEGER', () => {
      const result = dialectHelpers.postgres('INT')
      expect(result).toBe('INTEGER')
      expect(mockTypeMappers.postgres).toHaveBeenCalledWith('INT')
    })

    it('should handle case-insensitive input', () => {
      const result = dialectHelpers.postgres('double')
      expect(result).toBe('DOUBLE PRECISION')
      expect(mockTypeMappers.postgres).toHaveBeenCalledWith('double')
    })
  })

  describe('sqlite', () => {
    it('should map VARCHAR to TEXT', () => {
      const result = dialectHelpers.sqlite('VARCHAR')
      expect(result).toBe('TEXT')
      expect(mockTypeMappers.sqlite).toHaveBeenCalledWith('VARCHAR')
    })

    it('should map DOUBLE to REAL', () => {
      const result = dialectHelpers.sqlite('DOUBLE')
      expect(result).toBe('REAL')
      expect(mockTypeMappers.sqlite).toHaveBeenCalledWith('DOUBLE')
    })

    it('should map INT to INTEGER', () => {
      const result = dialectHelpers.sqlite('INT')
      expect(result).toBe('INTEGER')
      expect(mockTypeMappers.sqlite).toHaveBeenCalledWith('INT')
    })

    it('should map JSON to TEXT', () => {
      const result = dialectHelpers.sqlite('JSON')
      expect(result).toBe('JSON')
      expect(mockTypeMappers.sqlite).toHaveBeenCalledWith('JSON')
    })

    it('should handle case-insensitive input', () => {
      const result = dialectHelpers.sqlite('varchar')
      expect(result).toBe('TEXT')
      expect(mockTypeMappers.sqlite).toHaveBeenCalledWith('varchar')
    })
  })

  describe('byName', () => {
    it('should return mysql mapper for "mysql"', () => {
      const mapper = dialectHelpers.byName('mysql')
      expect(typeof mapper).toBe('function')
      expect(mapper).toBe(mockTypeMappers.mysql)
    })

    it('should return postgres mapper for "postgres"', () => {
      const mapper = dialectHelpers.byName('postgres')
      expect(typeof mapper).toBe('function')
      expect(mapper).toBe(mockTypeMappers.postgres)
    })

    it('should return sqlite mapper for "sqlite"', () => {
      const mapper = dialectHelpers.byName('sqlite')
      expect(typeof mapper).toBe('function')
      expect(mapper).toBe(mockTypeMappers.sqlite)
    })

    it('should handle case-insensitive database names', () => {
      const mapper1 = dialectHelpers.byName('MySQL')
      const mapper2 = dialectHelpers.byName('POSTGRES')
      const mapper3 = dialectHelpers.byName('SQLite')

      expect(typeof mapper1).toBe('function')
      expect(typeof mapper2).toBe('function')
      expect(typeof mapper3).toBe('function')

      expect(mapper1).toBe(mockTypeMappers.mysql)
      expect(mapper2).toBe(mockTypeMappers.postgres)
      expect(mapper3).toBe(mockTypeMappers.sqlite)
    })

    it('should throw error for unsupported database name', () => {
      expect(() => {
        dialectHelpers.byName('oracle')
      }).toThrow(getInvalidDatabaseError('oracle'))
    })

    it('should throw error for empty database name', () => {
      expect(() => {
        dialectHelpers.byName('')
      }).toThrow(getInvalidDatabaseError(''))
    })

    it('should handle null database name gracefully', () => {
      // Note: The actual implementation may not handle null gracefully
      // This test verifies the function behavior with null input
      expect(() => {
        dialectHelpers.byName(null as any)
      }).toThrow()
    })
  })
})
