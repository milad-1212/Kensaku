import type { ConnectionBase, DatabaseQueryResult, QueryBuilder } from '@interfaces/index'
import { Connection as ConnectionManager } from '@core/index'
import { SelectBuilder, InsertBuilder, UpdateBuilder, DeleteBuilder } from '@builders/index'

/**
 * Query engine that creates and manages query builders.
 * @description Provides factory methods for creating different types of query builders.
 */
export class QueryEngine {
  /** Database connection manager instance */
  private readonly connectionManager: ConnectionManager

  /**
   * Creates a new QueryEngine instance.
   * @param connectionManager - Database connection manager
   */
  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager
  }

  /**
   * Creates a new SELECT query builder.
   * @param columns - Optional columns to select
   * @returns A new SelectBuilder instance
   */
  select(...columns: string[]): SelectBuilder {
    const builder: SelectBuilder = new SelectBuilder(this.connectionManager)
    if (columns.length > 0) {
      builder.select(...columns)
    }
    return builder
  }

  /**
   * Creates a new INSERT query builder.
   * @returns A new InsertBuilder instance
   */
  insert(): InsertBuilder {
    return new InsertBuilder(this.connectionManager)
  }

  /**
   * Creates a new UPDATE query builder.
   * @returns A new UpdateBuilder instance
   */
  update(): UpdateBuilder {
    return new UpdateBuilder(this.connectionManager)
  }

  /**
   * Creates a new DELETE query builder.
   * @returns A new DeleteBuilder instance
   */
  delete(): DeleteBuilder {
    return new DeleteBuilder(this.connectionManager)
  }

  /**
   * Creates a new query builder (alias for select).
   * @returns A new SelectBuilder instance
   */
  createQuery(): QueryBuilder {
    return new SelectBuilder(this.connectionManager)
  }

  /**
   * Executes a raw SQL query.
   * @param sql - The raw SQL query string
   * @param params - Optional array of parameters for the query
   * @returns Promise that resolves to an array of query results
   */
  async raw(sql: string, params?: unknown[]): Promise<unknown[]> {
    const connection: ConnectionBase = await this.connectionManager.getConnection()
    try {
      const result: DatabaseQueryResult = await connection.query(sql, params ?? [])
      return result.rows
    } finally {
      await this.connectionManager.releaseConnection(connection)
    }
  }
}
