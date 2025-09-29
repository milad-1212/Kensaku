import type { QueryInsert } from '@interfaces/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'

/**
 * Query builder for INSERT operations with fluent interface.
 * @template T - Return type of query results
 */
export class InsertBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the INSERT query structure */
  private readonly query: QueryInsert = {} as QueryInsert

  /**
   * Specifies the table to insert into.
   * @param table - Table name
   * @returns This builder instance for method chaining
   */
  into(table: string): this {
    this.query.into = table
    return this
  }

  /**
   * Specifies the values to insert.
   * @param data - Data to insert as object or array of objects
   * @returns This builder instance for method chaining
   */
  values(data: Record<string, unknown> | Record<string, unknown>[]): this {
    this.query.values = data
    return this
  }

  /**
   * Specifies columns to return after insert.
   * @param columns - Columns to return
   * @returns This builder instance for method chaining
   */
  returning(columns: string | string[]): this {
    this.query.returning = Array.isArray(columns) ? columns : [columns]
    return this
  }

  /**
   * Builds the final SQL query and parameters.
   * @returns Object containing SQL string and parameters
   */
  protected buildQuery(): { sql: string; params: unknown[] } {
    QueryValidator.validateInsertQuery(this.query)
    const parts: string[] = []
    this.params = []
    parts.push('INSERT INTO', this.escapeIdentifier(this.query.into))
    if (Array.isArray(this.query.values) && this.query.values.length > 0) {
      const columns: string[] = Object.keys(this.query.values[0] as Record<string, unknown>)
      const columnList: string = columns.map((col: string) => this.escapeIdentifier(col)).join(', ')
      parts.push(`(${columnList})`)
      const valueRows: string[] = this.query.values.map((row: Record<string, unknown>) => {
        const values: string = columns.map((col: string) => this.addParam(row[col])).join(', ')
        return `(${values})`
      })
      parts.push('VALUES', valueRows.join(', '))
    } else if (this.query.values != null && !Array.isArray(this.query.values)) {
      const columns: string[] = Object.keys(this.query.values)
      const columnList: string = columns.map((col: string) => this.escapeIdentifier(col)).join(', ')
      const values: string = columns
        .map((col: string) => this.addParam((this.query.values as Record<string, unknown>)[col]))
        .join(', ')
      parts.push(`(${columnList})`, 'VALUES', `(${values})`)
    }
    if (this.query.returning !== undefined && this.query.returning.length > 0) {
      const columns: string = this.query.returning
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push('RETURNING', columns)
    }
    return {
      sql: parts.join(' '),
      params: this.params
    }
  }
}
