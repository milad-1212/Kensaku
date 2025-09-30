import { WhereConditionHelper } from '@builders/helpers/WhereCondition'
import { SqlSanitizer } from '@core/security/index'
import type { QueryWhereCondition, QueryComparisonOperator } from '@interfaces/index'

// Mock SqlSanitizer
jest.mock('@core/security/index', () => ({
  SqlSanitizer: {
    escapeLikePattern: jest
      .fn()
      .mockImplementation((pattern: string) => pattern.replace(/[%_]/g, '\\$&'))
  }
}))

describe('WhereConditionHelper', () => {
  const mockEscapeIdentifier = jest.fn().mockImplementation((id: string) => `"${id}"`)
  const mockAddParam = jest.fn().mockImplementation((value: unknown) => `$${value}`)
  const mockIsColumnReference = jest
    .fn()
    .mockImplementation((value: unknown) => typeof value === 'string' && value.startsWith('col_'))

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildWhereConditions', () => {
    it('should build simple WHERE condition', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'id', operator: '=', value: 1 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"id" = $1')
      expect(mockEscapeIdentifier).toHaveBeenCalledWith('id')
      expect(mockAddParam).toHaveBeenCalledWith(1)
    })

    it('should build multiple WHERE conditions with AND', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 1 },
        { column: 'name', operator: '=', value: 'John' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"id" = $1 AND "name" = $John')
    })

    it('should build multiple WHERE conditions with OR', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 1 },
        { column: 'name', operator: '=', value: 'John', logical: 'OR' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"id" = $1 OR "name" = $John')
    })

    it('should handle mixed logical operators', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 1 },
        { column: 'name', operator: '=', value: 'John', logical: 'OR' },
        { column: 'active', operator: '=', value: true, logical: 'AND' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"id" = $1 OR "name" = $John AND "active" = $true')
    })
  })

  describe('different operators', () => {
    it('should handle equality operator', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'id', operator: '=', value: 1 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"id" = $1')
    })

    it('should handle inequality operator', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'id', operator: '!=', value: 1 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"id" != $1')
    })

    it('should handle greater than operator', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'age', operator: '>', value: 18 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"age" > $18')
    })

    it('should handle less than operator', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'age', operator: '<', value: 65 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"age" < $65')
    })

    it('should handle greater than or equal operator', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'age', operator: '>=', value: 18 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"age" >= $18')
    })

    it('should handle less than or equal operator', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'age', operator: '<=', value: 65 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"age" <= $65')
    })
  })

  describe('IS NULL and IS NOT NULL', () => {
    it('should handle IS NULL operator', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'deleted_at', operator: 'IS NULL', value: null }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"deleted_at" IS NULL')
      expect(mockAddParam).not.toHaveBeenCalled()
    })

    it('should handle IS NOT NULL operator', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'created_at', operator: 'IS NOT NULL', value: null }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"created_at" IS NOT NULL')
      expect(mockAddParam).not.toHaveBeenCalled()
    })
  })

  describe('BETWEEN operator', () => {
    it('should handle BETWEEN operator with array values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'age', operator: 'BETWEEN', value: [18, 65] }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"age" BETWEEN $18 AND $65')
      expect(mockAddParam).toHaveBeenCalledWith(18)
      expect(mockAddParam).toHaveBeenCalledWith(65)
    })

    it('should handle BETWEEN operator with non-array value', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'age', operator: 'BETWEEN', value: 25 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"age" BETWEEN $25')
    })
  })

  describe('IN and NOT IN operators', () => {
    it('should handle IN operator with array values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'status', operator: 'IN', value: ['active', 'pending', 'draft'] }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"status" IN ($active, $pending, $draft)')
      expect(mockAddParam).toHaveBeenCalledTimes(3)
    })

    it('should handle NOT IN operator with array values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'status', operator: 'NOT IN', value: ['deleted', 'archived'] }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"status" NOT IN ($deleted, $archived)')
    })

    it('should handle IN operator with non-array value', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'status', operator: 'IN', value: 'active' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"status" IN $active')
    })
  })

  describe('LIKE operators', () => {
    it('should handle LIKE operator', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'name', operator: 'LIKE', value: 'John%' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"name" LIKE $John\\%')
      expect(SqlSanitizer.escapeLikePattern).toHaveBeenCalledWith('John%')
    })

    it('should handle ILIKE operator', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'name', operator: 'ILIKE', value: 'john%' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"name" ILIKE $john\\%')
    })

    it('should handle NOT LIKE operator', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'name', operator: 'NOT LIKE', value: 'Admin%' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"name" NOT LIKE $Admin\\%')
    })

    it('should handle LIKE operator with non-string value', () => {
      const conditions: QueryWhereCondition[] = [{ column: 'name', operator: 'LIKE', value: 123 }]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"name" LIKE $123')
      expect(SqlSanitizer.escapeLikePattern).not.toHaveBeenCalled()
    })
  })

  describe('RAW operator', () => {
    it('should handle RAW operator', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id = ? AND name = ?', operator: 'RAW', value: [1, 'John'] }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('id = $1 AND name = $John')
      expect(mockEscapeIdentifier).not.toHaveBeenCalled()
    })

    it('should handle RAW operator with single parameter', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'age > ?', operator: 'RAW', value: [25] }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('age > $25')
    })

    it('should handle RAW operator with non-array value', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id = 1', operator: 'RAW', value: 'no_params' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('id = 1')
    })
  })

  describe('column reference detection', () => {
    it('should use column reference when isColumnReference returns true', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 'col_user_id' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam,
        mockIsColumnReference
      )

      expect(result).toBe('"id" = "col_user_id"')
      expect(mockIsColumnReference).toHaveBeenCalledWith('col_user_id')
      expect(mockEscapeIdentifier).toHaveBeenCalledWith('col_user_id')
    })

    it('should use parameter when isColumnReference returns false', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 'regular_value' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam,
        mockIsColumnReference
      )

      expect(result).toBe('"id" = $regular_value')
      expect(mockIsColumnReference).toHaveBeenCalledWith('regular_value')
      expect(mockAddParam).toHaveBeenCalledWith('regular_value')
    })

    it('should use parameter when isColumnReference is not provided', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 'col_user_id' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"id" = $col_user_id')
      expect(mockAddParam).toHaveBeenCalledWith('col_user_id')
    })
  })

  describe('edge cases', () => {
    it('should handle empty conditions array', () => {
      const result = WhereConditionHelper.buildWhereConditions(
        [],
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('')
    })

    it('should handle null values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'description', operator: '=', value: null }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"description" = $null')
    })

    it('should handle undefined values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'optional_field', operator: '=', value: undefined }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"optional_field" = $undefined')
    })

    it('should handle object values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'metadata', operator: '=', value: { key: 'value' } }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"metadata" = $[object Object]')
    })

    it('should handle array values for non-IN operators', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'tags', operator: '=', value: ['tag1', 'tag2'] }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"tags" = $tag1,tag2')
    })

    it('should handle boolean values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'active', operator: '=', value: true },
        { column: 'deleted', operator: '=', value: false }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"active" = $true AND "deleted" = $false')
    })

    it('should handle numeric values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'count', operator: '=', value: 0 },
        { column: 'price', operator: '=', value: 99.99 }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"count" = $0 AND "price" = $99.99')
    })
  })

  describe('complex scenarios', () => {
    it('should handle complex WHERE conditions', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 1 },
        { column: 'name', operator: 'LIKE', value: 'John%', logical: 'OR' },
        { column: 'age', operator: 'BETWEEN', value: [18, 65], logical: 'AND' },
        { column: 'status', operator: 'IN', value: ['active', 'pending'], logical: 'AND' },
        { column: 'deleted_at', operator: 'IS NULL', logical: 'AND' }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe(
        '"id" = $1 OR "name" LIKE $John\\% AND "age" BETWEEN $18 AND $65 AND "status" IN ($active, $pending) AND "deleted_at" IS NULL'
      )
    })

    it('should handle mixed data types', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'id', operator: '=', value: 1 },
        { column: 'name', operator: '=', value: 'John' },
        { column: 'active', operator: '=', value: true },
        { column: 'score', operator: '=', value: 95.5 },
        { column: 'tags', operator: '=', value: ['tag1', 'tag2'] },
        { column: 'metadata', operator: '=', value: { key: 'value' } }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe(
        '"id" = $1 AND "name" = $John AND "active" = $true AND "score" = $95.5 AND "tags" = $tag1,tag2 AND "metadata" = $[object Object]'
      )
    })
  })

  describe('security considerations', () => {
    it('should handle potentially malicious column names', () => {
      const conditions: QueryWhereCondition[] = [
        { column: "'; DROP TABLE users; --", operator: '=', value: 1 }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe(`"'; DROP TABLE users; --" = $1`)
      expect(mockEscapeIdentifier).toHaveBeenCalledWith("'; DROP TABLE users; --")
    })

    it('should handle potentially malicious values', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'name', operator: '=', value: "'; DROP TABLE users; --" }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"name" = $\'; DROP TABLE users; --')
      expect(mockAddParam).toHaveBeenCalledWith("'; DROP TABLE users; --")
    })

    it('should handle potentially malicious LIKE patterns', () => {
      const conditions: QueryWhereCondition[] = [
        { column: 'name', operator: 'LIKE', value: "'; DROP TABLE users; --%" }
      ]

      const result = WhereConditionHelper.buildWhereConditions(
        conditions,
        mockEscapeIdentifier,
        mockAddParam
      )

      expect(result).toBe('"name" LIKE $\'; DROP TABLE users; --\\%')
      expect(SqlSanitizer.escapeLikePattern).toHaveBeenCalledWith("'; DROP TABLE users; --%")
    })
  })
})
