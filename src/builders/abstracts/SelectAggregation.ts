import type { QueryAggregationFunction, QueryDirectionType } from '@interfaces/index'
import { SelectWindowBuilder } from '@builders/abstracts/SelectWindow'
import { AggregationMixin } from '@builders/mixins/index'

/**
 * Abstract class for SELECT query building with aggregation functions.
 * @description Extends SelectWindowBuilder with aggregation functionality.
 * @template T - Return type of query results
 */
export abstract class SelectAggregationBuilder<T = unknown> extends SelectWindowBuilder<T> {
  /**
   * Adds an aggregation function to the query.
   * @param func - Aggregation function
   * @param column - Column to aggregate
   * @param alias - Optional alias for the aggregation
   * @param options - Optional aggregation options
   * @returns This builder instance for method chaining
   */
  aggregate(
    func: QueryAggregationFunction,
    column: string,
    alias?: string,
    options?: {
      distinct?: boolean
      orderBy?: { column: string; direction: QueryDirectionType }[]
      separator?: string
      percentile?: number
    }
  ): this {
    AggregationMixin.addAggregation(this.query, func, column, alias, options)
    return this
  }
}
