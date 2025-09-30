/**
 * @fileoverview Unit tests for WhereClauseHelper
 * @description Tests the WHERE clause helper functionality
 */

import { WhereClauseHelper } from '@builders/helpers/WhereClause'
import type { QueryWhereCondition } from '@interfaces/index'

describe('WhereClauseHelper', () => {
  describe('createWhereCondition', () => {
    it('should create a simple equality condition', () => {
      const condition = WhereClauseHelper.createWhereCondition('id', 1)

      expect(condition).toEqual({
        column: 'id',
        operator: '=',
        value: 1
      })
    })

    it('should create a condition with explicit operator', () => {
      const condition = WhereClauseHelper.createWhereCondition('age', '>', 18)

      expect(condition).toEqual({
        column: 'age',
        operator: '>',
        value: 18
      })
    })

    it('should create a LIKE condition', () => {
      const condition = WhereClauseHelper.createWhereCondition('name', 'LIKE', '%john%')

      expect(condition).toEqual({
        column: 'name',
        operator: 'LIKE',
        value: '%john%'
      })
    })

    it('should create an IN condition', () => {
      const condition = WhereClauseHelper.createWhereCondition('status', 'IN', [
        'active',
        'pending'
      ])

      expect(condition).toEqual({
        column: 'status',
        operator: 'IN',
        value: ['active', 'pending']
      })
    })

    it('should create a BETWEEN condition with array', () => {
      const condition = WhereClauseHelper.createWhereCondition('age', 'BETWEEN', [18, 65])

      expect(condition).toEqual({
        column: 'age',
        operator: 'BETWEEN',
        value: [18, 65]
      })
    })

    it('should create a BETWEEN condition with single value', () => {
      const condition = WhereClauseHelper.createWhereCondition('age', 'BETWEEN', 18)

      expect(condition).toEqual({
        column: 'age',
        operator: 'BETWEEN',
        value: [18, 18]
      })
    })

    it('should create a RAW condition', () => {
      const condition = WhereClauseHelper.createWhereCondition('id', 'RAW', [1, 2, 3])

      expect(condition).toEqual({
        column: 'id',
        operator: 'RAW',
        value: [1, 2, 3]
      })
    })

    it('should return existing condition object', () => {
      const existingCondition: QueryWhereCondition = {
        column: 'name',
        operator: '=',
        value: 'test'
      }

      const condition = WhereClauseHelper.createWhereCondition(existingCondition)

      expect(condition).toBe(existingCondition)
    })

    it('should handle null values', () => {
      const condition = WhereClauseHelper.createWhereCondition('deleted_at', 'IS NULL')

      expect(condition).toEqual({
        column: 'deleted_at',
        operator: 'IS NULL',
        value: null
      })
    })
  })

  describe('createAndWhereCondition', () => {
    it('should create an AND condition', () => {
      const condition = WhereClauseHelper.createAndWhereCondition('active', true)

      expect(condition).toEqual({
        column: 'active',
        operator: '=',
        value: true,
        logical: 'AND'
      })
    })

    it('should create an AND condition with operator', () => {
      const condition = WhereClauseHelper.createAndWhereCondition('age', '>=', 18)

      expect(condition).toEqual({
        column: 'age',
        operator: '>=',
        value: 18,
        logical: 'AND'
      })
    })
  })

  describe('createOrWhereCondition', () => {
    it('should create an OR condition', () => {
      const condition = WhereClauseHelper.createOrWhereCondition('status', '=', 'active')

      expect(condition).toEqual({
        column: 'status',
        operator: '=',
        value: 'active',
        logical: 'OR'
      })
    })

    it('should create an OR condition with operator', () => {
      const condition = WhereClauseHelper.createOrWhereCondition('role', 'IN', ['admin', 'user'])

      expect(condition).toEqual({
        column: 'role',
        operator: 'IN',
        value: ['admin', 'user'],
        logical: 'OR'
      })
    })
  })
})
