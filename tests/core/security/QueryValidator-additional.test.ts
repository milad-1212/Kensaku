/**
 * @fileoverview Additional comprehensive tests for QueryValidator
 * @description Tests missing functionality to improve coverage
 */

import { QueryValidator } from '@core/security/QueryValidator'
import type {
  QuerySelect,
  QueryInsert,
  QueryUpdate,
  QueryDelete,
  QueryMerge,
  QueryWhereCondition,
  QueryJoinClause
} from '@interfaces/index'

describe('QueryValidator Additional Tests', () => {
  describe('validateSelectQuery - WHERE conditions', () => {
    it('should validate SELECT query with WHERE conditions', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name'],
        where: [
          { column: 'status', operator: '=', value: 'active' },
          { column: 'age', operator: '>', value: 18 }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with IS NULL conditions', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name'],
        where: [
          { column: 'deleted_at', operator: 'IS NULL' },
          { column: 'email', operator: 'IS NOT NULL' }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with RAW conditions', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name'],
        where: [{ column: 'created_at > NOW() - INTERVAL ? DAY', operator: 'RAW', value: [30] }]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should throw error for invalid WHERE column name', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        where: [{ column: null as any, operator: '=', value: 'test' }]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'WHERE condition must have a valid column name'
      )
    })

    it('should throw error for invalid WHERE operator', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        where: [{ column: 'status', operator: null as any, value: 'active' }]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'WHERE condition must have an operator'
      )
    })

    it('should throw error for missing value in WHERE condition', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        where: [{ column: 'status', operator: '=', value: undefined }]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'WHERE condition must have a value'
      )
    })

    it('should allow empty string value with = operator', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        where: [{ column: 'description', operator: '=', value: '' }]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should throw error for invalid RAW condition', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        where: [{ column: null as any, operator: 'RAW', value: 'test' }]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'RAW WHERE condition must have a valid SQL string'
      )
    })
  })

  describe('validateSelectQuery - JOIN clauses', () => {
    it('should validate SELECT query with INNER JOIN', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name'],
        joins: [
          {
            type: 'INNER',
            table: 'profiles',
            on: [{ column: 'users.id', operator: '=', value: 'profiles.user_id' }]
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with LEFT JOIN', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name'],
        joins: [
          {
            type: 'LEFT',
            table: 'orders',
            on: [{ column: 'users.id', operator: '=', value: 'orders.user_id' }]
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with CROSS JOIN', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name'],
        joins: [
          {
            type: 'CROSS',
            table: 'categories'
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with LATERAL JOIN', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name'],
        joins: [
          {
            type: 'LATERAL',
            table: 'lateral_table'
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should throw error for JOIN without table', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        joins: [
          {
            type: 'INNER',
            table: null as any,
            on: [{ column: 'users.id', operator: '=', value: 'profiles.user_id' }]
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow('JOIN must have a table')
    })

    it('should throw error for JOIN without ON conditions', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        joins: [
          {
            type: 'INNER',
            table: 'profiles'
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'JOIN must have ON conditions'
      )
    })

    it('should throw error for JOIN with empty ON conditions', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id'],
        joins: [
          {
            type: 'INNER',
            table: 'profiles',
            on: []
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'JOIN must have ON conditions'
      )
    })
  })

  describe('validateInsertQuery - additional cases', () => {
    it('should validate INSERT query with RETURNING clause', () => {
      const query: QueryInsert = {
        into: 'users',
        values: { name: 'John', email: 'john@example.com' },
        returning: ['id', 'created_at']
      }

      expect(() => QueryValidator.validateInsertQuery(query)).not.toThrow()
    })

    it('should validate INSERT query with conflict resolution', () => {
      const query: QueryInsert = {
        into: 'users',
        values: { name: 'John', email: 'john@example.com' },
        conflict: {
          target: ['email'],
          action: 'DO_NOTHING'
        }
      }

      expect(() => QueryValidator.validateInsertQuery(query)).not.toThrow()
    })

    it('should validate INSERT query with DO_UPDATE conflict', () => {
      const query: QueryInsert = {
        into: 'users',
        values: { name: 'John', email: 'john@example.com' },
        conflict: {
          target: ['email'],
          action: 'DO_UPDATE',
          update: { name: 'John Updated', updated_at: 'NOW()' }
        }
      }

      expect(() => QueryValidator.validateInsertQuery(query)).not.toThrow()
    })

    it('should validate INSERT query with conflict WHERE clause', () => {
      const query: QueryInsert = {
        into: 'users',
        values: { name: 'John', email: 'john@example.com' },
        conflict: {
          target: ['email'],
          action: 'DO_UPDATE',
          update: { name: 'John Updated' },
          where: [{ column: 'status', operator: '=', value: 'active' }]
        }
      }

      expect(() => QueryValidator.validateInsertQuery(query)).not.toThrow()
    })

    it('should throw error for empty conflict target', () => {
      const query: QueryInsert = {
        into: 'users',
        values: { name: 'John' },
        conflict: {
          target: [],
          action: 'DO_NOTHING'
        }
      }

      expect(() => QueryValidator.validateInsertQuery(query)).toThrow(
        'ON CONFLICT target cannot be empty'
      )
    })

    it('should throw error for DO_UPDATE without update clause', () => {
      const query: QueryInsert = {
        into: 'users',
        values: { name: 'John' },
        conflict: {
          target: ['email'],
          action: 'DO_UPDATE'
        }
      }

      expect(() => QueryValidator.validateInsertQuery(query)).toThrow(
        'ON CONFLICT DO UPDATE requires update data'
      )
    })
  })

  describe('validateUpdateQuery - additional cases', () => {
    it('should validate UPDATE query with WHERE clause', () => {
      const query: QueryUpdate = {
        table: 'users',
        set: { name: 'John Updated' },
        where: [{ column: 'id', operator: '=', value: 1 }]
      }

      expect(() => QueryValidator.validateUpdateQuery(query)).not.toThrow()
    })

    it('should validate UPDATE query with RETURNING clause', () => {
      const query: QueryUpdate = {
        table: 'users',
        set: { name: 'John Updated' },
        returning: ['id', 'updated_at']
      }

      expect(() => QueryValidator.validateUpdateQuery(query)).not.toThrow()
    })
  })

  describe('validateDeleteQuery - additional cases', () => {
    it('should validate DELETE query with RETURNING clause', () => {
      const query: QueryDelete = {
        from: 'users',
        where: [{ column: 'status', operator: '=', value: 'inactive' }],
        returning: ['id', 'name']
      }

      expect(() => QueryValidator.validateDeleteQuery(query)).not.toThrow()
    })
  })

  describe('validateMergeQuery', () => {
    it('should validate basic MERGE query', () => {
      const query: QueryMerge = {
        into: 'users',
        using: 'temp_users',
        on: [{ column: 'users.email', operator: '=', value: 'temp_users.email' }],
        whenMatched: {
          action: 'UPDATE',
          set: { name: 'temp_users.name', updated_at: 'NOW()' }
        }
      }

      expect(() => QueryValidator.validateMergeQuery(query)).not.toThrow()
    })

    it('should validate MERGE query with WHEN NOT MATCHED', () => {
      const query: QueryMerge = {
        into: 'users',
        using: 'temp_users',
        on: [{ column: 'users.email', operator: '=', value: 'temp_users.email' }],
        whenNotMatched: {
          action: 'INSERT',
          values: { email: 'temp_users.email', name: 'temp_users.name' }
        }
      }

      expect(() => QueryValidator.validateMergeQuery(query)).not.toThrow()
    })

    it('should validate MERGE query with both WHEN clauses', () => {
      const query: QueryMerge = {
        into: 'users',
        using: 'temp_users',
        on: [{ column: 'users.email', operator: '=', value: 'temp_users.email' }],
        whenMatched: {
          action: 'UPDATE',
          set: { name: 'temp_users.name' }
        },
        whenNotMatched: {
          action: 'INSERT',
          values: { email: 'temp_users.email', name: 'temp_users.name' }
        }
      }

      expect(() => QueryValidator.validateMergeQuery(query)).not.toThrow()
    })

    it('should validate MERGE query with RETURNING clause', () => {
      const query: QueryMerge = {
        into: 'users',
        using: 'temp_users',
        on: [{ column: 'users.email', operator: '=', value: 'temp_users.email' }],
        whenMatched: {
          action: 'UPDATE',
          set: { name: 'temp_users.name' }
        },
        returning: ['id', 'email', 'name']
      }

      expect(() => QueryValidator.validateMergeQuery(query)).not.toThrow()
    })

    it('should throw error when INTO is missing', () => {
      const query: QueryMerge = {
        using: 'temp_users',
        on: [{ column: 'users.email', operator: '=', value: 'temp_users.email' }],
        whenMatched: {
          action: 'UPDATE',
          set: { name: 'temp_users.name' }
        }
      }

      expect(() => QueryValidator.validateMergeQuery(query)).toThrow(
        'MERGE query must have an INTO clause'
      )
    })

    it('should throw error when USING is missing', () => {
      const query: QueryMerge = {
        into: 'users',
        on: [{ column: 'users.email', operator: '=', value: 'temp_users.email' }],
        whenMatched: {
          action: 'UPDATE',
          set: { name: 'temp_users.name' }
        }
      }

      expect(() => QueryValidator.validateMergeQuery(query)).toThrow(
        'MERGE query must have a USING clause'
      )
    })

    it('should throw error when ON conditions are missing', () => {
      const query: QueryMerge = {
        into: 'users',
        using: 'temp_users',
        whenMatched: {
          action: 'UPDATE',
          set: { name: 'temp_users.name' }
        }
      }

      expect(() => QueryValidator.validateMergeQuery(query)).toThrow(
        'MERGE query must have ON conditions'
      )
    })

    it('should throw error when ON conditions are empty', () => {
      const query: QueryMerge = {
        into: 'users',
        using: 'temp_users',
        on: [],
        whenMatched: {
          action: 'UPDATE',
          set: { name: 'temp_users.name' }
        }
      }

      expect(() => QueryValidator.validateMergeQuery(query)).toThrow(
        'MERGE query must have ON conditions'
      )
    })

    it('should throw error when no WHEN clauses are provided', () => {
      const query: QueryMerge = {
        into: 'users',
        using: 'temp_users',
        on: [{ column: 'users.email', operator: '=', value: 'temp_users.email' }]
      }

      expect(() => QueryValidator.validateMergeQuery(query)).toThrow(
        'MERGE query must have WHEN MATCHED or WHEN NOT MATCHED clause'
      )
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle SELECT query without columns', () => {
      const query: QuerySelect = {
        from: 'users'
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should handle SELECT query with undefined columns', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: undefined
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should handle SELECT query with empty columns array', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: []
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should handle INSERT query with null values', () => {
      const query: QueryInsert = {
        into: 'users',
        values: null as any
      }

      expect(() => QueryValidator.validateInsertQuery(query)).toThrow(
        'INSERT query must have values'
      )
    })

    it('should handle UPDATE query with empty SET object', () => {
      const query: QueryUpdate = {
        table: 'users',
        set: {}
      }

      expect(() => QueryValidator.validateUpdateQuery(query)).toThrow(
        'UPDATE query must have a SET clause'
      )
    })

    it('should handle complex column expressions', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['COUNT(*) as total', 'AVG(age) as average_age', 'MAX(created_at) as latest_user']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should handle nested table references', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['users.id', 'profiles.name'],
        joins: [
          {
            type: 'INNER',
            table: 'profiles',
            on: [{ column: 'users.id', operator: '=', value: 'profiles.user_id' }]
          }
        ]
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })
  })
})
