import type { QuerySelect } from '@interfaces/index'

/**
 * Helper class for Common Table Expression (CTE) operations.
 * @description Provides reusable CTE functionality for query builders.
 */
export class CteMixin {
  /**
   * Adds a Common Table Expression (CTE) to the query.
   * @param query - Query object to modify
   * @param name - CTE name
   * @param cteQuery - CTE query object
   */
  static addCte(query: QuerySelect, name: string, cteQuery: QuerySelect): void {
    query.ctes ??= []
    query.ctes.push({
      name,
      query: cteQuery,
      recursive: false
    })
  }

  /**
   * Adds a recursive Common Table Expression (CTE) to the query.
   * @param query - Query object to modify
   * @param name - CTE name
   * @param cteQuery - CTE query object
   */
  static addRecursiveCte(query: QuerySelect, name: string, cteQuery: QuerySelect): void {
    query.ctes ??= []
    query.ctes.push({
      name,
      query: cteQuery,
      recursive: true
    })
  }
}
