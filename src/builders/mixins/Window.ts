import type { QuerySelect, QueryWindowSpec } from '@interfaces/index'
import { errorMessages } from '@constants/index'

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

  /**
   * Adds a FIRST_VALUE() window function to the query.
   * @param query - Query object to modify
   * @param column - Column to get first value of
   * @param over - Window specification
   */
  static addFirstValue(query: QuerySelect, column: string, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'FIRST_VALUE',
      args: [column],
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds a LAST_VALUE() window function to the query.
   * @param query - Query object to modify
   * @param column - Column to get last value of
   * @param over - Window specification
   */
  static addLastValue(query: QuerySelect, column: string, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'LAST_VALUE',
      args: [column],
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds an NTILE() window function to the query.
   * @param query - Query object to modify
   * @param buckets - Number of buckets to divide rows into
   * @param over - Window specification
   */
  static addNtile(query: QuerySelect, buckets: number, over?: QueryWindowSpec): void {
    if (buckets <= 0) {
      throw new Error(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE)
    }
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'NTILE',
      args: [buckets.toString()],
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds a CUME_DIST() window function to the query.
   * @param query - Query object to modify
   * @param over - Window specification
   */
  static addCumeDist(query: QuerySelect, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'CUME_DIST',
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds a PERCENT_RANK() window function to the query.
   * @param query - Query object to modify
   * @param over - Window specification
   */
  static addPercentRank(query: QuerySelect, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'PERCENT_RANK',
      ...over !== undefined && { over }
    })
  }

  /**
   * Adds an NTH_VALUE() window function to the query.
   * @param query - Query object to modify
   * @param column - Column to get nth value of
   * @param n - Position of the value to return
   * @param over - Window specification
   */
  static addNthValue(query: QuerySelect, column: string, n: number, over?: QueryWindowSpec): void {
    query.windowFunctions ??= []
    query.windowFunctions.push({
      function: 'NTH_VALUE',
      args: [column, n.toString()],
      ...over !== undefined && { over }
    })
  }
}
