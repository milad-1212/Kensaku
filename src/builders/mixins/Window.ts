import type { QuerySelect, QueryWindowSpec } from '@interfaces/index'

/**
 * Helper class for window function operations.
 * @description Provides reusable window function functionality for query builders.
 */
export class WindowMixin {
  /**
   * Adds a ROW_NUMBER() window function to the query.
   * @param query - Query object to modify
   * @param over - Window specification
   */
  static addRowNumber(query: QuerySelect, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'ROW_NUMBER',
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds a RANK() window function to the query.
   * @param query - Query object to modify
   * @param over - Window specification
   */
  static addRank(query: QuerySelect, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'RANK',
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds a DENSE_RANK() window function to the query.
   * @param query - Query object to modify
   * @param over - Window specification
   */
  static addDenseRank(query: QuerySelect, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'DENSE_RANK',
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds a LAG() window function to the query.
   * @param query - Query object to modify
   * @param column - Column to lag
   * @param offset - Offset value
   * @param over - Window specification
   */
  static addLag(
    query: QuerySelect,
    column: string,
    offset: number = 1,
    over?: QueryWindowSpec
  ): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'LAG',
      args: [column, offset.toString()],
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds a LEAD() window function to the query.
   * @param query - Query object to modify
   * @param column - Column to lead
   * @param offset - Offset value
   * @param over - Window specification
   */
  static addLead(
    query: QuerySelect,
    column: string,
    offset: number = 1,
    over?: QueryWindowSpec
  ): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'LEAD',
      args: [column, offset.toString()],
      ...over !== undefined && { over }
    })
  }
}
