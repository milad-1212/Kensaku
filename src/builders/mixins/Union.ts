import type { QuerySelect } from '@interfaces/index'
import { errorMessages } from '@constants/index'

/**
 * Helper class for set operations (UNION, INTERSECT, EXCEPT).
 * @description Provides reusable set operation functionality for query builders.
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

  /**
   * Adds an INTERSECT clause to the query.
   * @param query - Query object to modify
   * @param intersectQuery - Query to intersect with
   */
  static addIntersect(query: QuerySelect, intersectQuery: QuerySelect): void {
    if (intersectQuery == null) {
      throw new Error(errorMessages.SET_OPERATIONS.INTERSECT_REQUIRES_QUERY)
    }
    query.unions ??= []
    query.unions.push({
      type: 'INTERSECT',
      query: intersectQuery
    })
  }

  /**
   * Adds an EXCEPT clause to the query.
   * @param query - Query object to modify
   * @param exceptQuery - Query to except with
   */
  static addExcept(query: QuerySelect, exceptQuery: QuerySelect): void {
    if (exceptQuery == null) {
      throw new Error(errorMessages.SET_OPERATIONS.EXCEPT_REQUIRES_QUERY)
    }
    query.unions ??= []
    query.unions.push({
      type: 'EXCEPT',
      query: exceptQuery
    })
  }

  /**
   * Adds a MINUS clause to the query (MySQL alias for EXCEPT).
   * @param query - Query object to modify
   * @param minusQuery - Query to minus with
   */
  static addMinus(query: QuerySelect, minusQuery: QuerySelect): void {
    if (minusQuery == null) {
      throw new Error(errorMessages.SET_OPERATIONS.EXCEPT_REQUIRES_QUERY)
    }
    query.unions ??= []
    query.unions.push({
      type: 'MINUS',
      query: minusQuery
    })
  }
}
