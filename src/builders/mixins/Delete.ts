import type { QueryDelete } from '@interfaces/index'

/**
 * Mixin for DELETE query operations.
 * @description Provides static helper methods for building DELETE SQL queries.
 */
export class DeleteMixin {
  /**
   * Sets the target table for DELETE operation.
   * @param query - Query object to modify
   * @param table - Table name
   */
  static setDeleteFrom(query: QueryDelete, table: string): void {
    query.from = table
  }

  /**
   * Builds the DELETE FROM clause.
   * @param query - Query object
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @returns DELETE FROM clause string
   */
  static buildDeleteClause(
    query: QueryDelete,
    escapeIdentifier: (identifier: string) => string
  ): string {
    return `DELETE FROM ${escapeIdentifier(query.from)}`
  }
}
