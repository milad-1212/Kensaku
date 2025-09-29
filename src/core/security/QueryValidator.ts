import type {
  QuerySelect,
  QueryInsert,
  QueryUpdate,
  QueryDelete,
  QueryWhereCondition,
  QueryJoinClause
} from '@interfaces/index'
import { SqlSanitizer } from '@core/security/index'

/**
 * Validates query structure and parameters for security and correctness.
 * @description Provides static methods to validate different types of SQL queries.
 */
export class QueryValidator {
  /**
   * Validates SELECT query structure and parameters.
   * @param query - The SELECT query object to validate
   * @returns True if validation passes
   * @throws {Error} When query structure is invalid
   */
  static validateSelectQuery(query: QuerySelect): boolean {
    if (query.from == null) {
      throw new Error('SELECT query must have a FROM clause')
    }
    if (query.columns !== undefined && Array.isArray(query.columns)) {
      query.columns.forEach((col: string) => {
        if (typeof col !== 'string') {
          throw new Error('Column names must be strings')
        }
        if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(col)) {
          SqlSanitizer.sanitizeIdentifier(col)
        }
      })
    }
    if (query.where != null) {
      this.validateWhereConditions(query.where)
    }
    if (query.joins !== undefined) {
      this.validateJoins(query.joins)
    }
    return true
  }

  /**
   * Validates INSERT query structure and parameters.
   * @param query - The INSERT query object to validate
   * @returns True if validation passes
   * @throws {Error} When query structure is invalid
   */
  static validateInsertQuery(query: QueryInsert): boolean {
    if (query.into == null) {
      throw new Error('INSERT query must have an INTO clause')
    }
    SqlSanitizer.sanitizeIdentifier(query.into)
    if (query.values == null || (Array.isArray(query.values) && query.values.length === 0)) {
      throw new Error('INSERT query must have values')
    }
    if (query.returning != null) {
      query.returning.forEach((col: string) => {
        SqlSanitizer.sanitizeIdentifier(col)
      })
    }
    return true
  }

  /**
   * Validates UPDATE query structure and parameters.
   * @param query - The UPDATE query object to validate
   * @returns True if validation passes
   * @throws {Error} When query structure is invalid
   */
  static validateUpdateQuery(query: QueryUpdate): boolean {
    if (query.table == null) {
      throw new Error('UPDATE query must have a table')
    }
    SqlSanitizer.sanitizeIdentifier(query.table)
    if (query.set == null || Object.keys(query.set).length === 0) {
      throw new Error('UPDATE query must have SET clause')
    }
    if (query.where != null) {
      this.validateWhereConditions(query.where)
    }
    if (query.returning != null) {
      query.returning.forEach((col: string) => {
        SqlSanitizer.sanitizeIdentifier(col)
      })
    }
    return true
  }

  /**
   * Validates DELETE query structure and parameters.
   * @param query - The DELETE query object to validate
   * @returns True if validation passes
   * @throws {Error} When query structure is invalid
   */
  static validateDeleteQuery(query: QueryDelete): boolean {
    if (query.from == null) {
      throw new Error('DELETE query must have a FROM clause')
    }
    SqlSanitizer.sanitizeIdentifier(query.from)
    if (query.where != null) {
      this.validateWhereConditions(query.where)
    }
    if (query.returning != null) {
      query.returning.forEach((col: string) => {
        SqlSanitizer.sanitizeIdentifier(col)
      })
    }
    return true
  }

  /**
   * Validates WHERE conditions for security and correctness.
   * @param conditions - Array of WHERE conditions to validate
   * @throws {Error} When conditions are invalid
   */
  private static validateWhereConditions(conditions: QueryWhereCondition[]): void {
    conditions.forEach((condition: QueryWhereCondition) => {
      if (condition.column == null || typeof condition.column !== 'string') {
        throw new Error('WHERE condition must have a valid column name')
      }
      SqlSanitizer.sanitizeIdentifier(condition.column)
      if (condition.operator == null) {
        throw new Error('WHERE condition must have an operator')
      }
      if (
        condition.value === undefined &&
        !['IS NULL', 'IS NOT NULL'].includes(condition.operator)
      ) {
        throw new Error('WHERE condition must have a value')
      }
    })
  }

  /**
   * Validates JOIN clauses for security and correctness.
   * @param joins - Array of JOIN clauses to validate
   * @throws {Error} When joins are invalid
   */
  private static validateJoins(joins: QueryJoinClause[]): void {
    joins.forEach((join: QueryJoinClause) => {
      if (join.table == null) {
        throw new Error('JOIN must have a table')
      }
      if (typeof join.table === 'string') {
        SqlSanitizer.sanitizeIdentifier(join.table)
      }
      if (join.on == null || !Array.isArray(join.on)) {
        throw new Error('JOIN must have ON conditions')
      }
      this.validateWhereConditions(join.on)
    })
  }
}
