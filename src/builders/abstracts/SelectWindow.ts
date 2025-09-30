import type { QueryWindowSpec } from '@interfaces/index'
import { SelectSortingBuilder } from '@builders/abstracts/SelectSorting'
import { WindowMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'

/**
 * Abstract class for SELECT query building with window functions.
 * @description Extends SelectSortingBuilder with window function functionality.
 * @template T - Return type of query results
 */
export abstract class SelectWindowBuilder<T = unknown> extends SelectSortingBuilder<T> {
  /**
   * Adds a ROW_NUMBER() window function to the query.
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  rowNumber(over?: QueryWindowSpec): this {
    WindowMixin.addRowNumber(this.query, over)
    return this
  }

  /**
   * Adds a RANK() window function to the query.
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  rank(over?: QueryWindowSpec): this {
    WindowMixin.addRank(this.query, over)
    return this
  }

  /**
   * Adds a DENSE_RANK() window function to the query.
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  denseRank(over?: QueryWindowSpec): this {
    WindowMixin.addDenseRank(this.query, over)
    return this
  }

  /**
   * Adds a LAG() window function to the query.
   * @param column - Column to lag
   * @param offset - Number of rows to lag
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  lag(column: string, offset: number = 1, over?: QueryWindowSpec): this {
    WindowMixin.addLag(this.query, column, offset, over)
    return this
  }

  /**
   * Adds a LEAD() window function to the query.
   * @param column - Column to lead
   * @param offset - Number of rows to lead
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  lead(column: string, offset: number = 1, over?: QueryWindowSpec): this {
    WindowMixin.addLead(this.query, column, offset, over)
    return this
  }

  /**
   * Adds a FIRST_VALUE() window function to the query.
   * @param column - Column to get first value of
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  firstValue(column: string, over?: QueryWindowSpec): this {
    WindowMixin.addFirstValue(this.query, column, over)
    return this
  }

  /**
   * Adds a LAST_VALUE() window function to the query.
   * @param column - Column to get last value of
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  lastValue(column: string, over?: QueryWindowSpec): this {
    WindowMixin.addLastValue(this.query, column, over)
    return this
  }

  /**
   * Adds an NTILE() window function to the query.
   * @param buckets - Number of buckets to divide rows into
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  ntile(buckets: number, over?: QueryWindowSpec): this {
    if (buckets <= 0) {
      throw new Error(errorMessages.WINDOW.NTILE_REQUIRES_POSITIVE)
    }
    WindowMixin.addNtile(this.query, buckets, over)
    return this
  }

  /**
   * Adds a CUME_DIST() window function to the query.
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  cumeDist(over?: QueryWindowSpec): this {
    WindowMixin.addCumeDist(this.query, over)
    return this
  }

  /**
   * Adds a PERCENT_RANK() window function to the query.
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  percentRank(over?: QueryWindowSpec): this {
    WindowMixin.addPercentRank(this.query, over)
    return this
  }

  /**
   * Adds an NTH_VALUE() window function to the query.
   * @param column - Column to get nth value of
   * @param n - Position of the value to return
   * @param over - Optional window specification
   * @returns This builder instance for method chaining
   */
  nthValue(column: string, n: number, over?: QueryWindowSpec): this {
    WindowMixin.addNthValue(this.query, column, n, over)
    return this
  }
}
