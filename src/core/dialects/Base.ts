import type {
  ConnectionBase,
  DatabaseConfig,
  QuerySelect,
  QueryInsert,
  QueryUpdate,
  QueryDelete
} from '@interfaces/index'

/**
 * Abstract base class for database dialect implementations.
 * @description Provides the interface that all database dialects must implement.
 */
export abstract class Base {
  /** Database configuration object */
  protected config: DatabaseConfig

  /**
   * Creates a new Base dialect instance.
   * @param config - Database configuration
   */
  constructor(config: DatabaseConfig) {
    this.config = config
  }

  /**
   * Creates a database connection.
   * @param config - Database configuration
   * @returns Promise that resolves to a connection instance
   */
  abstract createConnection(config: DatabaseConfig): Promise<ConnectionBase>

  /**
   * Builds a SELECT query for this dialect.
   * @param query - SELECT query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildSelectQuery(query: QuerySelect): { sql: string; params: unknown[] }

  /**
   * Builds an INSERT query for this dialect.
   * @param query - INSERT query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildInsertQuery(query: QueryInsert): { sql: string; params: unknown[] }

  /**
   * Builds an UPDATE query for this dialect.
   * @param query - UPDATE query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildUpdateQuery(query: QueryUpdate): { sql: string; params: unknown[] }

  /**
   * Builds a DELETE query for this dialect.
   * @param query - DELETE query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildDeleteQuery(query: QueryDelete): { sql: string; params: unknown[] }

  /**
   * Escapes a database identifier for this dialect.
   * @param name - Identifier to escape
   * @returns Escaped identifier string
   */
  abstract escapeIdentifier(name: string): string

  /**
   * Escapes a value for this dialect.
   * @param value - Value to escape
   * @returns Escaped value string
   */
  abstract escapeValue(value: unknown): string

  /**
   * Maps a generic data type to this dialect's specific type.
   * @param type - Generic data type
   * @returns Dialect-specific data type
   */
  abstract getDataType(type: string): string

  /**
   * Gets the LIMIT/OFFSET syntax for this dialect.
   * @param limit - Number of rows to limit
   * @param offset - Number of rows to skip
   * @returns LIMIT/OFFSET SQL syntax
   */
  abstract getLimitSyntax(limit?: number, offset?: number): string
}
