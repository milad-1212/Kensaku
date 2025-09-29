import type { QuerySelect, QueryWhereCondition } from '@interfaces/index'

/**
 * Core query building utilities for database dialects.
 * @description Provides common query building methods that are shared across all database dialects.
 */
export class QueryBuilders {
  /**
   * Escapes a database identifier.
   * @param name - Identifier to escape
   * @param escapeFn - Dialect-specific escape function
   * @returns Escaped identifier string
   */
  private static escapeIdentifier(name: string, escapeFn: (name: string) => string): string {
    return escapeFn(name)
  }

  /**
   * Builds the SELECT clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildSelectClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    parts.push('SELECT')
    if (query.distinct === true) {
      parts.push('DISTINCT')
    }
    if (query.columns !== undefined && query.columns.length > 0) {
      const columns: string = query.columns
        .map((col: string) => this.escapeIdentifier(col, escapeFn))
        .join(', ')
      parts.push(columns)
    } else {
      parts.push('*')
    }
  }

  /**
   * Builds the FROM clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildFromClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.from !== undefined) {
      const fromTable: string =
        typeof query.from === 'string' ? query.from : query.from.alias ?? 'subquery'
      parts.push('FROM', this.escapeIdentifier(fromTable, escapeFn))
    }
  }

  /**
   * Builds JOIN clauses for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   * @param escapeFn - Dialect-specific escape function
   * @param buildWhereConditionsFn - Dialect-specific WHERE conditions builder
   */
  static buildJoinClauses(
    query: QuerySelect,
    parts: string[],
    params: unknown[],
    escapeFn: (name: string) => string,
    buildWhereConditionsFn: (conditions: QueryWhereCondition[], params: unknown[]) => string
  ): void {
    if (query.joins !== undefined) {
      for (const join of query.joins) {
        const tableName: string =
          typeof join.table === 'string' ? join.table : join.table.alias ?? 'subquery'
        parts.push(join.type, 'JOIN', this.escapeIdentifier(tableName, escapeFn))
        if (join.on != null && join.on.length > 0) {
          parts.push('ON', buildWhereConditionsFn(join.on, params))
        }
      }
    }
  }

  /**
   * Builds the WHERE clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   * @param buildWhereConditionsFn - Dialect-specific WHERE conditions builder
   */
  static buildWhereClause(
    query: QuerySelect,
    parts: string[],
    params: unknown[],
    buildWhereConditionsFn: (conditions: QueryWhereCondition[], params: unknown[]) => string
  ): void {
    if (query.where !== undefined && query.where.length > 0) {
      parts.push('WHERE', buildWhereConditionsFn(query.where, params))
    }
  }

  /**
   * Builds the GROUP BY clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildGroupByClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.groupBy !== undefined && query.groupBy.length > 0) {
      const columns: string = query.groupBy
        .map((col: string) => this.escapeIdentifier(col, escapeFn))
        .join(', ')
      parts.push('GROUP BY', columns)
    }
  }

  /**
   * Builds the HAVING clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   * @param buildWhereConditionsFn - Dialect-specific WHERE conditions builder
   */
  static buildHavingClause(
    query: QuerySelect,
    parts: string[],
    params: unknown[],
    buildWhereConditionsFn: (conditions: QueryWhereCondition[], params: unknown[]) => string
  ): void {
    if (query.having !== undefined && query.having.length > 0) {
      parts.push('HAVING', buildWhereConditionsFn(query.having, params))
    }
  }

  /**
   * Builds the ORDER BY clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildOrderByClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.orderBy !== undefined && query.orderBy.length > 0) {
      const orders: string = query.orderBy
        .map(
          (order: {
            /** Column name to order by */
            column: string
            /** Sort direction (ASC/DESC) */
            direction: string
          }) => `${this.escapeIdentifier(order.column, escapeFn)} ${order.direction}`
        )
        .join(', ')
      parts.push('ORDER BY', orders)
    }
  }

  /**
   * Builds the LIMIT clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  static buildLimitClause(query: QuerySelect, parts: string[]): void {
    if (query.limit !== undefined && query.limit > 0) {
      parts.push('LIMIT', query.limit.toString())
    }
  }

  /**
   * Builds the OFFSET clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  static buildOffsetClause(query: QuerySelect, parts: string[]): void {
    if (query.offset !== undefined && query.offset > 0) {
      parts.push('OFFSET', query.offset.toString())
    }
  }
}
