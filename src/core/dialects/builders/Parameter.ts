/**
 * Parameter building utilities for database dialects.
 * @description Provides parameter handling methods for different database dialects and placeholder syntax.
 */
export class ParameterBuilders {
  /**
   * Adds a parameter to the params array and returns MySQL/SQLite placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns Parameter placeholder string
   */
  static addParam(value: unknown, params: unknown[]): string {
    params.push(value)
    return '?'
  }

  /**
   * Adds a parameter to the params array and returns PostgreSQL placeholder.
   * @param value - Value to add as parameter
   * @param params - Array to store parameters
   * @returns PostgreSQL parameter placeholder string
   */
  static addParamPostgres(value: unknown, params: unknown[]): string {
    params.push(value)
    return `$${params.length}`
  }
}
