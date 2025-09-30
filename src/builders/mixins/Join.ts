import type {
  QuerySelect,
  QueryWhereCondition,
  QueryJoinType,
  QueryJoinClause
} from '@interfaces/index'

/**
 * Helper class for JOIN query operations.
 * @description Provides reusable JOIN functionality for query builders.
 */
export class JoinMixin {
  /**
   * Adds a join clause to the query.
   * @param query - Query object to modify
   * @param type - Type of join
   * @param table - Table to join
   * @param on - Join conditions
   */
  static addJoin(
    query: QuerySelect,
    type: QueryJoinType,
    table: string,
    on: QueryWhereCondition[]
  ): void {
    query.joins ??= []
    query.joins.push({
      type,
      table,
      on
    })
  }

  /**
   * Adds an INNER JOIN to the query.
   * @param query - Query object to modify
   * @param table - Table to join
   * @param on - Join conditions
   */
  static addInnerJoin(query: QuerySelect, table: string, on: QueryWhereCondition[]): void {
    this.addJoin(query, 'INNER', table, on)
  }

  /**
   * Adds a LEFT JOIN to the query.
   * @param query - Query object to modify
   * @param table - Table to join
   * @param on - Join conditions
   */
  static addLeftJoin(query: QuerySelect, table: string, on: QueryWhereCondition[]): void {
    this.addJoin(query, 'LEFT', table, on)
  }

  /**
   * Adds a RIGHT JOIN to the query.
   * @param query - Query object to modify
   * @param table - Table to join
   * @param on - Join conditions
   */
  static addRightJoin(query: QuerySelect, table: string, on: QueryWhereCondition[]): void {
    this.addJoin(query, 'RIGHT', table, on)
  }

  /**
   * Adds a FULL JOIN to the query.
   * @param query - Query object to modify
   * @param table - Table to join
   * @param on - Join conditions
   */
  static addFullJoin(query: QuerySelect, table: string, on: QueryWhereCondition[]): void {
    this.addJoin(query, 'FULL', table, on)
  }

  /**
   * Adds a CROSS JOIN to the query.
   * @param query - Query object to modify
   * @param table - Table to join
   */
  static addCrossJoin(query: QuerySelect, table: string): void {
    query.joins ??= []
    query.joins.push({
      type: 'CROSS',
      table,
      on: []
    })
  }

  /**
   * Adds a LATERAL JOIN to the query.
   * @param query - Query object to modify
   * @param table - Table to join
   * @param on - Join conditions
   * @param functionName - Optional function name for table functions
   * @param params - Optional function parameters
   */
  static addLateralJoin(
    query: QuerySelect,
    table: string,
    on: QueryWhereCondition[],
    functionName?: string,
    params?: unknown[]
  ): void {
    query.joins ??= []
    const joinClause: QueryJoinClause = {
      type: 'LATERAL',
      table,
      on,
      lateral: true
    }
    if (functionName !== undefined) {
      joinClause.function = functionName
    }
    if (params !== undefined) {
      joinClause.params = params
    }
    query.joins.push(joinClause)
  }
}
