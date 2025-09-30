import type { QuerySelect } from '@interfaces/index'
import { SelectConditionalExprBuilder } from '@builders/abstracts/SelectConditionalExpr'
import { UnionMixin } from '@builders/mixins/index'

/**
 * Abstract class for SELECT query building with set operations.
 * @description Extends SelectConditionalExprBuilder with UNION, INTERSECT, and EXCEPT functionality.
 * @template T - Return type of query results
 */
export abstract class SelectSetOperationBuilder<
  T = unknown
> extends SelectConditionalExprBuilder<T> {
  /**
   * Adds a UNION clause to the query.
   * @param query - Query to union with
   * @returns This builder instance for method chaining
   */
  union(query: QuerySelect | SelectSetOperationBuilder): this {
    const unionQuery: QuerySelect =
      query instanceof SelectSetOperationBuilder ? query.toQuery() : query
    UnionMixin.addUnion(this.query, unionQuery)
    return this
  }

  /**
   * Adds a UNION ALL clause to the query.
   * @param query - Query to union with
   * @returns This builder instance for method chaining
   */
  unionAll(query: QuerySelect | SelectSetOperationBuilder): this {
    const unionQuery: QuerySelect =
      query instanceof SelectSetOperationBuilder ? query.toQuery() : query
    UnionMixin.addUnionAll(this.query, unionQuery)
    return this
  }

  /**
   * Adds an INTERSECT clause to the query.
   * @param query - Query to intersect with
   * @returns This builder instance for method chaining
   */
  intersect(query: QuerySelect | SelectSetOperationBuilder): this {
    const intersectQuery: QuerySelect =
      query instanceof SelectSetOperationBuilder ? query.toQuery() : query
    UnionMixin.addIntersect(this.query, intersectQuery)
    return this
  }

  /**
   * Adds an EXCEPT clause to the query.
   * @param query - Query to except with
   * @returns This builder instance for method chaining
   */
  except(query: QuerySelect | SelectSetOperationBuilder): this {
    const exceptQuery: QuerySelect =
      query instanceof SelectSetOperationBuilder ? query.toQuery() : query
    UnionMixin.addExcept(this.query, exceptQuery)
    return this
  }

  /**
   * Adds a MINUS clause to the query (MySQL alias for EXCEPT).
   * @param query - Query to minus with
   * @returns This builder instance for method chaining
   */
  minus(query: QuerySelect | SelectSetOperationBuilder): this {
    const minusQuery: QuerySelect =
      query instanceof SelectSetOperationBuilder ? query.toQuery() : query
    UnionMixin.addMinus(this.query, minusQuery)
    return this
  }
}
