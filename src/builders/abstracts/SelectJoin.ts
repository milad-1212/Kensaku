import type { QueryWhereCondition } from '@interfaces/index'
import { SelectConditionalBuilder } from '@builders/abstracts/SelectConditional'
import { JoinMixin } from '@builders/mixins/index'

/**
 * Abstract class for SELECT query building with JOIN operations.
 * @description Extends SelectConditionalBuilder with JOIN functionality.
 * @template T - Return type of query results
 */
export abstract class SelectJoinBuilder<T = unknown> extends SelectConditionalBuilder<T> {
  /**
   * Adds an INNER JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  join(table: string, on: QueryWhereCondition[]): this {
    JoinMixin.addInnerJoin(this.query, table, on)
    return this
  }

  /**
   * Adds an INNER JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  innerJoin(table: string, on: QueryWhereCondition[]): this
  /**
   * Adds an INNER JOIN to the query with simple column matching.
   * @param table - Table to join
   * @param leftColumn - Left table column
   * @param rightColumn - Right table column
   * @returns This builder instance for method chaining
   */
  innerJoin(table: string, leftColumn: string, rightColumn: string): this
  innerJoin(
    table: string,
    onOrLeftColumn: QueryWhereCondition[] | string,
    rightColumn?: string
  ): this {
    if (typeof onOrLeftColumn === 'string' && rightColumn != null) {
      const conditions: QueryWhereCondition[] = [
        {
          column: onOrLeftColumn,
          operator: '=',
          value: rightColumn
        }
      ]
      JoinMixin.addInnerJoin(this.query, table, conditions)
    } else {
      JoinMixin.addInnerJoin(this.query, table, onOrLeftColumn as QueryWhereCondition[])
    }
    return this
  }

  /**
   * Adds a LEFT JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  leftJoin(table: string, on: QueryWhereCondition[]): this
  /**
   * Adds a LEFT JOIN to the query with simple column matching.
   * @param table - Table to join
   * @param leftColumn - Left table column
   * @param rightColumn - Right table column
   * @returns This builder instance for method chaining
   */
  leftJoin(table: string, leftColumn: string, rightColumn: string): this
  leftJoin(
    table: string,
    onOrLeftColumn: QueryWhereCondition[] | string,
    rightColumn?: string
  ): this {
    if (typeof onOrLeftColumn === 'string' && rightColumn != null) {
      const conditions: QueryWhereCondition[] = [
        {
          column: onOrLeftColumn,
          operator: '=',
          value: rightColumn
        }
      ]
      JoinMixin.addLeftJoin(this.query, table, conditions)
    } else {
      JoinMixin.addLeftJoin(this.query, table, onOrLeftColumn as QueryWhereCondition[])
    }
    return this
  }

  /**
   * Adds a RIGHT JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  rightJoin(table: string, on: QueryWhereCondition[]): this
  /**
   * Adds a RIGHT JOIN to the query with simple column matching.
   * @param table - Table to join
   * @param leftColumn - Left table column
   * @param rightColumn - Right table column
   * @returns This builder instance for method chaining
   */
  rightJoin(table: string, leftColumn: string, rightColumn: string): this
  rightJoin(
    table: string,
    onOrLeftColumn: QueryWhereCondition[] | string,
    rightColumn?: string
  ): this {
    if (typeof onOrLeftColumn === 'string' && rightColumn != null) {
      const conditions: QueryWhereCondition[] = [
        {
          column: onOrLeftColumn,
          operator: '=',
          value: rightColumn
        }
      ]
      JoinMixin.addRightJoin(this.query, table, conditions)
    } else {
      JoinMixin.addRightJoin(this.query, table, onOrLeftColumn as QueryWhereCondition[])
    }
    return this
  }

  /**
   * Adds a FULL JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  fullJoin(table: string, on: QueryWhereCondition[]): this
  /**
   * Adds a FULL JOIN to the query with simple column matching.
   * @param table - Table to join
   * @param leftColumn - Left table column
   * @param rightColumn - Right table column
   * @returns This builder instance for method chaining
   */
  fullJoin(table: string, leftColumn: string, rightColumn: string): this
  fullJoin(
    table: string,
    onOrLeftColumn: QueryWhereCondition[] | string,
    rightColumn?: string
  ): this {
    if (typeof onOrLeftColumn === 'string' && rightColumn != null) {
      const conditions: QueryWhereCondition[] = [
        {
          column: onOrLeftColumn,
          operator: '=',
          value: rightColumn
        }
      ]
      JoinMixin.addFullJoin(this.query, table, conditions)
    } else {
      JoinMixin.addFullJoin(this.query, table, onOrLeftColumn as QueryWhereCondition[])
    }
    return this
  }

  /**
   * Adds a CROSS JOIN to the query.
   * @param table - Table to join
   * @returns This builder instance for method chaining
   */
  crossJoin(table: string): this {
    JoinMixin.addCrossJoin(this.query, table)
    return this
  }

  /**
   * Adds a LATERAL JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  lateralJoin(table: string, on: QueryWhereCondition[]): this
  /**
   * Adds a LATERAL JOIN to the query with simple column matching.
   * @param table - Table to join
   * @param leftColumn - Left table column
   * @param rightColumn - Right table column
   * @returns This builder instance for method chaining
   */
  lateralJoin(table: string, leftColumn: string, rightColumn: string): this
  lateralJoin(
    table: string,
    onOrLeftColumn: QueryWhereCondition[] | string,
    rightColumn?: string
  ): this {
    if (typeof onOrLeftColumn === 'string' && rightColumn != null) {
      const conditions: QueryWhereCondition[] = [
        {
          column: onOrLeftColumn,
          operator: '=',
          value: rightColumn
        }
      ]
      JoinMixin.addLateralJoin(this.query, table, conditions)
    } else {
      JoinMixin.addLateralJoin(this.query, table, onOrLeftColumn as QueryWhereCondition[])
    }
    return this
  }
}
