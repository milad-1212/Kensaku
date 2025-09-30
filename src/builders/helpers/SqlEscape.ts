import { SqlSanitizer } from '@core/security/index'
import type { DatabaseType, QueryStatement } from '@interfaces/index'

/**
 * Helper class for SQL escaping and sanitization.
 * @description Provides centralized methods for escaping SQL identifiers, expressions, and parameters.
 */
export class SqlEscapeHelper {
  /**
   * Escapes a SQL identifier to prevent injection.
   * @param identifier - Identifier to escape
   * @returns Escaped identifier string
   */
  static escapeIdentifier(identifier: string): string {
    return SqlSanitizer.sanitizeIdentifier(identifier)
  }

  /**
   * Escapes a column expression for SQL (handles aliases and functions).
   * @param expression - Column expression to escape
   * @returns Escaped column expression
   */
  static escapeColumnExpression(expression: string): string {
    const asIndex: number = expression.toLowerCase().indexOf(' as ')
    if (asIndex > 0) {
      const expr: string = expression.substring(0, asIndex).trim()
      const alias: string = expression.substring(asIndex + 4).trim()
      return `${this.escapeFunctionExpression(expr)} AS ${this.escapeIdentifier(alias)}`
    } else {
      return this.escapeFunctionExpression(expression)
    }
  }

  /**
   * Escapes a function expression for SQL.
   * @param expression - Function expression to escape
   * @returns Escaped function expression
   */
  static escapeFunctionExpression(expression: string): string {
    if (expression.includes('(') && expression.includes(')')) {
      const functionMatch: RegExpExecArray | null =
        /^([a-zA-Z_]\w{1,30})\s*\(([^)]{1,100})\)$/.exec(expression)
      if (functionMatch) {
        const [, funcName, params]: string[] = functionMatch as string[]
        const escapedParams: string = (params ?? '')
          .split(',')
          .map((param: string) => {
            const trimmed: string = param.trim()
            if (trimmed === '*') {
              return '*'
            }
            if (this.isValidIdentifier(trimmed)) {
              return this.escapeIdentifier(trimmed)
            }
            return trimmed
          })
          .join(', ')
        return `${funcName}(${escapedParams})`
      }
    }
    if (this.isValidIdentifier(expression)) {
      return this.escapeIdentifier(expression)
    }
    return expression
  }

  /**
   * Validates if the identifier is a valid SQL identifier.
   * @param identifier - Identifier to validate
   * @returns True if identifier is valid
   */
  static isValidIdentifier(identifier: string): boolean {
    const partRegex: RegExp = /^[a-zA-Z_]\w{0,29}$/
    const parts: string[] = identifier.split('.')
    if (parts.length > 2 || parts.length === 0) {
      return false
    }
    for (const part of parts) {
      if (!partRegex.test(part)) {
        return false
      }
    }
    return true
  }

  /**
   * Adds a parameter to the query and returns its placeholder.
   * @param value - Parameter value to add
   * @param params - Array to add parameter to
   * @returns Parameter placeholder string
   */
  static addParam(value: unknown, params: unknown[]): string {
    params.push(SqlSanitizer.sanitizeValue(value))
    return `$${params.length}`
  }

  /**
   * Adds a database-specific sanitized parameter to the query.
   * @param value - Parameter value to add
   * @param params - Array to add parameter to
   * @param databaseType - Target database type for sanitization
   * @returns Parameter placeholder string
   */
  static addDatabaseParam(value: unknown, params: unknown[], databaseType: DatabaseType): string {
    const sanitizedValue: unknown = SqlSanitizer.sanitizeForDatabase(value, databaseType)
    params.push(sanitizedValue)
    return `$${params.length}`
  }

  /**
   * Escapes LIKE pattern for safe searching.
   * @param pattern - LIKE pattern to escape
   * @returns Escaped pattern string
   */
  static escapeLikePattern(pattern: string): string {
    return SqlSanitizer.escapeLikePattern(pattern)
  }

  /**
   * Validates if an identifier is safe to use.
   * @param identifier - The identifier to validate
   * @returns True if identifier is valid
   */
  static validateIdentifier(identifier: string): boolean {
    return SqlSanitizer.validateIdentifier(identifier)
  }

  /**
   * Builds a parameterized query with sanitized parameters.
   * @param sql - The SQL query string
   * @param params - Array of parameters to sanitize
   * @returns Object containing SQL and sanitized parameters
   */
  static buildParameterizedQuery(sql: string, params: unknown[]): QueryStatement {
    return SqlSanitizer.buildParameterizedQuery(sql, params)
  }

  /**
   * Escapes multiple identifiers and joins them with commas.
   * @param identifiers - Array of identifiers to escape
   * @returns Comma-separated escaped identifiers
   */
  static escapeIdentifierList(identifiers: string[]): string {
    return identifiers.map((id: string) => this.escapeIdentifier(id)).join(', ')
  }

  /**
   * Escapes multiple column expressions and joins them with commas.
   * @param expressions - Array of column expressions to escape
   * @returns Comma-separated escaped column expressions
   */
  static escapeColumnExpressionList(expressions: string[]): string {
    return expressions.map((expr: string) => this.escapeColumnExpression(expr)).join(', ')
  }
}
