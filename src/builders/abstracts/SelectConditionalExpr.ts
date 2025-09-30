import type { QueryCaseExpression, QueryComparisonOperator } from '@interfaces/index'
import { SelectAggregationBuilder } from '@builders/abstracts/SelectAggregation'
import { ConditionalMixin } from '@builders/mixins/index'

/**
 * Abstract class for SELECT query building with conditional expressions.
 * @description Extends SelectAggregationBuilder with CASE, COALESCE, and NULLIF functionality.
 * @template T - Return type of query results
 */
export abstract class SelectConditionalExprBuilder<
  T = unknown
> extends SelectAggregationBuilder<T> {
  /**
   * Adds a CASE expression to the query.
   * @param cases - Array of case conditions and values
   * @param elseValue - Optional else value
   * @param alias - Optional alias for the expression
   * @returns This builder instance for method chaining
   */
  caseWhen(cases: QueryCaseExpression[], elseValue?: string | number, alias?: string): this {
    ConditionalMixin.addCase(this.query, cases, elseValue, alias)
    return this
  }

  /**
   * Adds a COALESCE expression to the query.
   * @param columns - Array of columns to coalesce or individual columns
   * @param alias - Optional alias for the expression
   * @returns This builder instance for method chaining
   */
  coalesce(columns: string[] | string, ...moreColumns: string[]): this {
    const columnArray: string[] = Array.isArray(columns) ? columns : [columns, ...moreColumns]
    ConditionalMixin.addCoalesce(this.query, columnArray)
    return this
  }

  /**
   * Adds a NULLIF expression to the query.
   * @param column1 - First column to compare
   * @param column2 - Second column to compare
   * @param alias - Optional alias for the expression
   * @returns This builder instance for method chaining
   */
  nullIf(column1: string, column2: string, alias?: string): this {
    ConditionalMixin.addNullIf(this.query, column1, column2, alias)
    return this
  }

  /**
   * Adds a CASE expression to the query with fluent interface.
   * @param alias - Alias for the CASE expression
   * @returns A CaseBuilder for chaining WHEN/THEN/ELSE clauses
   */
  case(alias?: string): CaseBuilder {
    return new CaseBuilder(this, alias)
  }
}

/**
 * Helper class for building CASE expressions with fluent interface.
 * @description Helper class for building CASE expressions with fluent interface.
 */
class CaseBuilder {
  /** The parent SelectConditionalExprBuilder instance */
  private readonly selectBuilder: SelectConditionalExprBuilder
  /** Optional alias for the CASE expression */
  private readonly alias: string | undefined
  /** Array of CASE expressions */
  private readonly cases: QueryCaseExpression[] = []
  /** Default value to return when no WHEN conditions match */
  private elseValue?: string | number

  /**
   * Creates a new CaseBuilder instance.
   * @param selectBuilder - The parent SelectConditionalExprBuilder instance
   * @param alias - Optional alias for the CASE expression
   */
  constructor(selectBuilder: SelectConditionalExprBuilder, alias?: string) {
    this.selectBuilder = selectBuilder
    this.alias = alias
  }

  /**
   * Adds a WHEN clause to the CASE expression.
   * @param column - Column name to compare
   * @param operator - Comparison operator
   * @param value - Value to compare against
   * @returns This CaseBuilder instance for method chaining
   */
  when(column: string, operator: QueryComparisonOperator, value: unknown): this {
    const valueStr: string = typeof value === 'string' ? `'${value}'` : String(value)
    this.cases.push({
      when: `${column} ${operator} ${valueStr}`,
      then: ''
    })
    return this
  }

  /**
   * Adds a THEN clause to the most recent WHEN clause.
   * @param value - Value to return when the WHEN condition is true
   * @returns This CaseBuilder instance for method chaining
   * @throws {Error} When no WHEN clause has been added yet
   */
  then(value: string | number): this {
    if (this.cases.length === 0) {
      throw new Error('CASE expression must have at least one WHEN clause')
    }
    const lastCase: QueryCaseExpression | undefined = this.cases[this.cases.length - 1]
    if (lastCase) {
      lastCase.then = value
    }
    return this
  }

  /**
   * Adds an ELSE clause to the CASE expression.
   * @param value - Default value to return when no WHEN conditions match
   * @returns This CaseBuilder instance for method chaining
   */
  else(value: string | number): this {
    this.elseValue = value
    return this
  }

  /**
   * Completes the CASE expression and returns to the parent SelectConditionalExprBuilder.
   * @returns The parent SelectConditionalExprBuilder instance
   */
  end(): SelectConditionalExprBuilder {
    ConditionalMixin.addCase(this.selectBuilder['query'], this.cases, this.elseValue, this.alias)
    return this.selectBuilder
  }
}
