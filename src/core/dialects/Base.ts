import type {
  ConnectionBase,
  DatabaseConfig,
  QueryCTEClause,
  QueryDelete,
  QueryInsert,
  QueryMerge,
  QuerySelect,
  QueryStatement,
  QueryUpdate,
  QueryWhereCondition
} from '@interfaces/index'
import { ClauseBuilders, ParameterBuilders, QueryBuilders } from '@core/dialects/builders'

/**
 * Abstract base class for database dialect implementations.
 * @description Provides the interface that all database dialects must implement.
 */
export abstract class Base {
  /** Database configuration object */
  protected config: DatabaseConfig

  /**
   * Creates a new Base dialect instance.
   * @param config - Database configuration
   */
  constructor(config: DatabaseConfig) {
    this.config = config
  }

  /**
   * Creates a database connection.
   * @param config - Database configuration
   * @returns Promise that resolves to a connection instance
   */
  abstract createConnection(config: DatabaseConfig): Promise<ConnectionBase>

  /**
   * Builds a SELECT query for this dialect.
   * @param query - SELECT query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildSelectQuery(query: QuerySelect): QueryStatement

  /**
   * Builds an INSERT query for this dialect.
   * @param query - INSERT query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildInsertQuery(query: QueryInsert): QueryStatement

  /**
   * Builds an UPDATE query for this dialect.
   * @param query - UPDATE query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildUpdateQuery(query: QueryUpdate): QueryStatement

  /**
   * Builds a DELETE query for this dialect.
   * @param query - DELETE query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildDeleteQuery(query: QueryDelete): QueryStatement

  /**
   * Builds a MERGE query for this dialect.
   * @param query - MERGE query object
   * @returns Object containing SQL string and parameters
   */
  abstract buildMergeQuery(query: QueryMerge): QueryStatement

  /**
   * Escapes a database identifier for this dialect.
   * @param name - Identifier to escape
   * @returns Escaped identifier string
   */
  abstract escapeIdentifier(name: string): string

  /**
   * Escapes a value for this dialect.
   * @param value - Value to escape
   * @returns Escaped value string
   */
  abstract escapeValue(value: unknown): string

  /**
   * Maps a generic data type to this dialect's specific type.
   * @param type - Generic data type
   * @returns Dialect-specific data type
   */
  abstract getDataType(type: string): string

  /**
   * Gets the LIMIT/OFFSET syntax for this dialect.
   * @param limit - Number of rows to limit
   * @param offset - Number of rows to skip
   * @returns LIMIT/OFFSET SQL syntax
   */
  abstract getLimitSyntax(limit?: number, offset?: number): string

  /**
   * Builds CTE (Common Table Expression) clauses.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  public buildCTEClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    const cteParts: string[] = []
    for (const cte of query.ctes ?? []) {
      const cteName: string = this.escapeIdentifier(cte.name)
      const { sql: cteSql, params: cteParams }: QueryStatement = this.buildSelectQuery(cte.query)
      cteParts.push(`${cteName} AS (${cteSql})`)
      params.push(...cteParams)
    }
    parts.push('WITH')
    if (query.ctes?.some((cte: QueryCTEClause) => cte.recursive === true) === true) {
      parts.push('RECURSIVE')
    }
    parts.push(cteParts.join(', '))
  }

  /**
   * Builds UNION clauses.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  public buildUnionClauses(query: QuerySelect, parts: string[], params: unknown[]): void {
    for (const union of query.unions ?? []) {
      const { sql: unionSql, params: unionParams }: QueryStatement = this.buildSelectQuery(
        union.query
      )
      parts.push(union.type, unionSql)
      params.push(...unionParams)
    }
  }

  /**
   * Builds window functions for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  public buildWindowFunctions(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    QueryBuilders.buildWindowFunctions(query, parts, escapeFn)
  }

  /**
   * Builds conditional expressions for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  public buildConditionalExpressions(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    QueryBuilders.buildConditionalExpressions(query, parts, escapeFn)
  }

  /**
   * Builds set operations for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   * @param escapeFn - Dialect-specific escape function
   * @param buildSelectQueryFn - Dialect-specific SELECT query builder
   */
  public buildSetOperations(
    query: QuerySelect,
    parts: string[],
    params: unknown[],
    escapeFn: (name: string) => string,
    buildSelectQueryFn: (query: QuerySelect) => QueryStatement
  ): void {
    QueryBuilders.buildSetOperations(query, parts, params, escapeFn, buildSelectQueryFn)
  }

  /**
   * Builds the SELECT clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  protected buildSelectClause(query: QuerySelect, parts: string[]): void {
    QueryBuilders.buildSelectClause(query, parts, this.escapeIdentifier.bind(this))
  }

  /**
   * Builds the FROM clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  protected buildFromClause(query: QuerySelect, parts: string[]): void {
    QueryBuilders.buildFromClause(query, parts, this.escapeIdentifier.bind(this))
  }

  /**
   * Builds JOIN clauses for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  protected buildJoinClauses(query: QuerySelect, parts: string[]): void {
    QueryBuilders.buildJoinClauses(query, parts, this.escapeIdentifier.bind(this))
  }

  /**
   * Builds the WHERE clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  protected buildWhereClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    QueryBuilders.buildWhereClause(query, parts, params, this.buildWhereConditions.bind(this))
  }

  /**
   * Builds the GROUP BY clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   */
  protected buildGroupByClause(query: QuerySelect, parts: string[]): void {
    QueryBuilders.buildGroupByClause(query, parts, this.escapeIdentifier.bind(this))
  }

  /**
   * Builds the HAVING clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  protected buildHavingClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    QueryBuilders.buildHavingClause(query, parts, params, this.buildWhereConditions.bind(this))
  }

  /**
   * Builds the ORDER BY clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  protected buildOrderByClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    QueryBuilders.buildOrderByClause(query, parts, this.escapeIdentifier.bind(this), params)
  }

  /**
   * Builds the LIMIT clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  protected buildLimitClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    QueryBuilders.buildLimitClause(query, parts, params)
  }

  /**
   * Builds the OFFSET clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  protected buildOffsetClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    QueryBuilders.buildOffsetClause(query, parts, params)
  }

  /**
   * Builds WHERE conditions into SQL string for any dialect.
   * @param conditions - Array of WHERE conditions
   * @param params - Array to store query parameters
   * @returns SQL string for WHERE clause
   */
  protected buildWhereConditions(conditions: QueryWhereCondition[], params: unknown[]): string {
    return ClauseBuilders.buildWhereConditions(
      conditions,
      params,
      this.escapeIdentifier.bind(this),
      this.addParam.bind(this)
    )
  }

  /**
   * Adds a parameter to the params array and returns placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns Parameter placeholder string
   */
  protected addParam(value: unknown, params: unknown[]): string {
    return ParameterBuilders.addParam(value, params)
  }
}
