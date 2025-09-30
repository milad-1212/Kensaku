/**
 * Supported JSON path operators.
 */
export type QueryJsonOperator = '->' | '->>'

/**
 * Supported JSON function names.
 */
export type QueryJsonFunctionName =
  | 'json_extract'
  | 'json_set'
  | 'json_remove'
  | 'json_insert'
  | 'json_replace'
  | 'json_valid'

/**
 * JSON path operation for accessing JSON data.
 */
export interface QueryJsonPath {
  /** Column containing JSON data */
  column: string
  /** JSON path expression */
  path: string
  /** JSON path operator */
  operator: QueryJsonOperator
  /** Optional alias for the result */
  alias?: string
}

/**
 * JSON function operation.
 */
export interface QueryJsonFunction {
  /** JSON function name */
  function: QueryJsonFunctionName
  /** Column containing JSON data */
  column: string
  /** JSON path expression */
  path: string
  /** Value for set/insert/replace operations */
  value?: unknown
  /** Optional alias for the result */
  alias?: string
}
