/**
 * Base interface for all query builders.
 * @template T - Return type of query results
 */
export interface QueryBuilder<T = unknown> {
  /**
   * Returns the SQL string for this query.
   * @returns SQL query string
   */
  toSQL(): string

  /**
   * Returns the parameters for this query.
   * @returns Array of query parameters
   */
  toParams(): unknown[]

  /**
   * Executes the query and returns the results.
   * @returns Promise that resolves to an array of results
   */
  execute(): Promise<T[]>
}

/**
 * Supported comparison operators for WHERE conditions.
 */
export type QueryComparisonOperator =
  | '='
  | '!='
  | '<>'
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'ILIKE'
  | 'NOT LIKE'
  | 'IN'
  | 'NOT IN'
  | 'BETWEEN'
  | 'NOT BETWEEN'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'EXISTS'
  | 'NOT EXISTS'

/**
 * Interface for DELETE query structure.
 */
export interface QueryDelete {
  /** Table name to delete from */
  from: string
  /** Optional WHERE conditions */
  where?: QueryWhereCondition[]
  /** Optional columns to return after delete */
  returning?: string[]
}

/**
 * Interface for INSERT query structure.
 */
export interface QueryInsert {
  /** Table name to insert into */
  into: string
  /** Data to insert as object or array of objects */
  values: Record<string, unknown> | Record<string, unknown>[]
  /** Optional columns to return after insert */
  returning?: string[]
}

/**
 * Interface for JOIN clause structure.
 */
export interface QueryJoinClause {
  /** Type of join */
  type: QueryJoinType
  /** Table to join or subquery */
  table: string | QuerySubQuery
  /** Join conditions */
  on: QueryWhereCondition[]
}

/**
 * Supported join types.
 */
export type QueryJoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS'

/**
 * Supported sort directions.
 */
export type QueryDirectionType = 'ASC' | 'DESC'

/**
 * Interface for ORDER BY clause structure.
 */
export interface QueryOrderClause {
  /** Column name to order by */
  column: string
  /** Sort direction */
  direction: QueryDirectionType
}

/**
 * Interface for raw SQL query structure.
 */
export interface QueryRawQuery {
  /** SQL query string */
  sql: string
  /** Query parameters */
  params: unknown[]
}

/**
 * Interface for SELECT query structure.
 */
export interface QuerySelect {
  /** Columns to select */
  columns?: string[]
  /** Table or subquery to select from */
  from?: string | QuerySubQuery
  /** WHERE conditions */
  where?: QueryWhereCondition[]
  /** JOIN clauses */
  joins?: QueryJoinClause[]
  /** GROUP BY columns */
  groupBy?: string[]
  /** HAVING conditions */
  having?: QueryWhereCondition[]
  /** ORDER BY clauses */
  orderBy?: QueryOrderClause[]
  /** LIMIT count */
  limit?: number
  /** OFFSET count */
  offset?: number
  /** Whether to use DISTINCT */
  distinct?: boolean
}

/**
 * Interface for subquery structure.
 */
export interface QuerySubQuery {
  /** SQL query string */
  query: string
  /** Query parameters */
  params: unknown[]
  /** Optional alias for the subquery */
  alias?: string
}

/**
 * Supported query types.
 */
export type QueryType = 'select' | 'insert' | 'update' | 'delete' | 'raw'

/**
 * Interface for UPDATE query structure.
 */
export interface QueryUpdate {
  /** Table name to update */
  table: string
  /** Data to update as key-value pairs */
  set: Record<string, unknown>
  /** Optional WHERE conditions */
  where?: QueryWhereCondition[]
  /** Optional columns to return after update */
  returning?: string[]
}

/**
 * Interface for WHERE condition structure.
 */
export interface QueryWhereCondition {
  /** Column name for the condition */
  column: string
  /** Comparison operator */
  operator: QueryComparisonOperator
  /** Value to compare against */
  value: unknown
  /** Logical operator for combining conditions */
  logical?: 'AND' | 'OR'
}
