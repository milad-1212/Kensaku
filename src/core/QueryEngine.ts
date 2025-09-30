import type { QueryBuilder } from '@interfaces/index'
import { Connection as ConnectionManager } from '@core/index'
import {
  SelectBuilder,
  InsertBuilder,
  UpdateBuilder,
  DeleteBuilder,
  MergeBuilder
} from '@builders/index'

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
   * Creates a new MERGE query builder.
   * @returns A new MergeBuilder instance
   */
  merge(): MergeBuilder {
    return new MergeBuilder(this.connectionManager)
  }
}
