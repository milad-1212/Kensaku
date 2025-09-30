import { getInvalidDatabaseTypeError } from '@constants/ErrorMap'

/**
 * Supported database types.
 */
export type DatabaseType = 'mysql' | 'postgres' | 'sqlite'

/**
 * Generic data types that can be mapped to database-specific types.
 */
export type GenericDataType =
  | 'VARCHAR'
  | 'TEXT'
  | 'CHAR'
  | 'INT'
  | 'BIGINT'
  | 'SMALLINT'
  | 'TINYINT'
  | 'DECIMAL'
  | 'FLOAT'
  | 'DOUBLE'
  | 'BOOLEAN'
  | 'DATE'
  | 'TIME'
  | 'TIMESTAMP'
  | 'DATETIME'
  | 'JSON'
  | 'JSONB'
  | 'UUID'
  | 'ARRAY'
  | 'BLOB'
  | 'REAL'
  | 'NUMERIC'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'

/** Database-specific type mappings */
const typeMappings: Record<DatabaseType, Record<string, string>> = {
  /** MySQL type mappings */
  mysql: {
    ARRAY: 'JSON',
    BIGINT: 'BIGINT',
    BOOLEAN: 'BOOLEAN',
    CHAR: 'CHAR',
    DATE: 'DATE',
    DATETIME: 'DATETIME',
    DECIMAL: 'DECIMAL',
    DOUBLE: 'DOUBLE',
    FLOAT: 'FLOAT',
    INT: 'INT',
    JSON: 'JSON',
    SMALLINT: 'SMALLINT',
    TEXT: 'TEXT',
    TIME: 'TIME',
    TIMESTAMP: 'TIMESTAMP',
    TINYINT: 'TINYINT',
    UUID: 'CHAR(36)',
    VARCHAR: 'VARCHAR'
  },
  /** PostgreSQL type mappings */
  postgres: {
    ARRAY: 'ARRAY',
    BIGINT: 'BIGINT',
    BOOLEAN: 'BOOLEAN',
    CHAR: 'CHAR',
    DATE: 'DATE',
    DECIMAL: 'DECIMAL',
    DOUBLE: 'DOUBLE PRECISION',
    FLOAT: 'REAL',
    INT: 'INTEGER',
    JSON: 'JSON',
    JSONB: 'JSONB',
    SMALLINT: 'SMALLINT',
    TEXT: 'TEXT',
    TIME: 'TIME',
    TIMESTAMP: 'TIMESTAMP',
    UUID: 'UUID',
    VARCHAR: 'VARCHAR'
  },
  /** SQLite type mappings */
  sqlite: {
    blob: 'BLOB',
    boolean: 'INTEGER',
    date: 'TEXT',
    decimal: 'REAL',
    double: 'REAL',
    float: 'REAL',
    int: 'INTEGER',
    integer: 'INTEGER',
    json: 'TEXT',
    number: 'INTEGER',
    numeric: 'REAL',
    real: 'REAL',
    string: 'TEXT',
    text: 'TEXT',
    varchar: 'TEXT',
    ARRAY: 'TEXT',
    BIGINT: 'INTEGER',
    BLOB: 'BLOB',
    BOOLEAN: 'INTEGER',
    CHAR: 'TEXT',
    DATE: 'TEXT',
    DATETIME: 'TEXT',
    DECIMAL: 'REAL',
    DOUBLE: 'REAL',
    FLOAT: 'REAL',
    INT: 'INTEGER',
    JSON: 'TEXT',
    SMALLINT: 'INTEGER',
    TEXT: 'TEXT',
    TIME: 'TEXT',
    TIMESTAMP: 'TEXT',
    UUID: 'TEXT',
    VARCHAR: 'TEXT'
  }
}

/**
 * Data type mapping helper class.
 */
export class DataTypeHelpers {
  /**
   * Gets the appropriate data type for a specific database.
   * @param databaseType - The target database type
   * @param genericType - The generic data type to map
   * @returns Database-specific data type string
   * @throws {Error} When database type is not supported
   */
  static getDataType(databaseType: DatabaseType, genericType: string): string {
    const mapping: Record<string, string> = typeMappings[databaseType]
    if (mapping == undefined) {
      throw new Error(getInvalidDatabaseTypeError(databaseType))
    }
    const normalizedType: string = genericType.toUpperCase()
    return (
      mapping[normalizedType] ?? mapping[genericType.toLowerCase()] ?? genericType.toUpperCase()
    )
  }

  /**
   * Gets all supported data types for a specific database.
   * @param databaseType - The target database type
   * @returns Array of supported data types
   * @throws {Error} When database type is not supported
   */
  static getSupportedTypes(databaseType: DatabaseType): string[] {
    const mapping: Record<string, string> = typeMappings[databaseType]
    if (mapping == undefined) {
      throw new Error(getInvalidDatabaseTypeError(databaseType))
    }
    return Object.keys(mapping)
  }

  /**
   * Checks if a data type is supported by a specific database.
   * @param databaseType - The target database type
   * @param genericType - The generic data type to check
   * @returns True if the type is supported
   */
  static isTypeSupported(databaseType: DatabaseType, genericType: string): boolean {
    const mapping: Record<string, string> = typeMappings[databaseType]
    if (mapping == undefined) {
      return false
    }
    const normalizedType: string = genericType.toUpperCase()
    return mapping[normalizedType] !== undefined || mapping[genericType.toLowerCase()] !== undefined
  }

  /**
   * Gets a type mapping function for a specific database.
   * @param databaseType - The target database type
   * @returns Function that maps generic types to database-specific types
   * @throws {Error} When database type is not supported
   */
  static getTypeMapper(databaseType: DatabaseType): (genericType: string) => string {
    return (genericType: string) => this.getDataType(databaseType, genericType)
  }
}

/**
 * Factory function to create database-specific type mappers.
 * @param databaseType - The target database type
 * @returns Type mapper function
 * @throws {Error} When database type is not supported
 */
export function createTypeMapper(databaseType: DatabaseType): (genericType: string) => string {
  return DataTypeHelpers.getTypeMapper(databaseType)
}

/** Pre-configured type mappers for each database */
export const typeMappers: Record<DatabaseType, (genericType: string) => string> = {
  /** MySQL type mapper function */
  mysql: createTypeMapper('mysql'),
  /** PostgreSQL type mapper function */
  postgres: createTypeMapper('postgres'),
  /** SQLite type mapper function */
  sqlite: createTypeMapper('sqlite')
} as const
