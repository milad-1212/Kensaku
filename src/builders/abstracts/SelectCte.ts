import type { QuerySelect } from '@interfaces/index'
import { SelectSetOperationBuilder } from '@builders/abstracts/SelectSetOperation'
import { CteMixin } from '@builders/mixins/index'

/**
 * Abstract class for SELECT query building with Common Table Expressions (CTEs).
 * @description Extends SelectSetOperationBuilder with CTE functionality.
 * @template T - Return type of query results
 */
export abstract class SelectCteBuilder<T = unknown> extends SelectSetOperationBuilder<T> {
  /**
   * Adds a Common Table Expression (CTE) to the query.
   * @param name - CTE name
   * @param query - CTE query
   * @returns This builder instance for method chaining
   */
  with(name: string, query: QuerySelect | SelectCteBuilder): this {
    const cteQuery: QuerySelect = query instanceof SelectCteBuilder ? query.toQuery() : query
    CteMixin.addCte(this.query, name, cteQuery)
    return this
  }

  /**
   * Adds a recursive Common Table Expression (CTE) to the query.
   * @param name - CTE name
   * @param query - CTE query
   * @returns This builder instance for method chaining
   */
  withRecursive(name: string, query: QuerySelect | SelectCteBuilder): this {
    const cteQuery: QuerySelect = query instanceof SelectCteBuilder ? query.toQuery() : query
    CteMixin.addRecursiveCte(this.query, name, cteQuery)
    return this
  }
}
