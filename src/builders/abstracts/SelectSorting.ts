import type { QueryDirectionType } from '@interfaces/index'
import { SelectGroupingBuilder } from '@builders/abstracts/SelectGrouping'
import { SelectMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'

/**
 * Abstract class for SELECT query building with sorting and pagination functionality.
 * @description Extends SelectGroupingBuilder with ORDER BY, LIMIT, and OFFSET functionality.
 * @template T - Return type of query results
 */
export abstract class SelectSortingBuilder<T = unknown> extends SelectGroupingBuilder<T> {
  /**
   * Adds an ORDER BY clause to the query.
   * @param column - Column to order by
   * @param direction - Sort direction
   * @returns This builder instance for method chaining
   */
  orderBy(column: string, direction: QueryDirectionType = 'ASC'): this {
    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new Error(errorMessages.VALIDATION.INVALID_ORDER_DIRECTION)
    }
    SelectMixin.addOrderBy(this.query, column, direction)
    return this
  }

  /**
   * Adds an ORDER BY expression to the query.
   * @param expression - SQL expression to order by
   * @param direction - Sort direction
   * @returns This builder instance for method chaining
   */
  orderByExpression(expression: string, direction: QueryDirectionType = 'ASC'): this {
    SelectMixin.addOrderByExpression(this.query, expression, direction)
    return this
  }

  /**
   * Adds a raw SQL expression to the ORDER BY clause.
   * @param sql - Raw SQL expression
   * @param params - Parameters for the SQL expression
   * @returns This builder instance for method chaining
   */
  orderByRaw(sql: string, params?: unknown[]): this {
    SelectMixin.addOrderByExpression(this.query, sql, 'ASC', params)
    return this
  }

  /**
   * Adds a LIMIT clause to the query.
   * @param count - Number of rows to limit
   * @returns This builder instance for method chaining
   */
  limit(count: number): this {
    SelectMixin.setLimit(this.query, count)
    return this
  }

  /**
   * Adds an OFFSET clause to the query.
   * @param count - Number of rows to skip
   * @returns This builder instance for method chaining
   */
  offset(count: number): this {
    SelectMixin.setOffset(this.query, count)
    return this
  }

  /**
   * Adds a raw SQL expression to the LIMIT clause.
   * @param sql - Raw SQL expression
   * @param params - Parameters for the SQL expression
   * @returns This builder instance for method chaining
   */
  limitRaw(sql: string, params?: unknown[]): this {
    SelectMixin.setLimitRaw(this.query, sql, params)
    if (params && params.length > 0) {
      this.params.push(...params)
    }
    return this
  }
}
