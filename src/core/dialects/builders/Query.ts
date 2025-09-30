import type {
  QueryAggregationExpression,
  QueryConditionalExpression,
  QueryComparisonOperator,
  QuerySelect,
  QueryWhereCondition,
  QueryWindowFunction
} from '@interfaces/index'

/**
 * Core query building utilities for database dialects.
 * @description Provides common query building methods that are shared across all database dialects.
 */
export class QueryBuilders {
  /**
   * Escapes a database identifier.
   * @param name - Identifier to escape
   * @param escapeFn - Dialect-specific escape function
   * @returns Escaped identifier string
   */
  private static escapeIdentifier(name: string, escapeFn: (name: string) => string): string {
    return escapeFn(name)
  }

  /**
   * Builds the SELECT clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildSelectClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    parts.push('SELECT')
    if (query.distinct === true) {
      parts.push('DISTINCT')
    }
    const selectParts: string[] = []
    if (query.columns !== undefined && query.columns.length > 0) {
      const columns: string = query.columns
        .map((col: string) => this.escapeIdentifier(col, escapeFn))
        .join(', ')
      selectParts.push(columns)
    } else if (query.aggregations === undefined || query.aggregations.length === 0) {
      selectParts.push('*')
    }
    if (query.aggregations !== undefined && query.aggregations.length > 0) {
      const aggregations: string = query.aggregations
        .map((agg: QueryAggregationExpression): string => {
          let sql: string
          if (agg.function === 'PERCENTILE_CONT' || agg.function === 'PERCENTILE_DISC') {
            const percentile: number = agg.percentile ?? 0.5
            sql = `${agg.function}(${percentile}) WITHIN GROUP (ORDER BY ${this.escapeIdentifier(agg.column, escapeFn)})`
          } else {
            sql = `${agg.function}(${agg.distinct === true ? 'DISTINCT ' : ''}${this.escapeIdentifier(agg.column, escapeFn)})`
          }

          if (agg.alias !== undefined) {
            sql += ` AS ${this.escapeIdentifier(agg.alias, escapeFn)}`
          }
          return sql
        })
        .join(', ')
      selectParts.push(aggregations)
    }
    if (query.windowFunctions !== undefined && query.windowFunctions.length > 0) {
      const windowFunctions: string = query.windowFunctions
        .map((wf: QueryWindowFunction): string => {
          const args: string = wf.args != null ? `(${wf.args.join(', ')})` : '()'
          let windowSpec: string = ''
          if (wf.over !== undefined) {
            windowSpec = this.buildWindowSpec(wf.over, escapeFn)
          }
          return `${wf.function}${args}${windowSpec}`
        })
        .join(', ')
      selectParts.push(windowFunctions)
    }
    if (query.conditionals !== undefined && query.conditionals.length > 0) {
      const conditionalExpressions: string = query.conditionals
        .map((expr: QueryConditionalExpression): string => {
          if (expr.type === 'CASE') {
            let sql: string = 'CASE'
            if (expr.case !== undefined) {
              for (const caseExpr of expr.case) {
                sql += ` WHEN ${caseExpr.when} THEN ${caseExpr.then}`
              }
            }
            sql += ' END'
            if (expr.alias !== undefined) {
              sql += ` AS ${this.escapeIdentifier(expr.alias, escapeFn)}`
            }
            return sql
          } else if (expr.type === 'COALESCE') {
            const values: string =
              expr.columns
                ?.map((v: string): string => this.escapeIdentifier(v, escapeFn))
                .join(', ') ?? ''
            return `COALESCE(${values})`
          } else if (expr.type === 'NULLIF') {
            return `NULLIF(${this.escapeIdentifier(expr.column1 ?? '', escapeFn)}, ${this.escapeIdentifier(expr.column2 ?? '', escapeFn)})`
          }
          return ''
        })
        .filter((sql: string): boolean => sql.length > 0)
        .join(', ')
      if (conditionalExpressions.length > 0) {
        selectParts.push(conditionalExpressions)
      }
    }
    if (selectParts.length > 0) {
      parts.push(selectParts.join(', '))
    } else {
      parts.push('*')
    }
  }

  /**
   * Builds the FROM clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildFromClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.from !== undefined) {
      const fromTable: string =
        typeof query.from === 'string' ? query.from : query.from.alias ?? 'subquery'
      parts.push('FROM', this.escapeIdentifier(fromTable, escapeFn))
    }
  }

  /**
   * Builds JOIN clauses for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildJoinClauses(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.joins !== undefined) {
      for (const join of query.joins) {
        const tableName: string =
          typeof join.table === 'string' ? join.table : join.table.alias ?? 'subquery'
        parts.push(join.type, 'JOIN', this.escapeIdentifier(tableName, escapeFn))
        if (join.on != null && join.on.length > 0) {
          parts.push('ON', this.buildJoinConditions(join.on, escapeFn))
        }
      }
    }
  }

  /**
   * Builds JOIN conditions into SQL string.
   * @param conditions - Array of JOIN conditions
   * @param escapeFn - Dialect-specific escape function
   * @returns SQL string for JOIN conditions
   */
  static buildJoinConditions(
    conditions: QueryWhereCondition[],
    escapeFn: (name: string) => string
  ): string {
    return conditions
      .map((condition: QueryWhereCondition, index: number) => {
        const column: string = escapeFn(condition.column)
        const { operator }: { operator: QueryComparisonOperator } = condition
        const value: string =
          typeof condition.value === 'string' && this.isColumnReference(condition.value)
            ? escapeFn(condition.value)
            : String(condition.value)
        const logical: string = condition.logical ?? 'AND'
        if (index === 0) {
          return `${column} ${operator} ${value}`
        }
        return `${logical} ${column} ${operator} ${value}`
      })
      .join(' ')
  }

  /**
   * Checks if a value is a column reference (contains a dot or is a simple identifier).
   * @param value - Value to check
   * @returns True if the value appears to be a column reference
   */
  private static isColumnReference(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false
    }
    return value.includes('.') || /^\w+$/.test(value)
  }

  /**
   * Builds the WHERE clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   * @param buildWhereConditionsFn - Dialect-specific WHERE conditions builder
   */
  static buildWhereClause(
    query: QuerySelect,
    parts: string[],
    params: unknown[],
    buildWhereConditionsFn: (conditions: QueryWhereCondition[], params: unknown[]) => string
  ): void {
    if (query.where !== undefined && query.where.length > 0) {
      parts.push('WHERE', buildWhereConditionsFn(query.where, params))
    }
  }

  /**
   * Builds the GROUP BY clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildGroupByClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.groupBy !== undefined && query.groupBy.length > 0) {
      const columns: string = query.groupBy
        .map((col: string) => this.escapeIdentifier(col, escapeFn))
        .join(', ')
      parts.push('GROUP BY', columns)
    }
  }

  /**
   * Builds the HAVING clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   * @param buildWhereConditionsFn - Dialect-specific WHERE conditions builder
   */
  static buildHavingClause(
    query: QuerySelect,
    parts: string[],
    params: unknown[],
    buildWhereConditionsFn: (conditions: QueryWhereCondition[], params: unknown[]) => string
  ): void {
    if (query.having !== undefined && query.having.length > 0) {
      parts.push('HAVING', buildWhereConditionsFn(query.having, params))
    }
  }

  /**
   * Builds the ORDER BY clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildOrderByClause(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string,
    params: unknown[]
  ): void {
    if (query.orderBy !== undefined && query.orderBy.length > 0) {
      const orders: string = query.orderBy
        .map(
          (order: {
            /** Column name to order by */
            column: string
            /** Sort direction (ASC/DESC) */
            direction: string
            /** Whether this is a raw expression */
            isExpression?: boolean
            /** Parameters for raw expressions */
            params?: unknown[]
          }) => {
            const column: string =
              order.isExpression === true
                ? order.column
                : this.escapeIdentifier(order.column, escapeFn)
            if (order.params && order.params.length > 0) {
              params.push(...order.params)
            }
            return `${column} ${order.direction}`
          }
        )
        .join(', ')
      parts.push('ORDER BY', orders)
    }
  }

  /**
   * Builds the LIMIT clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  static buildLimitClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    if (query.limitRaw !== undefined) {
      parts.push('LIMIT', query.limitRaw.sql)
      params.push(...query.limitRaw.params)
    } else if (query.limit !== undefined && query.limit > 0) {
      parts.push('LIMIT', query.limit.toString())
    }
  }

  /**
   * Builds the OFFSET clause for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   */
  static buildOffsetClause(query: QuerySelect, parts: string[], params: unknown[]): void {
    if (query.offsetRaw !== undefined) {
      parts.push('OFFSET', query.offsetRaw.sql)
      params.push(...query.offsetRaw.params)
    } else if (query.offset !== undefined && query.offset > 0) {
      parts.push('OFFSET', query.offset.toString())
    }
  }

  /**
   * Builds window functions for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildWindowFunctions(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.windowFunctions !== undefined && query.windowFunctions.length > 0) {
      const windowFunctions: string[] = query.windowFunctions.map((wf: QueryWindowFunction) => {
        const args: string = wf.args != null ? `(${wf.args.join(', ')})` : '()'
        let windowSpec: string = ''
        if (wf.over !== undefined) {
          windowSpec = this.buildWindowSpec(wf.over, escapeFn)
        }
        return `${wf.function}${args}${windowSpec}`
      })
      parts.push(',', windowFunctions.join(', '))
    }
  }

  /**
   * Builds conditional expressions for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param escapeFn - Dialect-specific escape function
   */
  static buildConditionalExpressions(
    query: QuerySelect,
    parts: string[],
    escapeFn: (name: string) => string
  ): void {
    if (query.conditionals !== undefined && query.conditionals.length > 0) {
      const conditionals: string[] = query.conditionals.map((cond: QueryConditionalExpression) => {
        let expression: string = ''
        switch (cond.type) {
          case 'CASE':
            expression = this.buildCaseExpression(cond.case ?? [])
            break
          case 'COALESCE':
            expression = `COALESCE(${cond.columns?.map((col: string) => escapeFn(col)).join(', ') ?? ''})`
            break
          case 'NULLIF':
            expression = `NULLIF(${escapeFn(String(cond.column1 ?? ''))}, ${escapeFn(String(cond.column2 ?? ''))})`
            break
        }
        return cond.alias != null ? `${expression} AS ${escapeFn(String(cond.alias))}` : expression
      })
      parts.push(',', conditionals.join(', '))
    }
  }

  /**
   * Builds set operations (UNION, INTERSECT, EXCEPT) for any dialect.
   * @param query - SELECT query object
   * @param parts - Array to store SQL parts
   * @param params - Array to store query parameters
   * @param escapeFn - Dialect-specific escape function
   * @param buildSelectQueryFn - Dialect-specific SELECT query builder
   */
  static buildSetOperations(
    query: QuerySelect,
    parts: string[],
    params: unknown[],
    _escapeFn: (name: string) => string,
    buildSelectQueryFn: (query: QuerySelect) => { sql: string; params: unknown[] }
  ): void {
    if (query.unions !== undefined && query.unions.length > 0) {
      for (const union of query.unions) {
        const { sql, params: unionParams }: { sql: string; params: unknown[] } = buildSelectQueryFn(
          union.query
        )
        parts.push(union.type, sql)
        params.push(...unionParams)
      }
    }
  }

  /**
   * Builds window specification for any dialect.
   * @param spec - Window specification
   * @param escapeFn - Dialect-specific escape function
   * @returns Window specification SQL string
   */
  private static buildWindowSpec(
    spec: {
      partitionBy?: string[]
      orderBy?: { column: string; direction: string }[]
      frame?: { type: string; start: string | number; end?: string | number; exclude?: string }
    },
    escapeFn: (name: string) => string
  ): string {
    let windowSpec: string = 'OVER ('
    if (spec.partitionBy !== undefined && spec.partitionBy.length > 0) {
      windowSpec += `PARTITION BY ${spec.partitionBy.map((col: string) => escapeFn(col)).join(', ')}`
    }
    if (spec.orderBy !== undefined && spec.orderBy.length > 0) {
      if (spec.partitionBy !== undefined && spec.partitionBy.length > 0) {
        windowSpec += ' '
      }
      const orderByClause: string = spec.orderBy
        .map(
          (ob: { column: string; direction: string }) => `${escapeFn(ob.column)} ${ob.direction}`
        )
        .join(', ')
      windowSpec += `ORDER BY ${orderByClause}`
    }
    if (spec.frame !== undefined) {
      if (spec.partitionBy !== undefined || spec.orderBy !== undefined) {
        windowSpec += ' '
      }
      windowSpec += this.buildWindowFrame(
        spec.frame as {
          type: string
          start: string | number
          end?: string | number
          exclude?: string
        }
      )
    }
    windowSpec += ')'
    return windowSpec
  }

  /**
   * Builds window frame specification.
   * @param frame - Window frame specification
   * @returns Window frame SQL string
   */
  private static buildWindowFrame(frame: {
    type: string
    start: string | number
    end?: string | number
    exclude?: string
  }): string {
    let frameSpec: string = `${frame.type}`
    frameSpec += ` ${frame.start}`
    if (frame.end !== undefined) {
      frameSpec += ` AND ${frame.end}`
    }
    if (frame.exclude !== undefined) {
      frameSpec += ` EXCLUDE ${frame.exclude}`
    }
    return frameSpec
  }

  /**
   * Builds CASE expression.
   * @param cases - Array of CASE expressions
   * @param escapeFn - Dialect-specific escape function
   * @returns CASE expression SQL string
   */
  private static buildCaseExpression(
    cases: { when: string; then: string | number; else?: string | number }[]
  ): string {
    let caseExpr: string = 'CASE'
    for (const caseItem of cases) {
      caseExpr += ` WHEN ${caseItem.when} THEN ${caseItem.then}`
    }
    if (cases.length > 0 && cases[cases.length - 1]?.else !== undefined) {
      caseExpr += ` ELSE ${cases[cases.length - 1]?.else}`
    }
    caseExpr += ' END'
    return caseExpr
  }
}
