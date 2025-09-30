/**
 * @fileoverview Unit tests for Operator constants
 * @description Tests the operator constants and utilities
 */

import { validOperators } from '@constants/Operator'

describe('Operator', () => {
  describe('validOperators', () => {
    it('should be an array of valid operators', () => {
      expect(Array.isArray(validOperators)).toBe(true)
      expect(validOperators.length).toBeGreaterThan(0)
    })

    it('should contain basic comparison operators', () => {
      expect(validOperators).toContain('=')
      expect(validOperators).toContain('!=')
      expect(validOperators).toContain('>')
      expect(validOperators).toContain('<')
      expect(validOperators).toContain('>=')
      expect(validOperators).toContain('<=')
    })

    it('should contain string operators', () => {
      expect(validOperators).toContain('LIKE')
      expect(validOperators).toContain('ILIKE')
      expect(validOperators).toContain('NOT LIKE')
    })

    it('should contain array operators', () => {
      expect(validOperators).toContain('IN')
      expect(validOperators).toContain('NOT IN')
      expect(validOperators).toContain('BETWEEN')
      expect(validOperators).toContain('NOT BETWEEN')
    })

    it('should contain null operators', () => {
      expect(validOperators).toContain('IS NULL')
      expect(validOperators).toContain('IS NOT NULL')
    })

    it('should contain existence operators', () => {
      expect(validOperators).toContain('EXISTS')
      expect(validOperators).toContain('NOT EXISTS')
    })
  })
})
