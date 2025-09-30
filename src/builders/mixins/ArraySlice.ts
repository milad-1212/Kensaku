import type { QuerySelect, QueryArraySlice } from '@interfaces/index'

export class ArraySliceMixin {
  /**
   * Adds an array slice operation to the query.
   * @param query - Query object to modify
   * @param column - Column containing array data
   * @param start - Start index (1-based, inclusive)
   * @param end - End index (1-based, inclusive)
   * @param alias - Optional alias for the result
   */
  static addArraySlice(
    query: QuerySelect,
    column: string,
    start: number,
    end: number,
    alias?: string
  ): void {
    query.arraySlices ??= []
    const arraySlice: QueryArraySlice = {
      column,
      start,
      end,
      ...alias !== undefined && { alias }
    }
    query.arraySlices.push(arraySlice)
  }
}
