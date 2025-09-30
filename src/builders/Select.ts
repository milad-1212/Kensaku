import { SelectCteBuilder } from '@builders/abstracts/SelectCte'

/**
 * Query builder for SELECT operations with fluent interface.
 * @description Provides a fluent interface for building complex SELECT SQL queries with support for JOINs, WHERE conditions, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET, window functions, CTEs, and UNIONs.
 * @template T - Return type of query results
 */
export class SelectBuilder<T = unknown> extends SelectCteBuilder<T> {
  // All methods are implemented in the abstract classes
}
