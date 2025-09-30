/**
 * Supported aggregation functions.
 */
export type QueryAggregationFunction =
  | 'COUNT'
  | 'SUM'
  | 'AVG'
  | 'MAX'
  | 'MIN'
  | 'STDDEV'
  | 'STDDEV_POP'
  | 'STDDEV_SAMP'
  | 'VARIANCE'
  | 'VAR_POP'
  | 'VAR_SAMP'
  | 'PERCENTILE_CONT'
  | 'PERCENTILE_DISC'
  | 'MODE'
  | 'GROUP_CONCAT'
  | 'STRING_AGG'
  | 'ARRAY_AGG'
  | 'JSON_AGG'
  | 'JSON_OBJECT_AGG'
  | 'JSON_ARRAY_AGG'

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
  | 'IS DISTINCT FROM'
  | 'SIMILAR TO'
  | 'REGEXP'
  | 'RLIKE'
  | 'GLOB'
  | 'RAW'

/**
 * Supported conflict actions.
 */
export type QueryConflictAction = 'DO_NOTHING' | 'DO_UPDATE'

/**
 * Supported sort directions.
 */
export type QueryDirectionType = 'ASC' | 'DESC'

/**
 * Supported join types.
 */
export type QueryJoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS' | 'LATERAL'

/**
 * Supported set operation types.
 */
export type QuerySetOperation = 'UNION' | 'UNION ALL' | 'INTERSECT' | 'EXCEPT' | 'MINUS'

/**
 * Supported query types.
 */
export type QueryType = 'select' | 'insert' | 'update' | 'delete' | 'raw'

/**
 * Interface for aggregation expressions.
 */
export interface QueryAggregationExpression {
  /** Aggregation function name */
  function: QueryAggregationFunction
  /** Column or expression to aggregate */
  column: string
  /** Optional alias for the aggregation */
  alias?: string
  /** Optional DISTINCT modifier */
  distinct?: boolean
  /** Optional ORDER BY for string aggregations */
  orderBy?: QueryOrderClause[]
  /** Optional separator for string aggregations */
  separator?: string
  /** Optional percentile value for percentile functions */
  percentile?: number
}

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
 * Interface for CASE expression structure.
 */
export interface QueryCaseExpression {
  /** WHEN condition */
  when: string
  /** THEN value */
  then: string | number
  /** ELSE value (optional) */
  else?: string | number
}

/**
 * Interface for conditional expressions (CASE, COALESCE, NULLIF).
 */
export interface QueryConditionalExpression {
  /** Type of conditional expression */
  type: 'CASE' | 'COALESCE' | 'NULLIF'
  /** CASE expressions (for CASE type) */
  case?: QueryCaseExpression[]
  /** Columns for COALESCE */
  columns?: string[]
  /** First column for NULLIF */
  column1?: string
  /** Second column for NULLIF */
  column2?: string
  /** Optional alias */
  alias?: string
}
/**
 * Interface for ON CONFLICT clause structure.
 */
export interface QueryConflictClause {
  /** Target columns or constraint name */
  target: string[]
  /** Conflict action */
  action: QueryConflictAction
  /** Update data for DO_UPDATE action */
  update?: Record<string, unknown>
  /** WHERE conditions for DO_UPDATE action */
  where?: QueryWhereCondition[]
}

/**
 * Interface for Common Table Expression (CTE) structure.
 */
export interface QueryCTEClause {
  /** CTE name */
  name: string
  /** CTE query */
  query: QuerySelect
  /** Whether this is a recursive CTE */
  recursive?: boolean
}

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
  /** Optional ON CONFLICT clause */
  conflict?: QueryConflictClause
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
  /** Whether this is a lateral join (for LATERAL type) */
  lateral?: boolean
  /** Function name for table functions (for LATERAL type) */
  function?: string
  /** Function parameters (for LATERAL type) */
  params?: unknown[]
}

/**
 * Interface for MERGE query structure.
 */
export interface QueryMerge {
  /** Target table name */
  into: string
  /** Source table or subquery */
  using: string | QuerySubQuery
  /** Join conditions */
  on: QueryWhereCondition[]
  /** WHEN MATCHED clause */
  whenMatched?: {
    /** Update data */
    update?: Record<string, unknown>
    /** Delete flag */
    delete?: boolean
  }
  /** WHEN NOT MATCHED clause */
  whenNotMatched?: {
    /** Insert data */
    insert: Record<string, unknown>
  }
  /** Columns to return */
  returning?: string[]
}

/**
 * Interface for ORDER BY clause structure.
 */
export interface QueryOrderClause {
  /** Column name or expression to order by */
  column: string
  /** Sort direction */
  direction: QueryDirectionType
  /** Whether this is a raw expression (not just a column) */
  isExpression?: boolean
  /** Parameters for raw expressions */
  params?: unknown[]
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
  /** Aggregation expressions */
  aggregations?: QueryAggregationExpression[]
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
  /** Raw LIMIT expression */
  limitRaw?: QueryRawQuery
  /** Raw OFFSET expression */
  offsetRaw?: QueryRawQuery
  /** Whether to use DISTINCT */
  distinct?: boolean
  /** UNION clauses */
  unions?: QueryUnionClause[]
  /** Common Table Expressions */
  ctes?: QueryCTEClause[]
  /** Window functions */
  windowFunctions?: QueryWindowFunction[]
  /** Conditional expressions */
  conditionals?: QueryConditionalExpression[]
}

/**
 * Interface for statement structure.
 */
export interface QueryStatement {
  /** SQL query string */
  sql: string
  /** Query parameters */
  params: unknown[]
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
 * Interface for set operation clause structure.
 */
export interface QueryUnionClause {
  /** Type of set operation */
  type: QuerySetOperation
  /** Query to perform operation with */
  query: QuerySelect
}

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

/**
 * Interface for Window Function structure.
 */
export interface QueryWindowFunction {
  /** Function name */
  function:
    | 'ROW_NUMBER'
    | 'RANK'
    | 'DENSE_RANK'
    | 'LAG'
    | 'LEAD'
    | 'FIRST_VALUE'
    | 'LAST_VALUE'
    | 'NTILE'
    | 'CUME_DIST'
    | 'PERCENT_RANK'
    | 'NTH_VALUE'
  /** Function arguments */
  args?: string[]
  /** Window specification */
  over?: QueryWindowSpec
}

/**
 * Interface for Window specification.
 */
export interface QueryWindowSpec {
  /** Partition by columns */
  partitionBy?: string[]
  /** Order by clauses */
  orderBy?: QueryOrderClause[]
  /** Window frame specification */
  frame?: {
    type: 'ROWS' | 'RANGE' | 'GROUPS'
    start: string | number
    end?: string | number
    exclude?: 'CURRENT ROW' | 'GROUP' | 'TIES' | 'NO OTHERS'
  }
}
