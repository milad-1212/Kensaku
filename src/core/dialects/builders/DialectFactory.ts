import {
  DataTypeHelpers,
  createTypeMapper,
  typeMappers,
  type DatabaseType
} from '@core/dialects/builders/DataType'
import { getInvalidDatabaseError } from '@constants/index'

/**
 * Dialect factory utilities.
 * @description Provides easy access to database-specific functionality and type mapping.
 */
export class DialectFactory {
  /**
   * Gets the appropriate type mapper for a database type.
   * @param databaseType - The target database type
   * @returns Type mapper function
   * @throws {Error} When database type is not supported
   */
  static getTypeMapper(databaseType: DatabaseType): (genericType: string) => string {
    const typeMapper: (genericType: string) => string = createTypeMapper(databaseType)
    return typeMapper
  }

  /**
   * Gets pre-configured type mappers for all supported databases.
   * @returns Object containing type mappers for each database
   */
  static getTypeMappers(): typeof typeMappers {
    return typeMappers
  }

  /**
   * Creates a dialect-specific getDataType method.
   * @param databaseType - The target database type
   * @returns getDataType method implementation
   * @throws {Error} When database type is not supported
   */
  static createGetDataTypeMethod(databaseType: DatabaseType): (type: string) => string {
    const typeMapper: (genericType: string) => string = this.getTypeMapper(databaseType)
    return (type: string) => typeMapper(type)
  }

  /**
   * Gets database-specific configuration.
   * @param databaseType - The target database type
   * @returns Database configuration object
   */
  static getDatabaseConfig(databaseType: DatabaseType): {
    /** Database display name */
    name: string
    /** Array of supported data types */
    supportedTypes: string[]
    /** Default port number for the database */
    defaultPort: number
    /** Array of database-specific features */
    features: string[]
  } {
    const configs: Record<
      DatabaseType,
      {
        /** Database display name */
        name: string
        /** Array of supported data types */
        supportedTypes: string[]
        /** Default port number for the database */
        defaultPort: number
        /** Array of database-specific features */
        features: string[]
      }
    > = {
      mysql: {
        name: 'MySQL',
        supportedTypes: DataTypeHelpers.getSupportedTypes('mysql'),
        defaultPort: 3306,
        features: ['JSON', 'ARRAY', 'UUID', 'FULLTEXT']
      },
      postgres: {
        name: 'PostgreSQL',
        supportedTypes: DataTypeHelpers.getSupportedTypes('postgres'),
        defaultPort: 5432,
        features: ['JSONB', 'ARRAY', 'UUID', 'FULLTEXT', 'GIN', 'GIST']
      },
      sqlite: {
        name: 'SQLite',
        supportedTypes: DataTypeHelpers.getSupportedTypes('sqlite'),
        defaultPort: 0,
        features: ['JSON', 'FTS', 'RTREE']
      }
    }
    return configs[databaseType]
  }

  /**
   * Validates if a data type is supported by a database.
   * @param databaseType - The target database type
   * @param genericType - The generic data type to validate
   * @returns Validation result with error message if invalid
   */
  static validateDataType(
    databaseType: DatabaseType,
    genericType: string
  ): {
    /** Whether the data type is valid for the database */
    isValid: boolean
    /** Error message if validation fails */
    error?: string
    /** Suggested alternative type if available */
    suggestedType?: string
  } {
    const isSupported: boolean = DataTypeHelpers.isTypeSupported(databaseType, genericType)
    if (isSupported) {
      return { isValid: true }
    }
    const supportedTypes: string[] = DataTypeHelpers.getSupportedTypes(databaseType)
    const similarType: string | undefined = supportedTypes.find(
      (type: string) =>
        type.toLowerCase().includes(genericType.toLowerCase()) ||
        genericType.toLowerCase().includes(type.toLowerCase())
    )
    return {
      isValid: false,
      error: `Data type '${genericType}' is not supported by ${databaseType}`,
      ...similarType !== undefined && { suggestedType: similarType }
    }
  }
}

/**
 * Convenience functions for common database operations.
 */
export const dialectHelpers: {
  /** MySQL type mapping function */
  mysql: (type: string) => string
  /** PostgreSQL type mapping function */
  postgres: (type: string) => string
  /** SQLite type mapping function */
  sqlite: (type: string) => string
  /** Dynamic type mapping function by database name */
  byName: (name: string) => (type: string) => string
} = {
  /**
   * Quick type mapping for MySQL.
   * @throws {Error} When database type is not supported
   */
  mysql: (type: string) => typeMappers.mysql(type),

  /**
   * Quick type mapping for PostgreSQL.
   * @throws {Error} When database type is not supported
   */
  postgres: (type: string) => typeMappers.postgres(type),

  /**
   * Quick type mapping for SQLite.
   * @throws {Error} When database type is not supported
   */
  sqlite: (type: string) => typeMappers.sqlite(type),

  /**
   * Get type mapper by database name (case-insensitive).
   * @param name - Database name
   * @throws {Error} When database name is not supported
   */
  byName: (name: string) => {
    const normalizedName: DatabaseType = name.toLowerCase() as DatabaseType
    if (normalizedName in typeMappers) {
      return typeMappers[normalizedName]
    }
    throw new Error(getInvalidDatabaseError(name))
  }
} as const
