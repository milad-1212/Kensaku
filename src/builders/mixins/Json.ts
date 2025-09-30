import type {
  QuerySelect,
  QueryJsonPath,
  QueryJsonFunction,
  QueryJsonOperator,
  QueryJsonFunctionName
} from '@interfaces/index'

/**
 * Mixin for JSON operations.
 * @description Provides reusable functionality for JSON path queries and JSON functions.
 */
export class JsonMixin {
  /**
   * Adds a JSON path operation to the query.
   * @param query - SELECT query object
   * @param column - Column containing JSON data
   * @param path - JSON path expression
   * @param operator - JSON path operator ('->' or '->>')
   * @param alias - Optional alias for the result
   */
  static addJsonPath(
    query: QuerySelect,
    column: string,
    path: string,
    operator: QueryJsonOperator = '->>',
    alias?: string
  ): void {
    query.jsonPaths ??= []
    const jsonPath: QueryJsonPath = {
      column,
      path,
      operator,
      ...alias !== undefined && { alias }
    }
    query.jsonPaths.push(jsonPath)
  }

  /**
   * Adds a JSON function operation to the query.
   * @param query - SELECT query object
   * @param functionName - JSON function name
   * @param column - Column containing JSON data
   * @param path - JSON path expression
   * @param value - Value for set/insert/replace operations
   * @param alias - Optional alias for the result
   */
  static addJsonFunction(
    query: QuerySelect,
    functionName: QueryJsonFunctionName,
    column: string,
    path: string,
    value?: unknown,
    alias?: string
  ): void {
    query.jsonFunctions ??= []
    const jsonFunction: QueryJsonFunction = {
      function: functionName,
      column,
      path,
      ...value !== undefined && { value },
      ...alias !== undefined && { alias }
    }
    query.jsonFunctions.push(jsonFunction)
  }
}
