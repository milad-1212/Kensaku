/**
 * Supported array function names.
 */
export type QueryArrayFunctionName =
  | 'array_agg'
  | 'unnest'
  | 'array_length'
  | 'array_append'
  | 'array_prepend'
  | 'array_cat'

/**
 * Supported array operators.
 */
export type QueryArrayType = '@>' | '<@' | '&&' | '||' | '#-'

/**
 * Array operation for array data.
 */
export interface QueryArrayOperation {
  /** Column containing array data */
  column: string
  /** Array operator */
  operator: QueryArrayType
  /** Value to compare with */
  value: unknown[] | string
}

/**
 * Array function operation.
 */
export interface QueryArrayFunction {
  /** Array function name */
  function: QueryArrayFunctionName
  /** Column containing array data */
  column: string
  /** Optional alias for the result */
  alias?: string
  /** Order by columns for aggregation */
  orderBy?: string[]
  /** Value for append/prepend/cat operations */
  value?: unknown
}

/** Array slicing operation */
export interface QueryArraySlice {
  /** Column containing array data */
  column: string
  /** Start index (1-based, inclusive) */
  start: number
  /** End index (1-based, inclusive) */
  end: number
  /** Optional alias for the result */
  alias?: string
}
