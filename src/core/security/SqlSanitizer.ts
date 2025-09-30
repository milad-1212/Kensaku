import type { DatabaseType, QueryStatement } from '@interfaces/index'
import {
  errorMessages,
  getInvalidIdentifierError,
  getInvalidFunctionParameterError
} from '@constants/index'

/**
 * SQL sanitization utilities for preventing injection attacks.
 * @description Provides static methods to sanitize SQL identifiers, values, and queries.
 */
export class SqlSanitizer {
  /**
   * Sanitizes a SQL identifier to prevent injection attacks.
   * @param identifier - The identifier to sanitize
   * @returns Sanitized identifier
   * @throws {Error} When identifier is invalid or contains dangerous characters
   */
  static sanitizeIdentifier(identifier: string): string {
    if (!identifier || typeof identifier !== 'string') {
      throw new Error(errorMessages.VALIDATION.INVALID_IDENTIFIER)
    }
    if (identifier.includes('(') && identifier.includes(')')) {
      const functionMatch: RegExpExecArray | null =
        /^([a-zA-Z_]\w{0,30})\s*\(([^)]{0,100})\)$/.exec(identifier)
      if (functionMatch) {
        const [, funcName, params]: string[] = functionMatch as string[]
        const sanitizedParams: string = (params ?? '')
          .split(',')
          .map((param: string) => {
            const trimmed: string = param.trim()
            if (trimmed === '*') {
              return '*'
            }
            if (
              this.isValidIdentifier(trimmed) ||
              this.isComplexExpression(trimmed) ||
              this.isComplexParameter(trimmed)
            ) {
              return trimmed
            }
            throw new Error(getInvalidFunctionParameterError(trimmed))
          })
          .join(', ')
        return `${funcName}(${sanitizedParams})`
      }
    }
    if (this.isComplexExpression(identifier)) {
      return identifier
    }
    const sanitized: string = identifier.replace(/[^a-zA-Z0-9_.() ]/g, '')
    if (sanitized !== identifier) {
      throw new Error(getInvalidIdentifierError(identifier))
    }
    return sanitized
  }

  /**
   * Checks if a string is a complex SQL expression.
   * @param expression - The expression to check
   * @returns True if it's a complex expression
   */
  private static isComplexExpression(expression: string): boolean {
    const complexPatterns: RegExp[] = [
      /^EXTRACT\([^)]+\)$/i,
      /^DATE\([^)]+\)$/i,
      /^COUNT\([^)]*\)$/i,
      /^AVG\([^)]+\)$/i,
      /^SUM\([^)]+\)$/i,
      /^MAX\([^)]+\)$/i,
      /^MIN\([^)]+\)$/i,
      /^CASE\s+WHEN.*END$/i,
      /^[A-Z_]+\([^)]+\)$/i,
      /^[A-Z_]+\s+FROM\s+[A-Z_]+$/i
    ]
    return complexPatterns.some((pattern: RegExp) => pattern.test(expression))
  }

  /**
   * Sanitizes a value to prevent SQL injection.
   * @param value - The value to sanitize
   * @returns Sanitized value
   */
  static sanitizeValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return null
    }
    if (typeof value === 'string') {
      return value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\'\'')
        .replace(/"/g, '""')
        .replace(/\0/g, '')
        .split('')
        .filter((char: string) => {
          const code: number = char.charCodeAt(0)
          return code >= 32 && code !== 127
        })
        .join('')
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value
    }
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (Array.isArray(value)) {
      return value.map((v: unknown) => this.sanitizeValue(v))
    }
    if (typeof value === 'object' && value != null) {
      const jsonString: string = JSON.stringify(value)
      return jsonString
    }
    if (typeof value === 'symbol' || typeof value === 'bigint') {
      return String(value)
    }
    return String(value as string | number | boolean | symbol | bigint)
  }

  /**
   * Validates if a string is a valid SQL identifier.
   * @param identifier - The identifier to validate
   * @returns True if valid, false otherwise
   */
  private static isValidIdentifier(identifier: string): boolean {
    if (!identifier || identifier.length > 63) {
      return false
    }
    const parts: string[] = identifier.split('.')
    if (parts.length > 2 || parts.length === 0) {
      return false
    }
    for (const part of parts) {
      if (!part || part.length > 30) {
        return false
      }
      const firstChar: string | undefined = part[0]
      if (firstChar == null || !/[a-zA-Z_]/.test(firstChar)) {
        return false
      }
      for (let i: number = 0; i < part.length; i++) {
        const char: string | undefined = part[i]
        if (char == null || !/\w/.test(char)) {
          return false
        }
      }
    }
    return true
  }

  /**
   * Escapes special characters in LIKE patterns.
   * @param pattern - The LIKE pattern to escape
   * @returns Escaped pattern string
   */
  static escapeLikePattern(pattern: string): string {
    return pattern.replace(/[%_\\]/g, '\\$&')
  }

  /**
   * Builds a parameterized query with sanitized parameters.
   * @param sql - The SQL query string
   * @param params - Array of parameters to sanitize
   * @returns Object containing SQL and sanitized parameters
   */
  static buildParameterizedQuery(sql: string, params: unknown[]): QueryStatement {
    return {
      sql,
      params: params.map((param: unknown) => this.sanitizeValue(param))
    }
  }

  /**
   * Sanitizes a value for a specific database type.
   * @param value - The value to sanitize
   * @param databaseType - The target database type
   * @returns Database-specific sanitized value
   */
  static sanitizeForDatabase(value: unknown, databaseType: DatabaseType): unknown {
    const sanitized: unknown = this.sanitizeValue(value)
    if (typeof sanitized === 'string') {
      switch (databaseType) {
        case 'postgres':
          return sanitized.replace(/\$/g, '$$$$')
        case 'mysql':
          return sanitized.replace(/`/g, '``')
        case 'sqlite':
          return sanitized.replace(/"/g, '""')
        default:
          return sanitized
      }
    }
    return sanitized
  }

  /**
   * Validates if an identifier is safe to use.
   * @param identifier - The identifier to validate
   * @returns True if identifier is valid, false otherwise
   */
  static validateIdentifier(identifier: string): boolean {
    if (!identifier || typeof identifier !== 'string') {
      return false
    }
    if (identifier.length > 100) {
      return false
    }
    if (identifier.includes('(') && identifier.includes(')')) {
      const functionMatch: RegExpExecArray | null =
        /^([a-zA-Z_]\w{0,30})\s*\(([^)]{0,100})\)$/.exec(identifier)
      if (functionMatch) {
        const [, , params]: string[] = functionMatch as string[]
        if (params === '*') {
          return true
        }
        const paramList: string[] = (params ?? '').split(',')
        if (paramList.length > 10) {
          return false
        }
        return paramList.every((param: string) => {
          const trimmed: string = param.trim()
          if (trimmed.length > 50) {
            return false
          }
          return this.isValidIdentifier(trimmed) || trimmed === '*'
        })
      }
    }
    return this.isValidIdentifier(identifier)
  }

  /**
   * Checks if a string is a complex SQL parameter.
   * @param parameter - The parameter to check
   * @returns True if it's a complex parameter
   */
  private static isComplexParameter(parameter: string): boolean {
    if (/^\d+$/.test(parameter)) {
      return true
    }
    const complexParamPatterns: RegExp[] = [
      /^[A-Z_]+\s+FROM\s+[a-z]\w*$/i,
      /^[A-Z_]+\s+FROM\s+[a-z]\w*\.[a-z]\w*$/i
    ]
    return complexParamPatterns.some((pattern: RegExp) => pattern.test(parameter))
  }
}
