import type { QueryInsert } from '@interfaces/index'

/**
 * Mixin for INSERT query operations.
 * @description Provides static helper methods for building INSERT SQL queries.
 */
export class InsertMixin {
  /**
   * Sets the target table for INSERT operation.
   * @param query - Query object to modify
   * @param table - Table name
   */
  static setIntoTable(query: QueryInsert, table: string): void {
    query.into = table
  }

  /**
   * Sets the values to insert.
   * @param query - Query object to modify
   * @param data - Data to insert as object or array of objects
   */
  static setValues(
    query: QueryInsert,
    data: Record<string, unknown> | Record<string, unknown>[]
  ): void {
    query.values = data
  }

  /**
   * Builds the INSERT INTO clause.
   * @param query - Query object
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @returns INSERT INTO clause string
   */
  static buildInsertClause(
    query: QueryInsert,
    escapeIdentifier: (identifier: string) => string
  ): string {
    return `INSERT INTO ${escapeIdentifier(query.into)}`
  }

  /**
   * Builds the VALUES clause for single row insert.
   * @param query - Query object
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @param addParam - Function to add parameters and get placeholder
   * @returns VALUES clause string
   */
  static buildSingleValuesClause(
    query: QueryInsert,
    escapeIdentifier: (identifier: string) => string,
    addParam: (value: unknown) => string
  ): string {
    if (query.values == null || Array.isArray(query.values)) {
      throw new Error('Expected single row values for single VALUES clause')
    }
    const columns: string[] = Object.keys(query.values)
    const columnList: string = columns.map((col: string) => escapeIdentifier(col)).join(', ')
    const values: string = columns
      .map((col: string) => addParam((query.values as Record<string, unknown>)[col]))
      .join(', ')
    return `(${columnList}) VALUES (${values})`
  }

  /**
   * Builds the VALUES clause for batch insert.
   * @param query - Query object
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @param addParam - Function to add parameters and get placeholder
   * @returns VALUES clause string
   */
  static buildBatchValuesClause(
    query: QueryInsert,
    escapeIdentifier: (identifier: string) => string,
    addParam: (value: unknown) => string
  ): string {
    if (!Array.isArray(query.values) || query.values.length === 0) {
      throw new Error('Expected array of values for batch VALUES clause')
    }
    const columns: string[] = Object.keys(query.values[0] as Record<string, unknown>)
    const columnList: string = columns.map((col: string) => escapeIdentifier(col)).join(', ')
    const valueRows: string[] = query.values.map((row: Record<string, unknown>) => {
      const values: string = columns.map((col: string) => addParam(row[col])).join(', ')
      return `(${values})`
    })
    return `(${columnList}) VALUES ${valueRows.join(', ')}`
  }

  /**
   * Builds the complete VALUES clause (handles both single and batch).
   * @param query - Query object
   * @param escapeIdentifier - Function to escape SQL identifiers
   * @param addParam - Function to add parameters and get placeholder
   * @returns VALUES clause string
   */
  static buildValuesClause(
    query: QueryInsert,
    escapeIdentifier: (identifier: string) => string,
    addParam: (value: unknown) => string
  ): string {
    if (Array.isArray(query.values) && query.values.length > 0) {
      return this.buildBatchValuesClause(query, escapeIdentifier, addParam)
    } else if (query.values != null && !Array.isArray(query.values)) {
      return this.buildSingleValuesClause(query, escapeIdentifier, addParam)
    }
    throw new Error('No values provided for INSERT query')
  }
}
