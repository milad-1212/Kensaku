import type { DatabaseQueryResult, DatabaseTransaction } from '@interfaces/index'

/**
 * Base interface for database connections.
 * @description Defines the core methods that all database connections must implement.
 */
export interface ConnectionBase {
  /**
   * Executes a SQL query with optional parameters.
   * @param sql - SQL query string
   * @param params - Optional array of query parameters
   * @returns Promise that resolves to query results
   */
  query(sql: string, params?: unknown[]): Promise<DatabaseQueryResult>

  /**
   * Executes a transaction with the provided callback.
   * @param callback - Function to execute within the transaction
   * @returns Promise that resolves to the callback result
   */
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>

  /**
   * Closes the database connection.
   * @returns Promise that resolves when connection is closed
   */
  close(): Promise<void>
}
