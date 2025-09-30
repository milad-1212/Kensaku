import type { QueryUpdate } from '@interfaces/index'

/**
 * Mixin for UPDATE query operations.
 * @description Provides static helper methods for building UPDATE SQL queries.
 */
export class UpdateMixin {
  /**
   * Sets the target table for UPDATE operation.
   * @param query - Query object to modify
   * @param table - Table name
   */
  static setUpdateTable(query: QueryUpdate, table: string): void {
    query.table = table
  }

  /**
   * Sets the data to update.
   * @param query - Query object to modify
   * @param data - Data to update as key-value pairs
   */
  static setUpdateData(query: QueryUpdate, data: Record<string, unknown>): void {
    query.set = data
  }

  /**
   * Builds the UPDATE clause.
   * @param query - Query object
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @returns UPDATE clause string
   */
  static buildUpdateClause(
    query: QueryUpdate,
    escapeIdentifier: (identifier: string) => string
  ): string {
    return `UPDATE ${escapeIdentifier(query.table)}`
  }

  /**
   * Builds the SET clause.
   * @param query - Query object
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @param addParam - Function to add parameters and get placeholder
   * @returns SET clause string
   */
  static buildSetClause(
    query: QueryUpdate,
    escapeIdentifier: (identifier: string) => string,
    addParam: (value: unknown) => string
  ): string {
    const setClauses: string[] = Object.entries(query.set).map(
      ([column, value]: [string, unknown]) => {
        const escapedColumn: string = escapeIdentifier(column)
        const param: string = addParam(value)
        return `${escapedColumn} = ${param}`
      }
    )
    return `SET ${setClauses.join(', ')}`
  }
}
