import type { QueryComparisonOperator } from '@interfaces/index'
import { SelectJoinBuilder } from '@builders/abstracts/SelectJoin'
import { SelectMixin, HavingMixin } from '@builders/mixins/index'

/**
 * Abstract class for SELECT query building with grouping functionality.
 * @description Extends SelectJoinBuilder with GROUP BY and HAVING functionality.
 * @template T - Return type of query results
 */
export abstract class SelectGroupingBuilder<T = unknown> extends SelectJoinBuilder<T> {
  /**
   * Adds a GROUP BY clause to the query.
   * @param columns - Columns to group by
   * @returns This builder instance for method chaining
   */
  groupBy(columns: string | string[]): this {
    SelectMixin.setGroupBy(this.query, columns)
    return this
  }

  /**
   * Adds a HAVING clause to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  having(column: string, operator: QueryComparisonOperator, value: unknown): this {
    HavingMixin.addHavingCondition(this.query, column, operator, value)
    return this
  }
}
