import type {
  QuerySelect,
  QueryWhereCondition,
  QueryComparisonOperator,
  QueryDirectionType,
  QueryJoinType,
  QuerySubQuery
} from '@interfaces/index'
import { BaseQueryBuilder } from '@builders/Query'
import { QueryValidator } from '@core/security/index'

/**
 * Query builder for SELECT operations with fluent interface.
 * @template T - Return type of query results
 */
export class SelectBuilder<T = unknown> extends BaseQueryBuilder<T> {
  /** Internal query object that stores the SELECT query structure */
  private readonly query: QuerySelect = {}

  /**
   * Specifies columns to select from the table.
   * @param columns - Column names as individual parameters
   * @returns This builder instance for method chaining
   */
  select(...columns: string[]): this {
    this.query.columns = columns
    return this
  }

  /**
   * Selects all columns from the table.
   * @returns This builder instance for method chaining
   */
  selectAll(): this {
    this.query.columns = ['*']
    return this
  }

  /**
   * Adds DISTINCT clause to the query.
   * @returns This builder instance for method chaining
   */
  distinct(): this {
    this.query.distinct = true
    return this
  }

  /**
   * Specifies the table to select from.
   * @param table - Table name or subquery
   * @returns This builder instance for method chaining
   */
  from(table: string | QuerySubQuery | SelectBuilder): this {
    if (typeof table === 'string') {
      if (!table || table.trim() === '') {
        throw new Error('Table name cannot be empty')
      }
      this.query.from = table
    } else if (table instanceof SelectBuilder) {
      const subquery: QuerySubQuery = {
        query: table.toSQL(),
        params: table.toParams(),
        alias: 'subquery'
      }
      this.query.from = subquery
    } else {
      if (!table?.query) {
        throw new Error('Subquery cannot be empty')
      }
      this.query.from = table
    }
    return this
  }

  /**
   * Adds a WHERE condition to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  where(column: string, operator: QueryComparisonOperator, value: unknown): this
  /**
   * Adds a WHERE condition to the query.
   * @param condition - Complete WHERE condition object
   * @returns This builder instance for method chaining
   */
  where(condition: QueryWhereCondition): this
  /**
   * Adds a WHERE condition to the query.
   * @param column - Column name
   * @param value - Value to compare against (uses '=' operator)
   * @returns This builder instance for method chaining
   */
  where(column: string, value: unknown): this
  where(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): this {
    this.query.where ??= []
    if (typeof columnOrCondition === 'string') {
      if (typeof operatorOrValue === 'string') {
        this.validateOperator(operatorOrValue)
        this.query.where.push({
          column: columnOrCondition,
          operator: operatorOrValue,
          value: value ?? null
        })
      } else {
        this.query.where.push({
          column: columnOrCondition,
          operator: '=',
          value: operatorOrValue
        })
      }
    } else {
      this.query.where.push(columnOrCondition)
    }
    return this
  }

  /**
   * Adds an OR WHERE condition to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  orWhere(column: string, operator: QueryComparisonOperator, value: unknown): this
  /**
   * Adds an OR WHERE condition to the query.
   * @param condition - Complete WHERE condition object
   * @returns This builder instance for method chaining
   */
  orWhere(condition: QueryWhereCondition): this
  /**
   * Adds an OR WHERE condition to the query.
   * @param column - Column name
   * @param value - Value to compare against (uses '=' operator)
   * @returns This builder instance for method chaining
   */
  orWhere(column: string, value: unknown): this
  orWhere(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): this {
    this.query.where ??= []
    let condition: QueryWhereCondition
    if (typeof columnOrCondition === 'string') {
      if (typeof operatorOrValue === 'string') {
        condition = {
          column: columnOrCondition,
          operator: operatorOrValue,
          value: value ?? null,
          logical: 'OR'
        }
      } else {
        condition = {
          column: columnOrCondition,
          operator: '=',
          value: operatorOrValue,
          logical: 'OR'
        }
      }
    } else {
      condition = { ...columnOrCondition, logical: 'OR' }
    }
    this.query.where.push(condition)
    return this
  }

  /**
   * Adds an AND WHERE condition to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  andWhere(column: string, operator: QueryComparisonOperator, value: unknown): this
  /**
   * Adds an AND WHERE condition to the query.
   * @param condition - Complete WHERE condition object
   * @returns This builder instance for method chaining
   */
  andWhere(condition: QueryWhereCondition): this
  /**
   * Adds an AND WHERE condition to the query.
   * @param column - Column name
   * @param value - Value to compare against (uses '=' operator)
   * @returns This builder instance for method chaining
   */
  andWhere(column: string, value: unknown): this
  andWhere(
    columnOrCondition: string | QueryWhereCondition,
    operatorOrValue?: QueryComparisonOperator,
    value?: unknown
  ): this {
    this.query.where ??= []
    let condition: QueryWhereCondition
    if (typeof columnOrCondition === 'string') {
      if (typeof operatorOrValue === 'string') {
        condition = {
          column: columnOrCondition,
          operator: operatorOrValue,
          value: value ?? null,
          logical: 'AND'
        }
      } else {
        condition = {
          column: columnOrCondition,
          operator: '=',
          value: operatorOrValue,
          logical: 'AND'
        }
      }
    } else {
      condition = { ...columnOrCondition, logical: 'AND' }
    }
    this.query.where.push(condition)
    return this
  }

  /**
   * Adds an INNER JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  join(table: string, on: QueryWhereCondition[]): this {
    return this.addJoin('INNER', table, on)
  }

  /**
   * Adds an INNER JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  innerJoin(table: string, on: QueryWhereCondition[]): this {
    return this.addJoin('INNER', table, on)
  }

  /**
   * Adds a LEFT JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  leftJoin(table: string, on: QueryWhereCondition[]): this {
    return this.addJoin('LEFT', table, on)
  }

  /**
   * Adds a RIGHT JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  rightJoin(table: string, on: QueryWhereCondition[]): this {
    return this.addJoin('RIGHT', table, on)
  }

  /**
   * Adds a FULL JOIN to the query.
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  fullJoin(table: string, on: QueryWhereCondition[]): this {
    return this.addJoin('FULL', table, on)
  }

  /**
   * Adds a CROSS JOIN to the query.
   * @param table - Table to join
   * @returns This builder instance for method chaining
   */
  crossJoin(table: string): this {
    return this.addJoin('CROSS', table, [])
  }

  /**
   * Adds a join clause to the query.
   * @param type - Type of join
   * @param table - Table to join
   * @param on - Join conditions
   * @returns This builder instance for method chaining
   */
  private addJoin(type: QueryJoinType, table: string, on: QueryWhereCondition[]): this {
    this.query.joins ??= []
    this.query.joins.push({
      type,
      table,
      on
    })
    return this
  }

  /**
   * Adds a GROUP BY clause to the query.
   * @param columns - Columns to group by
   * @returns This builder instance for method chaining
   */
  groupBy(columns: string | string[]): this {
    this.query.groupBy = Array.isArray(columns) ? columns : [columns]
    return this
  }

  /**
   * Adds a HAVING clause to the query.
   * @param column - Column name
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This builder instance for method chaining
   */
  having(column: string, operator: QueryComparisonOperator, value: unknown): this {
    this.query.having ??= []
    this.query.having.push({
      column,
      operator,
      value
    })
    return this
  }

  /**
   * Adds an ORDER BY clause to the query.
   * @param column - Column to order by
   * @param direction - Sort direction
   * @returns This builder instance for method chaining
   */
  orderBy(column: string, direction: QueryDirectionType = 'ASC'): this {
    this.query.orderBy ??= []
    this.query.orderBy.push({
      column,
      direction
    })
    return this
  }

  /**
   * Adds a LIMIT clause to the query.
   * @param count - Number of rows to limit
   * @returns This builder instance for method chaining
   */
  limit(count: number): this {
    this.query.limit = count
    return this
  }

  /**
   * Adds an OFFSET clause to the query.
   * @param count - Number of rows to skip
   * @returns This builder instance for method chaining
   */
  offset(count: number): this {
    this.query.offset = count
    return this
  }

  /**
   * Builds the final SQL query and parameters.
   * @returns Object containing SQL string and parameters
   */
  protected buildQuery(): { sql: string; params: unknown[] } {
    QueryValidator.validateSelectQuery(this.query)
    const parts: string[] = []
    this.params = []
    this.buildSelectClause(parts)
    this.buildFromClause(parts)
    this.buildJoinClauses(parts)
    this.buildWhereClause(parts)
    this.buildGroupByClause(parts)
    this.buildHavingClause(parts)
    this.buildOrderByClause(parts)
    this.buildLimitClause(parts)
    this.buildOffsetClause(parts)
    return {
      sql: parts.join(' '),
      params: this.params
    }
  }

  /**
   * Builds the SELECT clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildSelectClause(parts: string[]): void {
    parts.push('SELECT')
    if (this.query.distinct === true) {
      parts.push('DISTINCT')
    }
    if (this.query.columns != null && this.query.columns.length > 0) {
      const columns: string = this.query.columns
        .map((col: string) => this.escapeColumnExpression(col))
        .join(', ')
      parts.push(columns)
    } else {
      parts.push('*')
    }
  }

  /**
   * Builds the FROM clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildFromClause(parts: string[]): void {
    if (this.query.from != null) {
      if (typeof this.query.from === 'string') {
        parts.push('FROM', this.escapeIdentifier(this.query.from))
      } else {
        const subquery: QuerySubQuery = this.query.from
        const alias: string = subquery.alias ?? 'subquery'
        parts.push('FROM', `(${subquery.query}) AS ${this.escapeIdentifier(alias)}`)
      }
    }
  }

  /**
   * Builds the JOIN clauses of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildJoinClauses(parts: string[]): void {
    if (this.query.joins != null) {
      for (const join of this.query.joins) {
        const tableName: string =
          typeof join.table === 'string' ? join.table : (join.table.alias ?? 'subquery')
        parts.push(join.type, 'JOIN', this.escapeIdentifier(tableName))
        if (join.on != null && join.on.length > 0) {
          parts.push('ON', this.buildWhereConditions(join.on))
        }
      }
    }
  }

  /**
   * Builds the WHERE clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildWhereClause(parts: string[]): void {
    if (this.query.where != null && this.query.where.length > 0) {
      parts.push('WHERE', this.buildWhereConditions(this.query.where))
    }
  }

  /**
   * Builds the GROUP BY clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildGroupByClause(parts: string[]): void {
    if (this.query.groupBy != null && this.query.groupBy.length > 0) {
      const columns: string = this.query.groupBy
        .map((col: string) => this.escapeIdentifier(col))
        .join(', ')
      parts.push('GROUP BY', columns)
    }
  }

  /**
   * Builds the HAVING clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildHavingClause(parts: string[]): void {
    if (this.query.having != null && this.query.having.length > 0) {
      parts.push('HAVING', this.buildWhereConditions(this.query.having))
    }
  }

  /**
   * Builds the ORDER BY clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildOrderByClause(parts: string[]): void {
    if (this.query.orderBy != null && this.query.orderBy.length > 0) {
      const orders: string = this.query.orderBy
        .map(
          (order: { column: string; direction: string }) =>
            `${this.escapeIdentifier(order.column)} ${order.direction}`
        )
        .join(', ')
      parts.push('ORDER BY', orders)
    }
  }

  /**
   * Builds the LIMIT clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildLimitClause(parts: string[]): void {
    if (this.query.limit != null && this.query.limit > 0) {
      parts.push('LIMIT', this.query.limit.toString())
    }
  }

  /**
   * Builds the OFFSET clause of the query.
   * @param parts - Array to append SQL parts to
   */
  private buildOffsetClause(parts: string[]): void {
    if (this.query.offset != null && this.query.offset > 0) {
      parts.push('OFFSET', this.query.offset.toString())
    }
  }

  /**
   * Builds WHERE conditions into SQL string.
   * @param conditions - Array of WHERE conditions
   * @returns SQL string for WHERE conditions
   */
  private buildWhereConditions(conditions: QueryWhereCondition[]): string {
    return conditions
      .map((condition: QueryWhereCondition, index: number) => {
        const column: string = this.escapeIdentifier(condition.column)
        const { operator }: { operator: QueryComparisonOperator } = condition
        const value: string = this.isColumnReference(condition.value)
          ? this.escapeIdentifier(condition.value as string)
          : this.addParam(condition.value)
        const logical: string = condition.logical ?? 'AND'
        if (index === 0) {
          return `${column} ${operator} ${value}`
        }
        return `${logical} ${column} ${operator} ${value}`
      })
      .join(' ')
  }

  /**
   * Checks if a value is a column reference (contains dot notation).
   * @param value - Value to check
   * @returns True if value is a column reference
   */
  private isColumnReference(value: unknown): boolean {
    return (
      typeof value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_.]*\.[a-zA-Z_][a-zA-Z0-9_.]*$/.test(value)
    )
  }

  /**
   * Escapes a column expression for SQL.
   * @param expression - Column expression to escape
   * @returns Escaped column expression
   */
  protected escapeColumnExpression(expression: string): string {
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
  private escapeFunctionExpression(expression: string): string {
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
            if (this.isValidIdentifier(expression)) {
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
  private isValidIdentifier(identifier: string): boolean {
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
   * Validates that the operator is supported.
   * @param operator - Operator to validate
   * @throws Error if operator is not supported
   */
  private validateOperator(operator: string): void {
    const validOperators: QueryComparisonOperator[] = [
      '=',
      '!=',
      '<>',
      '>',
      '<',
      '>=',
      '<=',
      'LIKE',
      'ILIKE',
      'NOT LIKE',
      'IN',
      'NOT IN',
      'BETWEEN',
      'NOT BETWEEN',
      'IS NULL',
      'IS NOT NULL',
      'EXISTS',
      'NOT EXISTS'
    ]
    if (!validOperators.includes(operator as QueryComparisonOperator)) {
      throw new Error(
        `Unsupported operator: ${operator}. Valid operators are: ${validOperators.join(', ')}`
      )
    }
  }
}
