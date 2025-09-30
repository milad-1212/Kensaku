import { DataTypeHelpers, createTypeMapper, typeMappers } from '@core/dialects/builders/DataType'
import { getInvalidDatabaseTypeError } from '@constants/index'
import type { DatabaseType } from '@interfaces/index'

describe('DataTypeHelpers', () => {
  describe('getDataType', () => {
    it('should return MySQL data type for VARCHAR', () => {
      const result = DataTypeHelpers.getDataType('mysql', 'VARCHAR')
      expect(result).toBe('VARCHAR')
    })

    it('should return MySQL data type for DOUBLE', () => {
      const result = DataTypeHelpers.getDataType('mysql', 'DOUBLE')
      expect(result).toBe('DOUBLE')
    })

    it('should return MySQL data type for JSON', () => {
      const result = DataTypeHelpers.getDataType('mysql', 'JSON')
      expect(result).toBe('JSON')
    })

    it('should return MySQL data type for ARRAY', () => {
      const result = DataTypeHelpers.getDataType('mysql', 'ARRAY')
      expect(result).toBe('JSON')
    })

    it('should return MySQL data type for UUID', () => {
      const result = DataTypeHelpers.getDataType('mysql', 'UUID')
      expect(result).toBe('CHAR(36)')
    })

    it('should return PostgreSQL data type for VARCHAR', () => {
      const result = DataTypeHelpers.getDataType('postgres', 'VARCHAR')
      expect(result).toBe('VARCHAR')
    })

    it('should return PostgreSQL data type for DOUBLE', () => {
      const result = DataTypeHelpers.getDataType('postgres', 'DOUBLE')
      expect(result).toBe('DOUBLE PRECISION')
    })

    it('should return PostgreSQL data type for FLOAT', () => {
      const result = DataTypeHelpers.getDataType('postgres', 'FLOAT')
      expect(result).toBe('REAL')
    })

    it('should return PostgreSQL data type for INT', () => {
      const result = DataTypeHelpers.getDataType('postgres', 'INT')
      expect(result).toBe('INTEGER')
    })

    it('should return PostgreSQL data type for ARRAY', () => {
      const result = DataTypeHelpers.getDataType('postgres', 'ARRAY')
      expect(result).toBe('ARRAY')
    })

    it('should return PostgreSQL data type for UUID', () => {
      const result = DataTypeHelpers.getDataType('postgres', 'UUID')
      expect(result).toBe('UUID')
    })

    it('should return PostgreSQL data type for JSONB', () => {
      const result = DataTypeHelpers.getDataType('postgres', 'JSONB')
      expect(result).toBe('JSONB')
    })

    it('should return SQLite data type for VARCHAR', () => {
      const result = DataTypeHelpers.getDataType('sqlite', 'VARCHAR')
      expect(result).toBe('TEXT')
    })

    it('should return SQLite data type for DOUBLE', () => {
      const result = DataTypeHelpers.getDataType('sqlite', 'DOUBLE')
      expect(result).toBe('REAL')
    })

    it('should return SQLite data type for INT', () => {
      const result = DataTypeHelpers.getDataType('sqlite', 'INT')
      expect(result).toBe('INTEGER')
    })

    it('should return SQLite data type for JSON', () => {
      const result = DataTypeHelpers.getDataType('sqlite', 'JSON')
      expect(result).toBe('TEXT')
    })

    it('should return SQLite data type for UUID', () => {
      const result = DataTypeHelpers.getDataType('sqlite', 'UUID')
      expect(result).toBe('TEXT')
    })

    it('should handle case-insensitive input for MySQL', () => {
      expect(DataTypeHelpers.getDataType('mysql', 'varchar')).toBe('VARCHAR')
      expect(DataTypeHelpers.getDataType('mysql', 'VARCHAR')).toBe('VARCHAR')
      expect(DataTypeHelpers.getDataType('mysql', 'Varchar')).toBe('VARCHAR')
    })

    it('should handle case-insensitive input for PostgreSQL', () => {
      expect(DataTypeHelpers.getDataType('postgres', 'double')).toBe('DOUBLE PRECISION')
      expect(DataTypeHelpers.getDataType('postgres', 'DOUBLE')).toBe('DOUBLE PRECISION')
      expect(DataTypeHelpers.getDataType('postgres', 'Double')).toBe('DOUBLE PRECISION')
    })

    it('should handle case-insensitive input for SQLite', () => {
      expect(DataTypeHelpers.getDataType('sqlite', 'varchar')).toBe('TEXT')
      expect(DataTypeHelpers.getDataType('sqlite', 'VARCHAR')).toBe('TEXT')
      expect(DataTypeHelpers.getDataType('sqlite', 'Varchar')).toBe('TEXT')
    })

    it('should return uppercase version for unknown types', () => {
      expect(DataTypeHelpers.getDataType('mysql', 'UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
      expect(DataTypeHelpers.getDataType('postgres', 'UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
      expect(DataTypeHelpers.getDataType('sqlite', 'UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
    })

    it('should handle SQLite lowercase types', () => {
      expect(DataTypeHelpers.getDataType('sqlite', 'string')).toBe('TEXT')
      expect(DataTypeHelpers.getDataType('sqlite', 'number')).toBe('INTEGER')
      expect(DataTypeHelpers.getDataType('sqlite', 'boolean')).toBe('INTEGER')
      expect(DataTypeHelpers.getDataType('sqlite', 'date')).toBe('TEXT')
      expect(DataTypeHelpers.getDataType('sqlite', 'decimal')).toBe('REAL')
      expect(DataTypeHelpers.getDataType('sqlite', 'blob')).toBe('BLOB')
    })

    it('should throw error for invalid database type', () => {
      expect(() => {
        DataTypeHelpers.getDataType('invalid' as DatabaseType, 'VARCHAR')
      }).toThrow(getInvalidDatabaseTypeError('invalid'))
    })
  })

  describe('getSupportedTypes', () => {
    it('should return supported types for MySQL', () => {
      const types = DataTypeHelpers.getSupportedTypes('mysql')

      expect(types).toContain('VARCHAR')
      expect(types).toContain('INT')
      expect(types).toContain('JSON')
      expect(types).toContain('BOOLEAN')
      expect(types).toContain('UUID')
      expect(types).toContain('ARRAY')
      expect(types).toContain('BIGINT')
      expect(types).toContain('CHAR')
      expect(types).toContain('DATE')
      expect(types).toContain('DATETIME')
      expect(types).toContain('DECIMAL')
      expect(types).toContain('DOUBLE')
      expect(types).toContain('FLOAT')
      expect(types).toContain('SMALLINT')
      expect(types).toContain('TEXT')
      expect(types).toContain('TIME')
      expect(types).toContain('TIMESTAMP')
      expect(types).toContain('TINYINT')
    })

    it('should return supported types for PostgreSQL', () => {
      const types = DataTypeHelpers.getSupportedTypes('postgres')

      expect(types).toContain('VARCHAR')
      expect(types).toContain('INT')
      expect(types).toContain('JSON')
      expect(types).toContain('JSONB')
      expect(types).toContain('BOOLEAN')
      expect(types).toContain('UUID')
      expect(types).toContain('ARRAY')
      expect(types).toContain('BIGINT')
      expect(types).toContain('CHAR')
      expect(types).toContain('DATE')
      expect(types).toContain('DECIMAL')
      expect(types).toContain('DOUBLE')
      expect(types).toContain('FLOAT')
      expect(types).toContain('SMALLINT')
      expect(types).toContain('TEXT')
      expect(types).toContain('TIME')
      expect(types).toContain('TIMESTAMP')
    })

    it('should return supported types for SQLite', () => {
      const types = DataTypeHelpers.getSupportedTypes('sqlite')

      expect(types).toContain('TEXT')
      expect(types).toContain('integer')
      expect(types).toContain('real')
      expect(types).toContain('BLOB')
      expect(types).toContain('VARCHAR')
      expect(types).toContain('INT')
      expect(types).toContain('DOUBLE')
      expect(types).toContain('FLOAT')
      expect(types).toContain('JSON')
      expect(types).toContain('UUID')
      expect(types).toContain('ARRAY')
      expect(types).toContain('BIGINT')
      expect(types).toContain('BOOLEAN')
      expect(types).toContain('CHAR')
      expect(types).toContain('DATE')
      expect(types).toContain('DATETIME')
      expect(types).toContain('DECIMAL')
      expect(types).toContain('SMALLINT')
      expect(types).toContain('TIME')
      expect(types).toContain('TIMESTAMP')

      // SQLite also supports lowercase types
      expect(types).toContain('string')
      expect(types).toContain('number')
      expect(types).toContain('boolean')
      expect(types).toContain('date')
      expect(types).toContain('decimal')
      expect(types).toContain('blob')
    })

    it('should throw error for invalid database type', () => {
      expect(() => {
        DataTypeHelpers.getSupportedTypes('invalid' as DatabaseType)
      }).toThrow(getInvalidDatabaseTypeError('invalid'))
    })
  })

  describe('isTypeSupported', () => {
    it('should return true for supported MySQL types', () => {
      expect(DataTypeHelpers.isTypeSupported('mysql', 'VARCHAR')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('mysql', 'INT')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('mysql', 'JSON')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('mysql', 'BOOLEAN')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('mysql', 'UUID')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('mysql', 'ARRAY')).toBe(true)
    })

    it('should return true for supported PostgreSQL types', () => {
      expect(DataTypeHelpers.isTypeSupported('postgres', 'VARCHAR')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'INT')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'JSON')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'JSONB')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'BOOLEAN')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'UUID')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'ARRAY')).toBe(true)
    })

    it('should return true for supported SQLite types', () => {
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'TEXT')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'INTEGER')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'REAL')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'BLOB')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'VARCHAR')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'INT')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'JSON')).toBe(true)
    })

    it('should handle case-insensitive input', () => {
      expect(DataTypeHelpers.isTypeSupported('mysql', 'varchar')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('mysql', 'VARCHAR')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('mysql', 'Varchar')).toBe(true)

      expect(DataTypeHelpers.isTypeSupported('postgres', 'double')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'DOUBLE')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'Double')).toBe(true)

      expect(DataTypeHelpers.isTypeSupported('sqlite', 'text')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'TEXT')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'Text')).toBe(true)
    })

    it('should return false for unsupported types', () => {
      expect(DataTypeHelpers.isTypeSupported('mysql', 'UNSUPPORTED_TYPE')).toBe(false)
      expect(DataTypeHelpers.isTypeSupported('postgres', 'UNSUPPORTED_TYPE')).toBe(false)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'UNSUPPORTED_TYPE')).toBe(false)
    })

    it('should return false for invalid database type', () => {
      expect(DataTypeHelpers.isTypeSupported('invalid' as DatabaseType, 'VARCHAR')).toBe(false)
    })

    it('should handle SQLite lowercase types', () => {
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'string')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'number')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'boolean')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'date')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'decimal')).toBe(true)
      expect(DataTypeHelpers.isTypeSupported('sqlite', 'blob')).toBe(true)
    })
  })

  describe('getTypeMapper', () => {
    it('should return type mapper function for MySQL', () => {
      const mapper = DataTypeHelpers.getTypeMapper('mysql')

      expect(typeof mapper).toBe('function')
      expect(mapper('VARCHAR')).toBe('VARCHAR')
      expect(mapper('DOUBLE')).toBe('DOUBLE')
      expect(mapper('JSON')).toBe('JSON')
    })

    it('should return type mapper function for PostgreSQL', () => {
      const mapper = DataTypeHelpers.getTypeMapper('postgres')

      expect(typeof mapper).toBe('function')
      expect(mapper('VARCHAR')).toBe('VARCHAR')
      expect(mapper('DOUBLE')).toBe('DOUBLE PRECISION')
      expect(mapper('FLOAT')).toBe('REAL')
      expect(mapper('INT')).toBe('INTEGER')
    })

    it('should return type mapper function for SQLite', () => {
      const mapper = DataTypeHelpers.getTypeMapper('sqlite')

      expect(typeof mapper).toBe('function')
      expect(mapper('VARCHAR')).toBe('TEXT')
      expect(mapper('DOUBLE')).toBe('REAL')
      expect(mapper('INT')).toBe('INTEGER')
      expect(mapper('JSON')).toBe('TEXT')
    })

    it('should handle invalid database type gracefully', () => {
      // Note: The actual implementation may not throw for invalid types
      // This test verifies the function doesn't crash
      expect(() => {
        DataTypeHelpers.getTypeMapper('invalid' as DatabaseType)
      }).not.toThrow()
    })
  })
})

describe('createTypeMapper', () => {
  it('should create type mapper function for MySQL', () => {
    const mapper = createTypeMapper('mysql')

    expect(typeof mapper).toBe('function')
    expect(mapper('VARCHAR')).toBe('VARCHAR')
    expect(mapper('DOUBLE')).toBe('DOUBLE')
    expect(mapper('JSON')).toBe('JSON')
  })

  it('should create type mapper function for PostgreSQL', () => {
    const mapper = createTypeMapper('postgres')

    expect(typeof mapper).toBe('function')
    expect(mapper('VARCHAR')).toBe('VARCHAR')
    expect(mapper('DOUBLE')).toBe('DOUBLE PRECISION')
    expect(mapper('FLOAT')).toBe('REAL')
    expect(mapper('INT')).toBe('INTEGER')
  })

  it('should create type mapper function for SQLite', () => {
    const mapper = createTypeMapper('sqlite')

    expect(typeof mapper).toBe('function')
    expect(mapper('VARCHAR')).toBe('TEXT')
    expect(mapper('DOUBLE')).toBe('REAL')
    expect(mapper('INT')).toBe('INTEGER')
    expect(mapper('JSON')).toBe('TEXT')
  })

  it('should handle invalid database type gracefully', () => {
    // Note: The actual implementation may not throw for invalid types
    // This test verifies the function doesn't crash
    expect(() => {
      createTypeMapper('invalid' as DatabaseType)
    }).not.toThrow()
  })
})

describe('typeMappers', () => {
  it('should have mysql mapper', () => {
    expect(typeof typeMappers.mysql).toBe('function')
    expect(typeMappers.mysql('VARCHAR')).toBe('VARCHAR')
    expect(typeMappers.mysql('DOUBLE')).toBe('DOUBLE')
    expect(typeMappers.mysql('JSON')).toBe('JSON')
  })

  it('should have postgres mapper', () => {
    expect(typeof typeMappers.postgres).toBe('function')
    expect(typeMappers.postgres('VARCHAR')).toBe('VARCHAR')
    expect(typeMappers.postgres('DOUBLE')).toBe('DOUBLE PRECISION')
    expect(typeMappers.postgres('FLOAT')).toBe('REAL')
    expect(typeMappers.postgres('INT')).toBe('INTEGER')
  })

  it('should have sqlite mapper', () => {
    expect(typeof typeMappers.sqlite).toBe('function')
    expect(typeMappers.sqlite('VARCHAR')).toBe('TEXT')
    expect(typeMappers.sqlite('DOUBLE')).toBe('REAL')
    expect(typeMappers.sqlite('INT')).toBe('INTEGER')
    expect(typeMappers.sqlite('JSON')).toBe('TEXT')
  })

  it('should handle case-insensitive input', () => {
    expect(typeMappers.mysql('varchar')).toBe('VARCHAR')
    expect(typeMappers.postgres('double')).toBe('DOUBLE PRECISION')
    expect(typeMappers.sqlite('varchar')).toBe('TEXT')
  })

  it('should handle unknown types', () => {
    expect(typeMappers.mysql('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
    expect(typeMappers.postgres('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
    expect(typeMappers.sqlite('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE')
  })
})
