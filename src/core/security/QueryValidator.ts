import type {
  QuerySelect,
  QueryInsert,
  QueryUpdate,
  QueryDelete,
  QueryWhereCondition,
  QueryJoinClause
} from '@interfaces/index'
import { SqlSanitizer } from '@core/security/index'
import {
  errorMessages,
  getInvalidColumnAliasError,
  getInvalidColumnAliasFormatError,
  getInvalidColumnNameError
} from '@constants/index'

/**
 * Validates query structure and parameters for security and correctness.
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
      throw new Error(errorMessages.QUERY.SELECT_MISSING_FROM)
    }
    if (query.columns !== undefined && Array.isArray(query.columns)) {
      query.columns.forEach((col: string) => {
        if (typeof col !== 'string') {
          throw new Error(errorMessages.WHERE.COLUMN_NAMES_MUST_BE_STRINGS)
        }
        if (col === '*') {
          // Allow wildcard column
        } else if (col.includes(' as ')) {
          const [columnPart, aliasPart]: string[] = col.split(' as ')
          if (columnPart != null && aliasPart != null) {
            const cleanAlias: string = aliasPart.trim()
            if (SqlSanitizer.validateIdentifier(cleanAlias)) {
              SqlSanitizer.sanitizeIdentifier(cleanAlias)
            } else {
              throw new Error(getInvalidColumnAliasError(cleanAlias))
            }
          } else {
            throw new Error(getInvalidColumnAliasFormatError(col))
          }
        } else if (SqlSanitizer.validateIdentifier(col)) {
          SqlSanitizer.sanitizeIdentifier(col)
        } else {
          throw new Error(getInvalidColumnNameError(col))
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
      throw new Error(errorMessages.QUERY.INSERT_MISSING_INTO)
    }
    SqlSanitizer.sanitizeIdentifier(query.into)
    if (query.values == null || (Array.isArray(query.values) && query.values.length === 0)) {
      throw new Error(errorMessages.QUERY.INSERT_MISSING_VALUES)
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
      throw new Error(errorMessages.QUERY.UPDATE_MISSING_TABLE)
    }
    SqlSanitizer.sanitizeIdentifier(query.table)
    if (query.set == null || Object.keys(query.set).length === 0) {
      throw new Error(errorMessages.QUERY.UPDATE_MISSING_SET)
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
      throw new Error(errorMessages.QUERY.DELETE_MISSING_FROM)
    }
    SqlSanitizer.sanitizeIdentifier(query.from)
    if (query.where == null || query.where.length === 0) {
      throw new Error(errorMessages.QUERY.DELETE_MISSING_WHERE)
    }
    this.validateWhereConditions(query.where)
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
      if (condition.operator === 'RAW') {
        if (condition.column == null || typeof condition.column !== 'string') {
          throw new Error(errorMessages.WHERE.INVALID_RAW_CONDITION)
        }
        return
      }
      if (condition.column == null || typeof condition.column !== 'string') {
        throw new Error(errorMessages.WHERE.INVALID_COLUMN_NAME)
      }
      SqlSanitizer.sanitizeIdentifier(condition.column)
      if (condition.operator == null) {
        throw new Error(errorMessages.WHERE.INVALID_OPERATOR)
      }
      if (
        condition.value === undefined &&
        !['IS NULL', 'IS NOT NULL'].includes(condition.operator)
      ) {
        throw new Error(errorMessages.WHERE.INVALID_VALUE)
      }
      if (condition.value === '' && condition.operator === '=') {
        return
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
        throw new Error(errorMessages.JOIN.MISSING_TABLE)
      }
      if (typeof join.table === 'string') {
        SqlSanitizer.sanitizeIdentifier(join.table)
      }
      if (
        join.type !== 'CROSS' &&
        (join.on == null || !Array.isArray(join.on) || join.on.length === 0)
      ) {
        throw new Error(errorMessages.JOIN.MISSING_ON_CONDITIONS)
      }
      if (join.on != null && Array.isArray(join.on) && join.on.length > 0) {
        this.validateWhereConditions(join.on)
      }
    })
  }
}
