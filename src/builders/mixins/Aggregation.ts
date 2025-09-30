import type {
  QuerySelect,
  QueryAggregationExpression,
  QueryAggregationFunction,
  QueryDirectionType
} from '@interfaces/index'

/**
 * Helper class for aggregation operations.
 * @description Provides reusable aggregation functionality for query builders.
 */
export class AggregationMixin {
  /**
   * Adds an aggregation expression to the query.
   * @param query - Query object to modify
   * @param func - Aggregation function
   * @param column - Column to aggregate
   * @param alias - Optional alias for the aggregation
   * @param options - Optional aggregation options
   */
  static addAggregation(
    query: QuerySelect,
    func: QueryAggregationFunction,
    column: string,
    alias?: string,
    options?: {
      distinct?: boolean
      orderBy?: { column: string; direction: QueryDirectionType }[]
      separator?: string
      percentile?: number
    }
  ): void {
    query.aggregations ??= []
    const aggregation: QueryAggregationExpression = {
      function: func,
      column,
      ...alias != null && { alias },
      ...options?.distinct !== undefined && { distinct: options.distinct },
      ...options?.orderBy != null && { orderBy: options.orderBy },
      ...options?.separator != null && { separator: options.separator },
      ...options?.percentile != null && { percentile: options.percentile }
    }
    query.aggregations.push(aggregation)
  }

  /**
   * Adds a COUNT aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to count (use '*' for all rows)
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to count distinct values
   */
  static addCount(
    query: QuerySelect,
    column: string = '*',
    alias?: string,
    distinct?: boolean
  ): void {
    this.addAggregation(query, 'COUNT', column, alias, distinct != null ? { distinct } : undefined)
  }

  /**
   * Adds a SUM aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to sum
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to sum distinct values
   */
  static addSum(query: QuerySelect, column: string, alias?: string, distinct?: boolean): void {
    this.addAggregation(query, 'SUM', column, alias, distinct != null ? { distinct } : undefined)
  }

  /**
   * Adds an AVG aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to average
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to average distinct values
   */
  static addAvg(query: QuerySelect, column: string, alias?: string, distinct?: boolean): void {
    this.addAggregation(query, 'AVG', column, alias, distinct != null ? { distinct } : undefined)
  }

  /**
   * Adds a MAX aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to find maximum of
   * @param alias - Optional alias for the aggregation
   */
  static addMax(query: QuerySelect, column: string, alias?: string): void {
    this.addAggregation(query, 'MAX', column, alias)
  }

  /**
   * Adds a MIN aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to find minimum of
   * @param alias - Optional alias for the aggregation
   */
  static addMin(query: QuerySelect, column: string, alias?: string): void {
    this.addAggregation(query, 'MIN', column, alias)
  }

  /**
   * Adds a STDDEV aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to calculate standard deviation of
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to calculate standard deviation of distinct values
   */
  static addStdDev(query: QuerySelect, column: string, alias?: string, distinct?: boolean): void {
    this.addAggregation(query, 'STDDEV', column, alias, distinct != null ? { distinct } : undefined)
  }

  /**
   * Adds a VARIANCE aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to calculate variance of
   * @param alias - Optional alias for the aggregation
   * @param distinct - Whether to calculate variance of distinct values
   */
  static addVariance(query: QuerySelect, column: string, alias?: string, distinct?: boolean): void {
    this.addAggregation(
      query,
      'VARIANCE',
      column,
      alias,
      distinct != null ? { distinct } : undefined
    )
  }

  /**
   * Adds a PERCENTILE_CONT aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to calculate percentile of
   * @param percentile - Percentile value (0-1)
   * @param alias - Optional alias for the aggregation
   */
  static addPercentileCont(
    query: QuerySelect,
    column: string,
    percentile: number,
    alias?: string
  ): void {
    this.addAggregation(query, 'PERCENTILE_CONT', column, alias, { percentile })
  }

  /**
   * Adds a GROUP_CONCAT aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to concatenate
   * @param alias - Optional alias for the aggregation
   * @param separator - Optional separator for concatenation
   * @param orderBy - Optional ordering for concatenation
   * @param distinct - Whether to concatenate distinct values
   */
  static addGroupConcat(
    query: QuerySelect,
    column: string,
    alias?: string,
    separator?: string,
    orderBy?: { column: string; direction: QueryDirectionType }[],
    distinct?: boolean
  ): void {
    this.addAggregation(query, 'GROUP_CONCAT', column, alias, {
      ...distinct != null && { distinct },
      ...orderBy != null && { orderBy },
      ...separator != null && { separator }
    })
  }

  /**
   * Adds a STRING_AGG aggregation to the query (PostgreSQL).
   * @param query - Query object to modify
   * @param column - Column to aggregate
   * @param alias - Optional alias for the aggregation
   * @param separator - Optional separator for aggregation
   * @param orderBy - Optional ordering for aggregation
   * @param distinct - Whether to aggregate distinct values
   */
  static addStringAgg(
    query: QuerySelect,
    column: string,
    alias?: string,
    separator?: string,
    orderBy?: { column: string; direction: QueryDirectionType }[],
    distinct?: boolean
  ): void {
    this.addAggregation(query, 'STRING_AGG', column, alias, {
      ...distinct != null && { distinct },
      ...orderBy != null && { orderBy },
      ...separator != null && { separator }
    })
  }

  /**
   * Adds an ARRAY_AGG aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to aggregate into array
   * @param alias - Optional alias for the aggregation
   * @param orderBy - Optional ordering for aggregation
   * @param distinct - Whether to aggregate distinct values
   */
  static addArrayAgg(
    query: QuerySelect,
    column: string,
    alias?: string,
    orderBy?: { column: string; direction: QueryDirectionType }[],
    distinct?: boolean
  ): void {
    this.addAggregation(query, 'ARRAY_AGG', column, alias, {
      ...distinct != null && { distinct },
      ...orderBy != null && { orderBy }
    })
  }

  /**
   * Adds a JSON_AGG aggregation to the query.
   * @param query - Query object to modify
   * @param column - Column to aggregate into JSON array
   * @param alias - Optional alias for the aggregation
   * @param orderBy - Optional ordering for aggregation
   * @param distinct - Whether to aggregate distinct values
   */
  static addJsonAgg(
    query: QuerySelect,
    column: string,
    alias?: string,
    orderBy?: { column: string; direction: QueryDirectionType }[],
    distinct?: boolean
  ): void {
    this.addAggregation(query, 'JSON_AGG', column, alias, {
      ...distinct != null && { distinct },
      ...orderBy != null && { orderBy }
    })
  }
}
