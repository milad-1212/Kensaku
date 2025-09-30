import { AggregationMixin } from '@builders/mixins/index'
import type { QuerySelect, QueryAggregationExpression } from '@interfaces/index'

describe('AggregationMixin', () => {
  let mockQuery: QuerySelect

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'users'
    }
  })

  describe('addAggregation', () => {
    it('should add basic aggregation without options', () => {
      AggregationMixin.addAggregation(mockQuery, 'COUNT', 'id', 'user_count')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'COUNT',
        column: 'id',
        alias: 'user_count'
      })
    })

    it('should add aggregation with distinct option', () => {
      AggregationMixin.addAggregation(mockQuery, 'SUM', 'amount', 'total_amount', {
        distinct: true
      })

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'SUM',
        column: 'amount',
        alias: 'total_amount',
        distinct: true
      })
    })

    it('should add aggregation with orderBy option', () => {
      const orderBy = [{ column: 'created_at', direction: 'ASC' as const }]
      AggregationMixin.addAggregation(mockQuery, 'STRING_AGG', 'name', 'names', { orderBy })

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STRING_AGG',
        column: 'name',
        alias: 'names',
        orderBy
      })
    })

    it('should add aggregation with separator option', () => {
      AggregationMixin.addAggregation(mockQuery, 'GROUP_CONCAT', 'tag', 'tags', { separator: ', ' })

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'GROUP_CONCAT',
        column: 'tag',
        alias: 'tags',
        separator: ', '
      })
    })

    it('should add aggregation with percentile option', () => {
      AggregationMixin.addAggregation(mockQuery, 'PERCENTILE_CONT', 'score', 'median_score', {
        percentile: 0.5
      })

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'PERCENTILE_CONT',
        column: 'score',
        alias: 'median_score',
        percentile: 0.5
      })
    })

    it('should add aggregation with all options', () => {
      const orderBy = [{ column: 'created_at', direction: 'DESC' as const }]
      AggregationMixin.addAggregation(mockQuery, 'STRING_AGG', 'name', 'names', {
        distinct: true,
        orderBy,
        separator: ' | '
      })

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STRING_AGG',
        column: 'name',
        alias: 'names',
        distinct: true,
        orderBy,
        separator: ' | '
      })
    })

    it('should initialize aggregations array if undefined', () => {
      expect(mockQuery.aggregations).toBeUndefined()

      AggregationMixin.addAggregation(mockQuery, 'COUNT', 'id')

      expect(mockQuery.aggregations).toBeDefined()
      expect(mockQuery.aggregations).toHaveLength(1)
    })

    it('should append to existing aggregations array', () => {
      AggregationMixin.addAggregation(mockQuery, 'COUNT', 'id', 'count')
      AggregationMixin.addAggregation(mockQuery, 'SUM', 'amount', 'total')

      expect(mockQuery.aggregations).toHaveLength(2)
      expect(mockQuery.aggregations![0].function).toBe('COUNT')
      expect(mockQuery.aggregations![1].function).toBe('SUM')
    })
  })

  describe('addCount', () => {
    it('should add COUNT aggregation with default column', () => {
      AggregationMixin.addCount(mockQuery)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'COUNT',
        column: '*'
      })
    })

    it('should add COUNT aggregation with custom column', () => {
      AggregationMixin.addCount(mockQuery, 'user_id', 'user_count')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'COUNT',
        column: 'user_id',
        alias: 'user_count'
      })
    })

    it('should add COUNT aggregation with distinct', () => {
      AggregationMixin.addCount(mockQuery, 'email', 'unique_emails', true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'COUNT',
        column: 'email',
        alias: 'unique_emails',
        distinct: true
      })
    })
  })

  describe('addSum', () => {
    it('should add SUM aggregation', () => {
      AggregationMixin.addSum(mockQuery, 'amount', 'total_amount')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'SUM',
        column: 'amount',
        alias: 'total_amount'
      })
    })

    it('should add SUM aggregation with distinct', () => {
      AggregationMixin.addSum(mockQuery, 'price', 'unique_price_total', true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'SUM',
        column: 'price',
        alias: 'unique_price_total',
        distinct: true
      })
    })
  })

  describe('addAvg', () => {
    it('should add AVG aggregation', () => {
      AggregationMixin.addAvg(mockQuery, 'score', 'average_score')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'AVG',
        column: 'score',
        alias: 'average_score'
      })
    })

    it('should add AVG aggregation with distinct', () => {
      AggregationMixin.addAvg(mockQuery, 'rating', 'unique_rating_avg', true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'AVG',
        column: 'rating',
        alias: 'unique_rating_avg',
        distinct: true
      })
    })
  })

  describe('addMax', () => {
    it('should add MAX aggregation', () => {
      AggregationMixin.addMax(mockQuery, 'created_at', 'latest_date')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'MAX',
        column: 'created_at',
        alias: 'latest_date'
      })
    })
  })

  describe('addMin', () => {
    it('should add MIN aggregation', () => {
      AggregationMixin.addMin(mockQuery, 'price', 'lowest_price')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'MIN',
        column: 'price',
        alias: 'lowest_price'
      })
    })
  })

  describe('addStdDev', () => {
    it('should add STDDEV aggregation', () => {
      AggregationMixin.addStdDev(mockQuery, 'score', 'score_stddev')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STDDEV',
        column: 'score',
        alias: 'score_stddev'
      })
    })

    it('should add STDDEV aggregation with distinct', () => {
      AggregationMixin.addStdDev(mockQuery, 'value', 'unique_value_stddev', true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STDDEV',
        column: 'value',
        alias: 'unique_value_stddev',
        distinct: true
      })
    })
  })

  describe('addVariance', () => {
    it('should add VARIANCE aggregation', () => {
      AggregationMixin.addVariance(mockQuery, 'score', 'score_variance')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'VARIANCE',
        column: 'score',
        alias: 'score_variance'
      })
    })

    it('should add VARIANCE aggregation with distinct', () => {
      AggregationMixin.addVariance(mockQuery, 'value', 'unique_value_variance', true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'VARIANCE',
        column: 'value',
        alias: 'unique_value_variance',
        distinct: true
      })
    })
  })

  describe('addPercentileCont', () => {
    it('should add PERCENTILE_CONT aggregation', () => {
      AggregationMixin.addPercentileCont(mockQuery, 'score', 0.5, 'median_score')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'PERCENTILE_CONT',
        column: 'score',
        alias: 'median_score',
        percentile: 0.5
      })
    })
  })

  describe('addGroupConcat', () => {
    it('should add GROUP_CONCAT aggregation', () => {
      AggregationMixin.addGroupConcat(mockQuery, 'tag', 'tags')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'GROUP_CONCAT',
        column: 'tag',
        alias: 'tags'
      })
    })

    it('should add GROUP_CONCAT aggregation with separator', () => {
      AggregationMixin.addGroupConcat(mockQuery, 'name', 'names', ', ')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'GROUP_CONCAT',
        column: 'name',
        alias: 'names',
        separator: ', '
      })
    })

    it('should add GROUP_CONCAT aggregation with orderBy', () => {
      const orderBy = [{ column: 'created_at', direction: 'ASC' as const }]
      AggregationMixin.addGroupConcat(mockQuery, 'tag', 'tags', undefined, orderBy)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'GROUP_CONCAT',
        column: 'tag',
        alias: 'tags',
        orderBy
      })
    })

    it('should add GROUP_CONCAT aggregation with distinct', () => {
      AggregationMixin.addGroupConcat(
        mockQuery,
        'category',
        'categories',
        undefined,
        undefined,
        true
      )

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'GROUP_CONCAT',
        column: 'category',
        alias: 'categories',
        distinct: true
      })
    })

    it('should add GROUP_CONCAT aggregation with all options', () => {
      const orderBy = [{ column: 'name', direction: 'ASC' as const }]
      AggregationMixin.addGroupConcat(mockQuery, 'tag', 'tags', ' | ', orderBy, true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'GROUP_CONCAT',
        column: 'tag',
        alias: 'tags',
        separator: ' | ',
        orderBy,
        distinct: true
      })
    })
  })

  describe('addStringAgg', () => {
    it('should add STRING_AGG aggregation', () => {
      AggregationMixin.addStringAgg(mockQuery, 'name', 'names')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STRING_AGG',
        column: 'name',
        alias: 'names'
      })
    })

    it('should add STRING_AGG aggregation with separator', () => {
      AggregationMixin.addStringAgg(mockQuery, 'tag', 'tags', ', ')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STRING_AGG',
        column: 'tag',
        alias: 'tags',
        separator: ', '
      })
    })

    it('should add STRING_AGG aggregation with orderBy', () => {
      const orderBy = [{ column: 'created_at', direction: 'DESC' as const }]
      AggregationMixin.addStringAgg(mockQuery, 'name', 'names', undefined, orderBy)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STRING_AGG',
        column: 'name',
        alias: 'names',
        orderBy
      })
    })

    it('should add STRING_AGG aggregation with distinct', () => {
      AggregationMixin.addStringAgg(mockQuery, 'category', 'categories', undefined, undefined, true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STRING_AGG',
        column: 'category',
        alias: 'categories',
        distinct: true
      })
    })

    it('should add STRING_AGG aggregation with all options', () => {
      const orderBy = [{ column: 'name', direction: 'ASC' as const }]
      AggregationMixin.addStringAgg(mockQuery, 'tag', 'tags', ' | ', orderBy, true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'STRING_AGG',
        column: 'tag',
        alias: 'tags',
        separator: ' | ',
        orderBy,
        distinct: true
      })
    })
  })

  describe('addArrayAgg', () => {
    it('should add ARRAY_AGG aggregation', () => {
      AggregationMixin.addArrayAgg(mockQuery, 'value', 'values')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'ARRAY_AGG',
        column: 'value',
        alias: 'values'
      })
    })

    it('should add ARRAY_AGG aggregation with orderBy', () => {
      const orderBy = [{ column: 'created_at', direction: 'ASC' as const }]
      AggregationMixin.addArrayAgg(mockQuery, 'item', 'items', orderBy)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'ARRAY_AGG',
        column: 'item',
        alias: 'items',
        orderBy
      })
    })

    it('should add ARRAY_AGG aggregation with distinct', () => {
      AggregationMixin.addArrayAgg(mockQuery, 'category', 'categories', undefined, true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'ARRAY_AGG',
        column: 'category',
        alias: 'categories',
        distinct: true
      })
    })

    it('should add ARRAY_AGG aggregation with all options', () => {
      const orderBy = [{ column: 'name', direction: 'ASC' as const }]
      AggregationMixin.addArrayAgg(mockQuery, 'tag', 'tags', orderBy, true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'ARRAY_AGG',
        column: 'tag',
        alias: 'tags',
        orderBy,
        distinct: true
      })
    })
  })

  describe('addJsonAgg', () => {
    it('should add JSON_AGG aggregation', () => {
      AggregationMixin.addJsonAgg(mockQuery, 'data', 'json_data')

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'JSON_AGG',
        column: 'data',
        alias: 'json_data'
      })
    })

    it('should add JSON_AGG aggregation with orderBy', () => {
      const orderBy = [{ column: 'created_at', direction: 'ASC' as const }]
      AggregationMixin.addJsonAgg(mockQuery, 'item', 'json_items', orderBy)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'JSON_AGG',
        column: 'item',
        alias: 'json_items',
        orderBy
      })
    })

    it('should add JSON_AGG aggregation with distinct', () => {
      AggregationMixin.addJsonAgg(mockQuery, 'category', 'json_categories', undefined, true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'JSON_AGG',
        column: 'category',
        alias: 'json_categories',
        distinct: true
      })
    })

    it('should add JSON_AGG aggregation with all options', () => {
      const orderBy = [{ column: 'name', direction: 'ASC' as const }]
      AggregationMixin.addJsonAgg(mockQuery, 'tag', 'json_tags', orderBy, true)

      expect(mockQuery.aggregations).toHaveLength(1)
      expect(mockQuery.aggregations![0]).toEqual({
        function: 'JSON_AGG',
        column: 'tag',
        alias: 'json_tags',
        orderBy,
        distinct: true
      })
    })
  })
})
