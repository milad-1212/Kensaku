import type {
  QueryArrayFunctionName,
  QueryArrayType,
  QuerySelect,
  QueryArrayOperation,
  QueryArrayFunction
} from '@interfaces/index'

/**
 * Mixin for Array operations.
 * @description Provides reusable functionality for array operations and array functions.
 */
export class ArrayMixin {
  /**
   * Adds an array operation to the query.
   * @param query - SELECT query object
   * @param column - Column containing array data
   * @param operator - Array operator
   * @param value - Value to compare with
   */
  static addArrayOperation(
    query: QuerySelect,
    column: string,
    operator: QueryArrayType,
    value: unknown[] | string
  ): void {
    query.arrayOperations ??= []
    const arrayOperation: QueryArrayOperation = {
      column,
      operator,
      value
    }
    query.arrayOperations.push(arrayOperation)
  }

  /**
   * Adds an array function operation to the query.
   * @param query - SELECT query object
   * @param functionName - Array function name
   * @param column - Column containing array data
   * @param alias - Optional alias for the result
   * @param orderBy - Order by columns for aggregation
   */
  static addArrayFunction(
    query: QuerySelect,
    functionName: QueryArrayFunctionName,
    column: string,
    alias?: string,
    orderBy?: string[]
  ): void {
    query.arrayFunctions ??= []
    const arrayFunction: QueryArrayFunction = {
      function: functionName,
      column,
      ...alias !== undefined && { alias },
      ...orderBy !== undefined && { orderBy }
    }
    query.arrayFunctions.push(arrayFunction)
  }
}
