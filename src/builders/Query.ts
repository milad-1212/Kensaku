import type { QueryBuilder, DatabaseType } from '@interfaces/index'
import { Connection as ConnectionManager } from '@core/index'
import { SqlEscapeHelper } from '@builders/helpers/index'

/**
 * Abstract base class for all query builders.
 * @template T - Return type of query results
 */
export abstract class BaseQueryBuilder<T = unknown> implements QueryBuilder<T> {
  /** Database connection manager instance */
  protected connectionManager: ConnectionManager
  /** Array of query parameters for SQL parameterization */
  protected params: unknown[] = []

  /**
   * Creates a new BaseQueryBuilder instance.
   * @param connectionManager - Database connection manager
   */
  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager
  }

  /**
   * Executes the query and returns the results.
   * @returns Promise that resolves to an array of results
   * @throws {Error} When database connection fails or query execution fails
   */
  async execute(): Promise<T[]> {
    const connection: Awaited<ReturnType<ConnectionManager['getConnection']>> =
      await this.connectionManager.getConnection()
    try {
      const { sql, params }: { sql: string; params: unknown[] } = this.buildQuery()
      const result: Awaited<ReturnType<typeof connection.query>> = await connection.query(
        sql,
        params
      )
      return result.rows as T[]
    } finally {
      await this.connectionManager.releaseConnection(connection)
    }
  }

  /**
   * Returns the SQL string for this query.
   * @returns SQL query string
   * @throws {Error} When query building fails
   */
  toSQL(): string {
    const { sql }: { sql: string } = this.buildQuery()
    return sql
  }

  /**
   * Returns the parameters for this query.
   * @returns Array of query parameters
   * @throws {Error} When query building fails
   */
  toParams(): unknown[] {
    const { params }: { params: unknown[] } = this.buildQuery()
    return params
  }

  /**
   * Abstract method to build the SQL query and parameters.
   * @returns Object containing SQL string and parameters
   */
  protected abstract buildQuery(): { sql: string; params: unknown[] }

  /**
   * Adds a parameter to the query and returns its placeholder.
   * @param value - Parameter value to add
   * @returns Parameter placeholder string
   */
  protected addParam(value: unknown): string {
    return SqlEscapeHelper.addParam(value, this.params)
  }

  /**
   * Adds a database-specific sanitized parameter to the query.
   * @param value - Parameter value to add
   * @param databaseType - Target database type for sanitization
   * @returns Parameter placeholder string
   */
  protected addDatabaseParam(value: unknown, databaseType: DatabaseType): string {
    return SqlEscapeHelper.addDatabaseParam(value, this.params, databaseType)
  }

  /**
   * Escapes a SQL identifier to prevent injection.
   * @param identifier - Identifier to escape
   * @returns Escaped identifier string
   */
  protected escapeIdentifier(identifier: string): string {
    return SqlEscapeHelper.escapeIdentifier(identifier)
  }

  /**
   * Escapes multiple identifiers and joins them with commas.
   * @param identifiers - Array of identifiers to escape
   * @returns Comma-separated escaped identifiers
   */
  protected escapeIdentifierList(identifiers: string[]): string {
    return SqlEscapeHelper.escapeIdentifierList(identifiers)
  }
}
