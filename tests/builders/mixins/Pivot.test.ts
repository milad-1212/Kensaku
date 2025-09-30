import { PivotMixin } from '@builders/mixins/index'
import type { QuerySelect } from '@interfaces/index'

describe('PivotMixin', () => {
  let mockQuery: QuerySelect

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'sales'
    }
  })

  describe('addPivot', () => {
    it('should add PIVOT clause with basic parameters', () => {
      const values = ['Q1', 'Q2', 'Q3', 'Q4']
      const aggregate = 'SUM(amount)'

      PivotMixin.addPivot(mockQuery, 'quarter', values, aggregate, 'quarterly_sales')

      expect(mockQuery.pivot).toEqual({
        column: 'quarter',
        values,
        aggregate,
        alias: 'quarterly_sales'
      })
    })

    it('should add PIVOT clause without alias', () => {
      const values = ['Active', 'Inactive']
      const aggregate = 'COUNT(*)'

      PivotMixin.addPivot(mockQuery, 'status', values, aggregate)

      expect(mockQuery.pivot).toEqual({
        column: 'status',
        values,
        aggregate
      })
    })

    it('should handle single value pivot', () => {
      const values = ['Premium']
      const aggregate = 'AVG(price)'

      PivotMixin.addPivot(mockQuery, 'tier', values, aggregate, 'premium_avg_price')

      expect(mockQuery.pivot).toEqual({
        column: 'tier',
        values,
        aggregate,
        alias: 'premium_avg_price'
      })
    })

    it('should handle multiple values pivot', () => {
      const values = ['North', 'South', 'East', 'West', 'Central']
      const aggregate = 'SUM(revenue)'

      PivotMixin.addPivot(mockQuery, 'region', values, aggregate, 'regional_revenue')

      expect(mockQuery.pivot).toEqual({
        column: 'region',
        values,
        aggregate,
        alias: 'regional_revenue'
      })
    })

    it('should handle complex aggregate functions', () => {
      const values = ['2023', '2024']
      const aggregate = 'SUM(CASE WHEN amount > 1000 THEN amount ELSE 0 END)'

      PivotMixin.addPivot(mockQuery, 'year', values, aggregate, 'high_value_sales')

      expect(mockQuery.pivot).toEqual({
        column: 'year',
        values,
        aggregate,
        alias: 'high_value_sales'
      })
    })

    it('should overwrite existing pivot', () => {
      const values1 = ['A', 'B']
      const values2 = ['X', 'Y', 'Z']
      const aggregate1 = 'COUNT(*)'
      const aggregate2 = 'SUM(value)'

      PivotMixin.addPivot(mockQuery, 'category', values1, aggregate1, 'first_pivot')
      PivotMixin.addPivot(mockQuery, 'type', values2, aggregate2, 'second_pivot')

      expect(mockQuery.pivot).toEqual({
        column: 'type',
        values: values2,
        aggregate: aggregate2,
        alias: 'second_pivot'
      })
    })
  })

  describe('addUnpivot', () => {
    it('should add UNPIVOT clause with basic parameters', () => {
      const columns = ['jan_sales', 'feb_sales', 'mar_sales']
      const valueColumn = 'monthly_sales'
      const nameColumn = 'month'

      PivotMixin.addUnpivot(mockQuery, columns, valueColumn, nameColumn)

      expect(mockQuery.unpivot).toEqual({
        columns,
        valueColumn,
        nameColumn
      })
    })

    it('should handle single column unpivot', () => {
      const columns = ['single_column']
      const valueColumn = 'value'
      const nameColumn = 'column_name'

      PivotMixin.addUnpivot(mockQuery, columns, valueColumn, nameColumn)

      expect(mockQuery.unpivot).toEqual({
        columns,
        valueColumn,
        nameColumn
      })
    })

    it('should handle multiple columns unpivot', () => {
      const columns = ['q1_revenue', 'q2_revenue', 'q3_revenue', 'q4_revenue']
      const valueColumn = 'quarterly_revenue'
      const nameColumn = 'quarter'

      PivotMixin.addUnpivot(mockQuery, columns, valueColumn, nameColumn)

      expect(mockQuery.unpivot).toEqual({
        columns,
        valueColumn,
        nameColumn
      })
    })

    it('should handle columns with schema prefixes', () => {
      const columns = ['public.q1_data', 'public.q2_data', 'public.q3_data']
      const valueColumn = 'quarterly_data'
      const nameColumn = 'quarter'

      PivotMixin.addUnpivot(mockQuery, columns, valueColumn, nameColumn)

      expect(mockQuery.unpivot).toEqual({
        columns,
        valueColumn,
        nameColumn
      })
    })

    it('should overwrite existing unpivot', () => {
      const columns1 = ['col1', 'col2']
      const columns2 = ['col3', 'col4', 'col5']
      const valueColumn1 = 'value1'
      const valueColumn2 = 'value2'
      const nameColumn1 = 'name1'
      const nameColumn2 = 'name2'

      PivotMixin.addUnpivot(mockQuery, columns1, valueColumn1, nameColumn1)
      PivotMixin.addUnpivot(mockQuery, columns2, valueColumn2, nameColumn2)

      expect(mockQuery.unpivot).toEqual({
        columns: columns2,
        valueColumn: valueColumn2,
        nameColumn: nameColumn2
      })
    })
  })

  describe('addOrdinality', () => {
    it('should add WITH ORDINALITY clause', () => {
      const valueColumn = 'item_value'
      const ordinalityColumn = 'item_order'

      PivotMixin.addOrdinality(mockQuery, valueColumn, ordinalityColumn)

      expect(mockQuery.ordinality).toEqual({
        valueColumn,
        ordinalityColumn
      })
    })

    it('should handle descriptive column names', () => {
      const valueColumn = 'product_name'
      const ordinalityColumn = 'product_rank'

      PivotMixin.addOrdinality(mockQuery, valueColumn, ordinalityColumn)

      expect(mockQuery.ordinality).toEqual({
        valueColumn,
        ordinalityColumn
      })
    })

    it('should handle short column names', () => {
      const valueColumn = 'val'
      const ordinalityColumn = 'ord'

      PivotMixin.addOrdinality(mockQuery, valueColumn, ordinalityColumn)

      expect(mockQuery.ordinality).toEqual({
        valueColumn,
        ordinalityColumn
      })
    })

    it('should overwrite existing ordinality', () => {
      const valueColumn1 = 'value1'
      const valueColumn2 = 'value2'
      const ordinalityColumn1 = 'order1'
      const ordinalityColumn2 = 'order2'

      PivotMixin.addOrdinality(mockQuery, valueColumn1, ordinalityColumn1)
      PivotMixin.addOrdinality(mockQuery, valueColumn2, ordinalityColumn2)

      expect(mockQuery.ordinality).toEqual({
        valueColumn: valueColumn2,
        ordinalityColumn: ordinalityColumn2
      })
    })
  })

  describe('mixed operations', () => {
    it('should handle pivot and unpivot operations independently', () => {
      const pivotValues = ['Q1', 'Q2']
      const pivotAggregate = 'SUM(amount)'
      const unpivotColumns = ['jan', 'feb']
      const unpivotValueColumn = 'monthly_value'
      const unpivotNameColumn = 'month'

      PivotMixin.addPivot(mockQuery, 'quarter', pivotValues, pivotAggregate, 'quarterly')
      PivotMixin.addUnpivot(mockQuery, unpivotColumns, unpivotValueColumn, unpivotNameColumn)

      expect(mockQuery.pivot).toEqual({
        column: 'quarter',
        values: pivotValues,
        aggregate: pivotAggregate,
        alias: 'quarterly'
      })
      expect(mockQuery.unpivot).toEqual({
        columns: unpivotColumns,
        valueColumn: unpivotValueColumn,
        nameColumn: unpivotNameColumn
      })
    })

    it('should handle pivot and ordinality operations independently', () => {
      const pivotValues = ['Active', 'Inactive']
      const pivotAggregate = 'COUNT(*)'
      const ordinalityValueColumn = 'status_value'
      const ordinalityOrdinalityColumn = 'status_order'

      PivotMixin.addPivot(mockQuery, 'status', pivotValues, pivotAggregate, 'status_counts')
      PivotMixin.addOrdinality(mockQuery, ordinalityValueColumn, ordinalityOrdinalityColumn)

      expect(mockQuery.pivot).toEqual({
        column: 'status',
        values: pivotValues,
        aggregate: pivotAggregate,
        alias: 'status_counts'
      })
      expect(mockQuery.ordinality).toEqual({
        valueColumn: ordinalityValueColumn,
        ordinalityColumn: ordinalityOrdinalityColumn
      })
    })

    it('should handle unpivot and ordinality operations independently', () => {
      const unpivotColumns = ['col1', 'col2', 'col3']
      const unpivotValueColumn = 'unpivot_value'
      const unpivotNameColumn = 'unpivot_name'
      const ordinalityValueColumn = 'ordinality_value'
      const ordinalityOrdinalityColumn = 'ordinality_order'

      PivotMixin.addUnpivot(mockQuery, unpivotColumns, unpivotValueColumn, unpivotNameColumn)
      PivotMixin.addOrdinality(mockQuery, ordinalityValueColumn, ordinalityOrdinalityColumn)

      expect(mockQuery.unpivot).toEqual({
        columns: unpivotColumns,
        valueColumn: unpivotValueColumn,
        nameColumn: unpivotNameColumn
      })
      expect(mockQuery.ordinality).toEqual({
        valueColumn: ordinalityValueColumn,
        ordinalityColumn: ordinalityOrdinalityColumn
      })
    })

    it('should handle all three operations independently', () => {
      const pivotValues = ['A', 'B', 'C']
      const pivotAggregate = 'AVG(score)'
      const unpivotColumns = ['x', 'y', 'z']
      const unpivotValueColumn = 'coordinate_value'
      const unpivotNameColumn = 'coordinate_name'
      const ordinalityValueColumn = 'item_value'
      const ordinalityOrdinalityColumn = 'item_order'

      PivotMixin.addPivot(mockQuery, 'category', pivotValues, pivotAggregate, 'category_avg')
      PivotMixin.addUnpivot(mockQuery, unpivotColumns, unpivotValueColumn, unpivotNameColumn)
      PivotMixin.addOrdinality(mockQuery, ordinalityValueColumn, ordinalityOrdinalityColumn)

      expect(mockQuery.pivot).toEqual({
        column: 'category',
        values: pivotValues,
        aggregate: pivotAggregate,
        alias: 'category_avg'
      })
      expect(mockQuery.unpivot).toEqual({
        columns: unpivotColumns,
        valueColumn: unpivotValueColumn,
        nameColumn: unpivotNameColumn
      })
      expect(mockQuery.ordinality).toEqual({
        valueColumn: ordinalityValueColumn,
        ordinalityColumn: ordinalityOrdinalityColumn
      })
    })
  })
})
