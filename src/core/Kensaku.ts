import type {
  ConnectionBase,
  DatabaseConfig,
  DatabaseQueryResult,
  DatabaseTransaction,
  QueryBuilder
} from '@interfaces/index'
import { Connection as ConnectionManager, QueryEngine } from '@core/index'
import { DeleteBuilder, InsertBuilder, SelectBuilder, UpdateBuilder } from '@builders/index'

/**
 * Main Kensaku class that provides a fluent interface for building and executing SQL queries.
 * @description Supports multiple database dialects including PostgreSQL, MySQL, and SQLite.
 */
export class Kensaku {
  /** Database connection manager instance */
  private readonly connectionManager: ConnectionManager
  /** Query engine instance */
  private readonly queryEngine: QueryEngine

  /**
   * Creates a new Kensaku instance with the provided database configuration.
   * @param config - Database connection configuration
   */
  constructor(config: DatabaseConfig) {
    this.connectionManager = new ConnectionManager(config)
    this.queryEngine = new QueryEngine(this.connectionManager)
  }

  /**
   * Gets a database connection from the connection manager.
   * @returns Promise that resolves to a database connection
   */
  async getConnection(): Promise<ConnectionBase> {
    return this.connectionManager.getConnection()
  }

  /**
   * Closes all database connections.
   */
  async close(): Promise<void> {
    await this.connectionManager.close()
  }

  /**
   * Creates a new SELECT query builder instance.
   * @param columns - Optional columns to select
   * @returns A new SelectBuilder instance for building SELECT queries
   */
  select(...columns: string[]): SelectBuilder {
    return this.queryEngine.select(...columns)
  }

  /**
   * Creates a new INSERT query builder instance.
   * @returns A new InsertBuilder instance for building INSERT queries
   */
  insert(): InsertBuilder {
    return this.queryEngine.insert()
  }

  /**
   * Creates a new UPDATE query builder instance.
   * @returns A new UpdateBuilder instance for building UPDATE queries
   */
  update(): UpdateBuilder {
    return this.queryEngine.update()
  }

  /**
   * Creates a new DELETE query builder instance.
   * @returns A new DeleteBuilder instance for building DELETE queries
   */
  delete(): DeleteBuilder {
    return this.queryEngine.delete()
  }

  /**
   * Creates a new query builder instance.
   * @returns A new QueryBuilder instance
   */
  query(): QueryBuilder {
    return this.queryEngine.createQuery()
  }

  /**
   * Executes a raw SQL query with optional parameters.
   * @param sql - The raw SQL query string
   * @param params - Optional array of parameters for the query
   * @returns Promise that resolves to an array of query results
   * @throws {Error} When SQL syntax is invalid or query execution fails
   */
  async raw(sql: string, params?: unknown[]): Promise<unknown[]> {
    const connection: ConnectionBase = await this.getConnection()
    try {
      const result: DatabaseQueryResult = await connection.query(sql, params ?? [])
      return result.rows
    } finally {
      await this.connectionManager.releaseConnection(connection)
    }
  }

  /**
   * Executes a transaction with the provided callback.
   * @param callback - Function to execute within the transaction
   * @returns Promise that resolves to the callback result
   */
  async transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
    const connection: ConnectionBase = await this.getConnection()
    return connection.transaction(callback)
  }
}
