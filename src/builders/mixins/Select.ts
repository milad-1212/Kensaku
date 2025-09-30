import type {
  QuerySelect,
  QuerySubQuery,
  QueryOrderClause,
  QueryDirectionType
} from '@interfaces/index'
import { errorMessages } from '@constants/index'

/**
 * Helper class for SELECT query operations.
 * @description Provides reusable SELECT functionality for query builders.
 */
export class SelectMixin {
  /**
   * Sets columns to select from the table.
   * @param query - Query object to modify
   * @param columns - Column names as individual parameters
   */
  static setColumns(query: QuerySelect, ...columns: string[]): void {
    query.columns = columns
  }

  /**
   * Sets query to select all columns.
   * @param query - Query object to modify
   */
  static setSelectAll(query: QuerySelect): void {
    query.columns = ['*']
  }

  /**
   * Adds DISTINCT clause to the query.
   * @param query - Query object to modify
   */
  static setDistinct(query: QuerySelect): void {
    query.distinct = true
  }

  /**
   * Sets the table to select from.
   * @param query - Query object to modify
   * @param table - Table name or subquery
   * @throws {Error} When table name is empty or subquery is invalid
   */
  static setFrom(query: QuerySelect, table: string | QuerySubQuery): void {
    if (typeof table === 'string') {
      if (!table || table.trim() === '') {
        throw new Error(errorMessages.VALIDATION.EMPTY_TABLE)
      }
      query.from = table
    } else {
      if (!table?.query) {
        throw new Error(errorMessages.VALIDATION.EMPTY_SUBQUERY)
      }
      query.from = table
    }
  }

  /**
   * Sets GROUP BY columns for the query.
   * @param query - Query object to modify
   * @param columns - Columns to group by
   */
  static setGroupBy(query: QuerySelect, columns: string | string[]): void {
    query.groupBy = Array.isArray(columns) ? columns : [columns]
  }

  /**
   * Adds an ORDER BY clause to the query.
   * @param query - Query object to modify
   * @param column - Column to order by
   * @param direction - Sort direction
   */
  static addOrderBy(
    query: QuerySelect,
    column: string,
    direction: QueryDirectionType = 'ASC'
  ): void {
    query.orderBy ??= []
    query.orderBy.push({
      column,
      direction
    })
  }

  /**
   * Adds an ORDER BY expression to the query.
   * @param query - Query object to modify
   * @param expression - SQL expression to order by
   * @param direction - Sort direction
   * @param params - Parameters for the expression
   */
  static addOrderByExpression(
    query: QuerySelect,
    expression: string,
    direction: QueryDirectionType = 'ASC',
    params?: unknown[]
  ): void {
    query.orderBy ??= []
    const orderClause: QueryOrderClause = {
      column: expression,
      direction,
      isExpression: true
    }
    if (params !== undefined) {
      orderClause.params = params
    }
    query.orderBy.push(orderClause)
  }

  /**
   * Sets LIMIT for the query.
   * @param query - Query object to modify
   * @param count - Number of rows to limit
   */
  static setLimit(query: QuerySelect, count: number): void {
    query.limit = count
  }

  /**
   * Sets OFFSET for the query.
   * @param query - Query object to modify
   * @param count - Number of rows to skip
   */
  static setOffset(query: QuerySelect, count: number): void {
    query.offset = count
  }

  /**
   * Sets raw LIMIT expression for the query.
   * @param query - Query object to modify
   * @param sql - Raw SQL expression
   * @param params - Parameters for the SQL expression
   */
  static setLimitRaw(query: QuerySelect, sql: string, params?: unknown[]): void {
    query.limitRaw = {
      sql,
      params: params ?? []
    }
  }

  /**
   * Sets raw OFFSET expression for the query.
   * @param query - Query object to modify
   * @param sql - Raw SQL expression
   * @param params - Parameters for the SQL expression
   */
  static setOffsetRaw(query: QuerySelect, sql: string, params?: unknown[]): void {
    query.offsetRaw = {
      sql,
      params: params ?? []
    }
  }
}
