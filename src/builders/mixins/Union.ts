import type { QuerySelect } from '@interfaces/index'

/**
 * Helper class for UNION operations.
 * @description Provides reusable UNION functionality for query builders.
 */
export class UnionMixin {
  /**
   * Adds a UNION clause to the query.
   * @param query - Query object to modify
   * @param unionQuery - Query to union with
   */
  static addUnion(query: QuerySelect, unionQuery: QuerySelect): void {
    query.unions ??= []
    query.unions.push({
      type: 'UNION',
      query: unionQuery
    })
  }

  /**
   * Adds a UNION ALL clause to the query.
   * @param query - Query object to modify
   * @param unionQuery - Query to union with
   */
  static addUnionAll(query: QuerySelect, unionQuery: QuerySelect): void {
    query.unions ??= []
    query.unions.push({
      type: 'UNION ALL',
      query: unionQuery
    })
  }
}
