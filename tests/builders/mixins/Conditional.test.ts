import { ConditionalMixin } from '@builders/mixins/index'
import { errorMessages } from '@constants/index'
import type { QuerySelect, QueryCaseExpression } from '@interfaces/index'

describe('ConditionalMixin', () => {
  let mockQuery: QuerySelect

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'users'
    }
  })

  describe('addCase', () => {
    it('should add CASE expression with valid cases', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'age >= 18', then: 'adult' },
        { when: 'age < 18', then: 'minor' }
      ]
      const expectedCases = [...cases, { when: '1=1', then: 'unknown' }]

      ConditionalMixin.addCase(mockQuery, cases, 'unknown', 'age_category')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: expectedCases,
        alias: 'age_category'
      })
    })

    it('should add CASE expression without else value', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'status = "active"', then: 1 },
        { when: 'status = "inactive"', then: 0 }
      ]

      ConditionalMixin.addCase(mockQuery, cases, undefined, 'status_value')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: cases,
        alias: 'status_value'
      })
    })

    it('should add CASE expression without alias', () => {
      const cases: QueryCaseExpression[] = [{ when: 'score >= 90', then: 'A' }]

      ConditionalMixin.addCase(mockQuery, cases)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'CASE',
        case: cases
      })
    })

    it('should initialize conditionals array if undefined', () => {
      expect(mockQuery.conditionals).toBeUndefined()

      const cases: QueryCaseExpression[] = [{ when: 'active = true', then: 'Yes' }]
      ConditionalMixin.addCase(mockQuery, cases)

      expect(mockQuery.conditionals).toBeDefined()
      expect(mockQuery.conditionals).toHaveLength(1)
    })

    it('should append to existing conditionals array', () => {
      const cases1: QueryCaseExpression[] = [{ when: 'type = "user"', then: 'User' }]
      const cases2: QueryCaseExpression[] = [{ when: 'type = "admin"', then: 'Admin' }]

      ConditionalMixin.addCase(mockQuery, cases1, undefined, 'user_type')
      ConditionalMixin.addCase(mockQuery, cases2, undefined, 'admin_type')

      expect(mockQuery.conditionals).toHaveLength(2)
      expect(mockQuery.conditionals![0].type).toBe('CASE')
      expect(mockQuery.conditionals![1].type).toBe('CASE')
    })

    it('should throw error for empty cases array', () => {
      const cases: QueryCaseExpression[] = []

      expect(() => {
        ConditionalMixin.addCase(mockQuery, cases)
      }).toThrow(errorMessages.CONDITIONAL.EMPTY_CASE_EXPRESSION)
    })

    it('should throw error for empty when condition', () => {
      const cases: QueryCaseExpression[] = [{ when: '', then: 'value' }]

      expect(() => {
        ConditionalMixin.addCase(mockQuery, cases)
      }).toThrow(errorMessages.CONDITIONAL.INVALID_CASE_WHEN)
    })

    it('should throw error for whitespace-only when condition', () => {
      const cases: QueryCaseExpression[] = [{ when: '   ', then: 'value' }]

      expect(() => {
        ConditionalMixin.addCase(mockQuery, cases)
      }).toThrow(errorMessages.CONDITIONAL.INVALID_CASE_WHEN)
    })

    it('should throw error for null then value', () => {
      const cases: QueryCaseExpression[] = [{ when: 'condition = true', then: null as any }]

      expect(() => {
        ConditionalMixin.addCase(mockQuery, cases)
      }).toThrow(errorMessages.CONDITIONAL.INVALID_CASE_THEN)
    })

    it('should throw error for undefined then value', () => {
      const cases: QueryCaseExpression[] = [{ when: 'condition = true', then: undefined as any }]

      expect(() => {
        ConditionalMixin.addCase(mockQuery, cases)
      }).toThrow(errorMessages.CONDITIONAL.INVALID_CASE_THEN)
    })

    it('should handle multiple cases with validation', () => {
      const cases: QueryCaseExpression[] = [
        { when: 'score >= 90', then: 'A' },
        { when: 'score >= 80', then: 'B' },
        { when: 'score >= 70', then: 'C' },
        { when: 'score >= 60', then: 'D' }
      ]
      const expectedCases = [...cases, { when: '1=1', then: 'F' }]

      ConditionalMixin.addCase(mockQuery, cases, 'F', 'grade')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0].case).toEqual(expectedCases)
    })
  })

  describe('addCoalesce', () => {
    it('should add COALESCE expression with multiple columns', () => {
      const columns = ['first_name', 'nickname', 'username']

      ConditionalMixin.addCoalesce(mockQuery, columns, 'display_name')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'COALESCE',
        columns,
        alias: 'display_name'
      })
    })

    it('should add COALESCE expression without alias', () => {
      const columns = ['email', 'backup_email']

      ConditionalMixin.addCoalesce(mockQuery, columns)

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'COALESCE',
        columns
      })
    })

    it('should initialize conditionals array if undefined', () => {
      expect(mockQuery.conditionals).toBeUndefined()

      ConditionalMixin.addCoalesce(mockQuery, ['col1', 'col2'])

      expect(mockQuery.conditionals).toBeDefined()
      expect(mockQuery.conditionals).toHaveLength(1)
    })

    it('should append to existing conditionals array', () => {
      ConditionalMixin.addCoalesce(mockQuery, ['col1', 'col2'], 'first')
      ConditionalMixin.addCoalesce(mockQuery, ['col3', 'col4'], 'second')

      expect(mockQuery.conditionals).toHaveLength(2)
      expect(mockQuery.conditionals![0].type).toBe('COALESCE')
      expect(mockQuery.conditionals![1].type).toBe('COALESCE')
    })

    it('should throw error for empty columns array', () => {
      expect(() => {
        ConditionalMixin.addCoalesce(mockQuery, [])
      }).toThrow(errorMessages.CONDITIONAL.COALESCE_REQUIRES_COLUMNS)
    })

    it('should handle single column', () => {
      ConditionalMixin.addCoalesce(mockQuery, ['single_col'], 'result')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'COALESCE',
        columns: ['single_col'],
        alias: 'result'
      })
    })
  })

  describe('addNullIf', () => {
    it('should add NULLIF expression with two columns', () => {
      ConditionalMixin.addNullIf(mockQuery, 'col1', 'col2', 'result')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1: 'col1',
        column2: 'col2',
        alias: 'result'
      })
    })

    it('should add NULLIF expression without alias', () => {
      ConditionalMixin.addNullIf(mockQuery, 'email', 'backup_email')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1: 'email',
        column2: 'backup_email'
      })
    })

    it('should initialize conditionals array if undefined', () => {
      expect(mockQuery.conditionals).toBeUndefined()

      ConditionalMixin.addNullIf(mockQuery, 'col1', 'col2')

      expect(mockQuery.conditionals).toBeDefined()
      expect(mockQuery.conditionals).toHaveLength(1)
    })

    it('should append to existing conditionals array', () => {
      ConditionalMixin.addNullIf(mockQuery, 'col1', 'col2', 'first')
      ConditionalMixin.addNullIf(mockQuery, 'col3', 'col4', 'second')

      expect(mockQuery.conditionals).toHaveLength(2)
      expect(mockQuery.conditionals![0].type).toBe('NULLIF')
      expect(mockQuery.conditionals![1].type).toBe('NULLIF')
    })

    it('should throw error for null column1', () => {
      expect(() => {
        ConditionalMixin.addNullIf(mockQuery, null as any, 'col2')
      }).toThrow(errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS)
    })

    it('should throw error for null column2', () => {
      expect(() => {
        ConditionalMixin.addNullIf(mockQuery, 'col1', null as any)
      }).toThrow(errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS)
    })

    it('should throw error for empty column1', () => {
      expect(() => {
        ConditionalMixin.addNullIf(mockQuery, '', 'col2')
      }).toThrow(errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS)
    })

    it('should throw error for empty column2', () => {
      expect(() => {
        ConditionalMixin.addNullIf(mockQuery, 'col1', '')
      }).toThrow(errorMessages.CONDITIONAL.NULLIF_REQUIRES_TWO_COLUMNS)
    })

    it('should handle valid column names', () => {
      ConditionalMixin.addNullIf(mockQuery, 'user.email', 'user.backup_email', 'clean_email')

      expect(mockQuery.conditionals).toHaveLength(1)
      expect(mockQuery.conditionals![0]).toEqual({
        type: 'NULLIF',
        column1: 'user.email',
        column2: 'user.backup_email',
        alias: 'clean_email'
      })
    })
  })
})
