/**
 * @fileoverview Unit tests for QueryValidator
 * @description Tests the query validation functionality for security
 */

import { QueryValidator } from '@core/security/QueryValidator'
import type { QuerySelect, QueryInsert, QueryUpdate, QueryDelete } from '@interfaces/index'

describe('QueryValidator', () => {
  describe('validateSelectQuery', () => {
    it('should validate valid SELECT query', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id', 'name', 'email']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with wildcard', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['*']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with table wildcard', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['users.*']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should validate SELECT query with aliases', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id as user_id', 'name as full_name']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).not.toThrow()
    })

    it('should throw error when FROM is missing', () => {
      const query: QuerySelect = {
        columns: ['id', 'name']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'SELECT query must have a FROM clause'
      )
    })

    it('should throw error when FROM is null', () => {
      const query: QuerySelect = {
        from: null as any,
        columns: ['id', 'name']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'SELECT query must have a FROM clause'
      )
    })

    it('should throw error for invalid column alias', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id as invalid;alias']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'Invalid column alias: invalid;alias'
      )
    })

    it('should throw error for malformed alias', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: ['id as']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow('Invalid column name: id as')
    })

    it('should throw error for non-string columns', () => {
      const query: QuerySelect = {
        from: 'users',
        columns: [123 as any, 'name']
      }

      expect(() => QueryValidator.validateSelectQuery(query)).toThrow(
        'Column names must be strings'
      )
    })
  })

  describe('validateInsertQuery', () => {
    it('should validate valid INSERT query', () => {
      const query: QueryInsert = {
        into: 'users',
        values: { name: 'John', email: 'john@example.com' }
      }

      expect(() => QueryValidator.validateInsertQuery(query)).not.toThrow()
    })

    it('should validate INSERT query with batch values', () => {
      const query: QueryInsert = {
        into: 'users',
        values: [
          { name: 'John', email: 'john@example.com' },
          { name: 'Jane', email: 'jane@example.com' }
        ]
      }

      expect(() => QueryValidator.validateInsertQuery(query)).not.toThrow()
    })

    it('should throw error when INTO is missing', () => {
      const query: QueryInsert = {
        values: { name: 'John' }
      }

      expect(() => QueryValidator.validateInsertQuery(query)).toThrow(
        'INSERT query must have an INTO clause'
      )
    })

    it('should throw error when VALUES is missing', () => {
      const query: QueryInsert = {
        into: 'users'
      }

      expect(() => QueryValidator.validateInsertQuery(query)).toThrow(
        'INSERT query must have values'
      )
    })

    it('should throw error when VALUES is empty', () => {
      const query: QueryInsert = {
        into: 'users',
        values: []
      }

      expect(() => QueryValidator.validateInsertQuery(query)).toThrow(
        'INSERT query must have values'
      )
    })
  })

  describe('validateUpdateQuery', () => {
    it('should validate valid UPDATE query', () => {
      const query: QueryUpdate = {
        table: 'users',
        set: { name: 'John', email: 'john@example.com' }
      }

      expect(() => QueryValidator.validateUpdateQuery(query)).not.toThrow()
    })

    it('should throw error when table is missing', () => {
      const query: QueryUpdate = {
        set: { name: 'John' }
      }

      expect(() => QueryValidator.validateUpdateQuery(query)).toThrow(
        'UPDATE query must have a table'
      )
    })

    it('should throw error when SET is missing', () => {
      const query: QueryUpdate = {
        table: 'users'
      }

      expect(() => QueryValidator.validateUpdateQuery(query)).toThrow(
        'UPDATE query must have a SET clause'
      )
    })
  })

  describe('validateDeleteQuery', () => {
    it('should validate valid DELETE query', () => {
      const query: QueryDelete = {
        from: 'users',
        where: [{ column: 'id', operator: '=', value: 1 }]
      }

      expect(() => QueryValidator.validateDeleteQuery(query)).not.toThrow()
    })

    it('should throw error when FROM is missing', () => {
      const query: QueryDelete = {
        where: [{ column: 'id', operator: '=', value: 1 }]
      }

      expect(() => QueryValidator.validateDeleteQuery(query)).toThrow(
        'DELETE query must have a FROM clause'
      )
    })

    it('should throw error when WHERE is missing', () => {
      const query: QueryDelete = {
        from: 'users'
      }

      expect(() => QueryValidator.validateDeleteQuery(query)).toThrow(
        'DELETE query must have a WHERE clause for safety'
      )
    })

    it('should throw error when WHERE is empty', () => {
      const query: QueryDelete = {
        from: 'users',
        where: []
      }

      expect(() => QueryValidator.validateDeleteQuery(query)).toThrow(
        'DELETE query must have a WHERE clause for safety'
      )
    })
  })
})
