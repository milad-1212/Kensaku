import { SelectConditionalExprBuilder } from '@builders/abstracts/SelectConditionalExpr'
import { ConditionalMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'
import type { QueryCaseExpression, QuerySelect, QueryComparisonOperator } from '@interfaces/index'

// Mock the parent class
jest.mock('@builders/abstracts/SelectAggregation', () => ({
  SelectAggregationBuilder: class {
    public query: QuerySelect

    constructor() {
      this.query = {
        columns: [],
        conditionals: []
      } as QuerySelect
    }

    aggregate() {
      return this
    }
  }
}))

// Create a concrete implementation for testing
class TestSelectConditionalExprBuilder extends SelectConditionalExprBuilder {
  constructor() {
    super()
    // Initialize the protected query property
    ;(this as any).query = {
      columns: [],
      conditionals: []
    } as QuerySelect
  }

  // Override abstract methods with concrete implementations
  toSQL(): string {
    return 'SELECT * FROM test'
  }

  toParams(): unknown[] {
    return []
  }

  async execute(): Promise<unknown[]> {
    return []
  }

  // Expose the protected query property for testing
  getQuery(): QuerySelect {
    return (this as any).query
  }
}

describe('SelectConditionalExprBuilder', () => {
  let mockQuery: QuerySelect

  beforeEach(() => {
    mockQuery = {
      columns: [],
      conditionals: []
    } as QuerySelect
    jest.clearAllMocks()
  })

  describe('ConditionalMixin integration', () => {
    it('should add CASE expression with valid cases only', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'status = "active"', then: 'Active User' },
        { when: 'status = "inactive"', then: 'Inactive User' }
      ]

      ConditionalMixin.addCase(mockQuery, cases)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: cases
      })
    })

    it('should add CASE expression with cases and else value', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'age >= 18', then: 'Adult' },
        { when: 'age >= 13', then: 'Teen' }
      ]
      const elseValue = 'Child'

      ConditionalMixin.addCase(mockQuery, cases, elseValue)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: [...cases, { when: '1=1', then: elseValue }]
      })
    })

    it('should add CASE expression with cases, else value, and alias', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'score >= 90', then: 'A' },
        { when: 'score >= 80', then: 'B' },
        { when: 'score >= 70', then: 'C' }
      ]
      const elseValue = 'F'
      const alias = 'grade'

      ConditionalMixin.addCase(mockQuery, cases, elseValue, alias)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: [...cases, { when: '1=1', then: elseValue }],
        alias
      })
    })

    it('should handle numeric values in case expressions', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'score >= 90', then: 1 },
        { when: 'score >= 80', then: 2 }
      ]
      const elseValue = 0

      ConditionalMixin.addCase(mockQuery, cases, elseValue)

      expect(mockQuery.conditionals![0].case).toEqual([...cases, { when: '1=1', then: elseValue }])
    })

    it('should throw error for empty cases array', () => {
      const cases: QueryCaseExpression[] = []

      expect(() => ConditionalMixin.addCase(mockQuery, cases)).toThrow(
        errorMessages.CONDITIONAL.EMPTY_CASE_EXPRESSION
      )
    })

    it('should throw error for case with empty when condition', () => {
      const cases: QueryCaseExpression[] = [{ when: '', then: 'Active' }]

      expect(() => ConditionalMixin.addCase(mockQuery, cases)).toThrow(
        errorMessages.CONDITIONAL.INVALID_CASE_WHEN
      )
    })

    it('should throw error for case with null then value', () => {
      const cases: QueryCaseExpression[] = [{ when: 'status = "active"', then: null as any }]

      expect(() => ConditionalMixin.addCase(mockQuery, cases)).toThrow(
        errorMessages.CONDITIONAL.INVALID_CASE_THEN
      )
    })

    it('should throw error for case with undefined then value', () => {
      const cases: QueryCaseExpression[] = [{ when: 'status = "active"', then: undefined as any }]

      expect(() => ConditionalMixin.addCase(mockQuery, cases)).toThrow(
        errorMessages.CONDITIONAL.INVALID_CASE_THEN
      )
    })

    it('should handle whitespace-only when conditions', () => {
      const cases: QueryCaseExpression[] = [{ when: '   ', then: 'Active' }]

      expect(() => ConditionalMixin.addCase(mockQuery, cases)).toThrow(
        errorMessages.CONDITIONAL.INVALID_CASE_WHEN
      )
    })
  })

  describe('COALESCE functionality', () => {
    it('should add COALESCE expression with array of columns', () => {
      const columns = ['first_name', 'nickname', 'username']

      ConditionalMixin.addCoalesce(mockQuery, columns)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'COALESCE',
        columns
      })
    })

    it('should add COALESCE expression with single column', () => {
      const columns = ['first_name']

      ConditionalMixin.addCoalesce(mockQuery, columns)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'COALESCE',
        columns
      })
    })

    it('should add COALESCE expression with alias', () => {
      const columns = ['first_name', 'nickname']
      const alias = 'display_name'

      ConditionalMixin.addCoalesce(mockQuery, columns, alias)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'COALESCE',
        columns,
        alias
      })
    })

    it('should handle single element array', () => {
      const columns = ['single_column']

      ConditionalMixin.addCoalesce(mockQuery, columns)

      expect(mockQuery.conditionals![0].columns).toEqual(['single_column'])
    })

    it('should handle many columns', () => {
      const columns = ['col1', 'col2', 'col3', 'col4', 'col5']

      ConditionalMixin.addCoalesce(mockQuery, columns)

      expect(mockQuery.conditionals![0].columns).toEqual(columns)
    })

    it('should throw error for empty array', () => {
      const columns: string[] = []

      expect(() => ConditionalMixin.addCoalesce(mockQuery, columns)).toThrow(
        errorMessages.CONDITIONAL.COALESCE_REQUIRES_COLUMNS
      )
    })
  })

  describe('NULLIF functionality', () => {
    it('should add NULLIF expression with two columns', () => {
      const column1 = 'first_name'
      const column2 = 'last_name'

      ConditionalMixin.addNullIf(mockQuery, column1, column2)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1,
        column2
      })
    })

    it('should add NULLIF expression with two columns and alias', () => {
      const column1 = 'current_value'
      const column2 = 'default_value'
      const alias = 'effective_value'

      ConditionalMixin.addNullIf(mockQuery, column1, column2, alias)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1,
        column2,
        alias
      })
    })

    it('should handle identical column names', () => {
      const column1 = 'same_column'
      const column2 = 'same_column'

      ConditionalMixin.addNullIf(mockQuery, column1, column2)

      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1,
        column2
      })
    })

    it('should handle complex column expressions', () => {
      const column1 = 'UPPER(first_name)'
      const column2 = 'UPPER(last_name)'
      const alias = 'name_comparison'

      ConditionalMixin.addNullIf(mockQuery, column1, column2, alias)

      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1,
        column2,
        alias
      })
    })

    it('should throw error for null column1', () => {
      expect(() => ConditionalMixin.addNullIf(mockQuery, null as any, 'col2')).toThrow(
        errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS
      )
    })

    it('should throw error for null column2', () => {
      expect(() => ConditionalMixin.addNullIf(mockQuery, 'col1', null as any)).toThrow(
        errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS
      )
    })

    it('should throw error for empty column1', () => {
      expect(() => ConditionalMixin.addNullIf(mockQuery, '', 'col2')).toThrow(
        errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS
      )
    })

    it('should throw error for empty column2', () => {
      expect(() => ConditionalMixin.addNullIf(mockQuery, 'col1', '')).toThrow(
        errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS
      )
    })
  })

  describe('SelectConditionalExprBuilder Integration Tests', () => {
    let builder: TestSelectConditionalExprBuilder

    beforeEach(() => {
      builder = new TestSelectConditionalExprBuilder()
      jest.clearAllMocks()
    })

    it('should test caseWhen method', () => {
      const cases: QueryCaseExpression[] = [{ when: 'status = "active"', then: 'Active User' }]

      const result = builder.caseWhen(cases)

      expect(result).toBe(builder)
      expect(builder.getQuery().conditionals).toHaveLength(1)
      expect(builder.getQuery().conditionals![0]).toEqual({
        type: 'CASE',
        case: cases
      })
    })

    it('should test coalesce method', () => {
      const columns = ['first_name', 'nickname']

      const result = builder.coalesce(columns)

      expect(result).toBe(builder)
      expect(builder.getQuery().conditionals).toHaveLength(1)
      expect(builder.getQuery().conditionals![0]).toEqual({
        type: 'COALESCE',
        columns
      })
    })

    it('should test nullIf method', () => {
      const result = builder.nullIf('col1', 'col2')

      expect(result).toBe(builder)
      expect(builder.getQuery().conditionals).toHaveLength(1)
      expect(builder.getQuery().conditionals![0]).toEqual({
        type: 'NULLIF',
        column1: 'col1',
        column2: 'col2'
      })
    })

    it('should test case method returns CaseBuilder', () => {
      const caseBuilder = builder.case()

      expect(caseBuilder).toBeDefined()
      expect(caseBuilder).toHaveProperty('when')
      expect(caseBuilder).toHaveProperty('then')
      expect(caseBuilder).toHaveProperty('else')
      expect(caseBuilder).toHaveProperty('end')
    })

    describe('CaseBuilder functionality', () => {
      it('should test CaseBuilder when method', () => {
        const caseBuilder = builder.case()
        const result = caseBuilder.when('status', '=', 'active')

        expect(result).toBe(caseBuilder)
        expect(builder.getQuery().conditionals).toHaveLength(0) // Not added until end()
      })

      it('should test CaseBuilder then method', () => {
        const caseBuilder = builder.case()
        const result = caseBuilder.when('status', '=', 'active').then('Active')

        expect(result).toBe(caseBuilder)
        expect(builder.getQuery().conditionals).toHaveLength(0) // Not added until end()
      })

      it('should test CaseBuilder else method', () => {
        const caseBuilder = builder.case()
        const result = caseBuilder.when('status', '=', 'active').then('Active').else('Inactive')

        expect(result).toBe(caseBuilder)
        expect(builder.getQuery().conditionals).toHaveLength(0) // Not added until end()
      })

      it('should test CaseBuilder end method', () => {
        const caseBuilder = builder.case('user_status')
        const result = caseBuilder
          .when('status', '=', 'active')
          .then('Active')
          .when('status', '=', 'inactive')
          .then('Inactive')
          .else('Unknown')
          .end()

        expect(result).toBe(builder)
        expect(builder.getQuery().conditionals).toHaveLength(1)
        expect(builder.getQuery().conditionals![0]).toEqual({
          type: 'CASE',
          case: [
            { when: "status = 'active'", then: 'Active' },
            { when: "status = 'inactive'", then: 'Inactive' },
            { when: '1=1', then: 'Unknown' }
          ],
          alias: 'user_status'
        })
      })

      it('should test CaseBuilder end method without else', () => {
        const caseBuilder = builder.case()
        const result = caseBuilder
          .when('status', '=', 'active')
          .then('Active')
          .when('status', '=', 'inactive')
          .then('Inactive')
          .end()

        expect(result).toBe(builder)
        expect(builder.getQuery().conditionals).toHaveLength(1)
        expect(builder.getQuery().conditionals![0]).toEqual({
          type: 'CASE',
          case: [
            { when: "status = 'active'", then: 'Active' },
            { when: "status = 'inactive'", then: 'Inactive' }
          ]
        })
      })

      it('should test CaseBuilder then method error handling', () => {
        const caseBuilder = builder.case()

        expect(() => caseBuilder.then('value')).toThrow(errorMessages.CONDITIONAL.INVALID_CASE_WHEN)
      })

      it('should test CaseBuilder with numeric values', () => {
        const caseBuilder = builder.case('grade')
        const result = caseBuilder
          .when('score', '>=', 90)
          .then(1)
          .when('score', '>=', 80)
          .then(2)
          .else(0)
          .end()

        expect(result).toBe(builder)
        expect(builder.getQuery().conditionals![0]).toEqual({
          type: 'CASE',
          case: [
            { when: 'score >= 90', then: 1 },
            { when: 'score >= 80', then: 2 },
            { when: '1=1', then: 0 }
          ],
          alias: 'grade'
        })
      })

      it('should test CaseBuilder with boolean values', () => {
        const caseBuilder = builder.case()
        const result = caseBuilder
          .when('is_active', '=', true)
          .then('Yes')
          .when('is_active', '=', false)
          .then('No')
          .end()

        expect(result).toBe(builder)
        expect(builder.getQuery().conditionals![0].case).toEqual([
          { when: 'is_active = true', then: 'Yes' },
          { when: 'is_active = false', then: 'No' }
        ])
      })

      it('should test CaseBuilder with null values', () => {
        const caseBuilder = builder.case()
        const result = caseBuilder.when('value', 'IS NULL', null).then('No Value').end()

        expect(result).toBe(builder)
        expect(builder.getQuery().conditionals![0].case).toEqual([
          { when: 'value IS NULL null', then: 'No Value' }
        ])
      })
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple conditional expressions', () => {
      const cases: QueryCaseExpression[] = [{ when: 'status = "active"', then: 'Active' }]
      const columns = ['first_name', 'nickname']

      ConditionalMixin.addCase(mockQuery, cases, 'Inactive', 'status_label')
      ConditionalMixin.addCoalesce(mockQuery, columns)
      ConditionalMixin.addNullIf(mockQuery, 'current_value', 'default_value', 'effective_value')

      expect(mockQuery.conditionals).toHaveLength(3)
      expect(mockQuery.conditionals![0].type).toBe('CASE')
      expect(mockQuery.conditionals![1].type).toBe('COALESCE')
      expect(mockQuery.conditionals![2].type).toBe('NULLIF')
    })

    it('should handle nested conditional expressions', () => {
      const outerCases: QueryCaseExpression[] = [
        { when: 'user_type = "admin"', then: 'Administrator' }
      ]
      const innerCases: QueryCaseExpression[] = [
        { when: 'permissions = "full"', then: 'Full Access' }
      ]

      ConditionalMixin.addCase(mockQuery, outerCases, 'Regular User', 'user_role')
      ConditionalMixin.addCase(mockQuery, innerCases, 'Limited Access', 'permission_level')

      expect(mockQuery.conditionals).toHaveLength(2)
    })

    it('should handle complex coalesce scenarios', () => {
      ConditionalMixin.addCoalesce(mockQuery, ['primary_email', 'secondary_email', 'backup_email'])
      ConditionalMixin.addCoalesce(mockQuery, ['display_name', 'first_name', 'username'])

      expect(mockQuery.conditionals).toHaveLength(2)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null values in case expressions', () => {
      const cases: QueryCaseExpression[] = [{ when: 'value IS NULL', then: 'No Value' }]

      ConditionalMixin.addCase(mockQuery, cases, null as any)

      expect(mockQuery.conditionals![0].case).toEqual([...cases, { when: '1=1', then: null }])
    })

    it('should handle undefined values in case expressions', () => {
      const cases: QueryCaseExpression[] = [{ when: 'value IS NOT NULL', then: 'Has Value' }]

      ConditionalMixin.addCase(mockQuery, cases, undefined as any)

      expect(mockQuery.conditionals![0].case).toEqual(cases)
    })

    it('should handle empty string values', () => {
      const cases: QueryCaseExpression[] = [{ when: 'name = ""', then: 'Empty Name' }]

      ConditionalMixin.addCase(mockQuery, cases, '', 'name_status')

      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: [...cases, { when: '1=1', then: '' }],
        alias: 'name_status'
      })
    })

    it('should handle zero values in case expressions', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'score >= 90', then: 1 },
        { when: 'score >= 80', then: 2 }
      ]

      ConditionalMixin.addCase(mockQuery, cases, 0, 'grade_level')

      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: [...cases, { when: '1=1', then: 0 }],
        alias: 'grade_level'
      })
    })
  })

  describe('security considerations', () => {
    it('should handle potentially malicious column names', () => {
      const maliciousColumn = "'; DROP TABLE users; --"
      const columns = [maliciousColumn, 'safe_column']

      ConditionalMixin.addCoalesce(mockQuery, columns)

      expect(mockQuery.conditionals![0].columns).toEqual(columns)
    })

    it('should handle potentially malicious case expressions', () => {
      const maliciousCases: QueryCaseExpression[] = [
        { when: "'; DROP TABLE users; --", then: 'Malicious' }
      ]

      ConditionalMixin.addCase(mockQuery, maliciousCases)

      expect(mockQuery.conditionals![0].case).toEqual(maliciousCases)
    })

    it('should handle potentially malicious nullif columns', () => {
      const maliciousColumn1 = "'; DROP TABLE users; --"
      const maliciousColumn2 = "'; DELETE FROM users; --"

      ConditionalMixin.addNullIf(mockQuery, maliciousColumn1, maliciousColumn2)

      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1: maliciousColumn1,
        column2: maliciousColumn2
      })
    })
  })

  describe('type validation', () => {
    it('should accept valid QueryComparisonOperator values', () => {
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
        'NOT EXISTS',
        'IS DISTINCT FROM',
        'SIMILAR TO',
        'REGEXP',
        'RLIKE',
        'GLOB',
        'RAW'
      ]

      // Test that all operators are valid TypeScript types
      validOperators.forEach(operator => {
        expect(typeof operator).toBe('string')
        expect(operator.length).toBeGreaterThan(0)
      })
    })

    it('should handle different value types in conditional expressions', () => {
      // Test string values
      const stringCases: QueryCaseExpression[] = [{ when: 'status = "active"', then: 'Active' }]
      ConditionalMixin.addCase(mockQuery, stringCases)
      expect(mockQuery.conditionals![0].case![0].then).toBe('Active')

      // Test numeric values
      const numericCases: QueryCaseExpression[] = [{ when: 'score >= 90', then: 1 }]
      ConditionalMixin.addCase(mockQuery, numericCases)
      expect(mockQuery.conditionals![1].case![0].then).toBe(1)

      // Test boolean values
      const booleanCases: QueryCaseExpression[] = [{ when: 'is_active = true', then: 'Yes' }]
      ConditionalMixin.addCase(mockQuery, booleanCases)
      expect(mockQuery.conditionals![2].case![0].then).toBe('Yes')
    })
  })
})
