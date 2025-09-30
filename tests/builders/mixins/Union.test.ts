/**
 * @fileoverview Unit tests for UnionMixin
 * @description Tests the UNION and set operations mixin functionality
 */

import { UnionMixin } from '@builders/mixins/Union'
import type { QuerySelect } from '@interfaces/index'

describe('UnionMixin', () => {
  let query: QuerySelect
  let unionQuery: QuerySelect

  beforeEach(() => {
    query = {} as QuerySelect
    unionQuery = {} as QuerySelect
  })

  describe('addUnion', () => {
    it('should add a UNION clause to the query', () => {
      UnionMixin.addUnion(query, unionQuery)

      expect(query.unions).toBeDefined()
      expect(query.unions).toHaveLength(1)
      expect(query.unions![0]).toEqual({
        type: 'UNION',
        query: unionQuery
      })
    })

    it('should add multiple UNION clauses', () => {
      const unionQuery2 = {} as QuerySelect

      UnionMixin.addUnion(query, unionQuery)
      UnionMixin.addUnion(query, unionQuery2)

      expect(query.unions).toHaveLength(2)
      expect(query.unions![0].type).toBe('UNION')
      expect(query.unions![1].type).toBe('UNION')
    })

    it('should handle existing unions', () => {
      query.unions = [
        {
          type: 'UNION',
          query: {} as QuerySelect
        }
      ]

      UnionMixin.addUnion(query, unionQuery)

      expect(query.unions).toHaveLength(2)
    })
  })

  describe('addUnionAll', () => {
    it('should add a UNION ALL clause to the query', () => {
      UnionMixin.addUnionAll(query, unionQuery)

      expect(query.unions).toBeDefined()
      expect(query.unions).toHaveLength(1)
      expect(query.unions![0]).toEqual({
        type: 'UNION ALL',
        query: unionQuery
      })
    })

    it('should add multiple UNION ALL clauses', () => {
      const unionQuery2 = {} as QuerySelect

      UnionMixin.addUnionAll(query, unionQuery)
      UnionMixin.addUnionAll(query, unionQuery2)

      expect(query.unions).toHaveLength(2)
      expect(query.unions![0].type).toBe('UNION ALL')
      expect(query.unions![1].type).toBe('UNION ALL')
    })
  })

  describe('addIntersect', () => {
    it('should add an INTERSECT clause to the query', () => {
      UnionMixin.addIntersect(query, unionQuery)

      expect(query.unions).toBeDefined()
      expect(query.unions).toHaveLength(1)
      expect(query.unions![0]).toEqual({
        type: 'INTERSECT',
        query: unionQuery
      })
    })

    it('should throw error when intersectQuery is null', () => {
      expect(() => {
        UnionMixin.addIntersect(query, null as any)
      }).toThrow('INTERSECT requires a query')
    })

    it('should throw error when intersectQuery is undefined', () => {
      expect(() => {
        UnionMixin.addIntersect(query, undefined as any)
      }).toThrow('INTERSECT requires a query')
    })

    it('should add multiple INTERSECT clauses', () => {
      const intersectQuery2 = {} as QuerySelect

      UnionMixin.addIntersect(query, unionQuery)
      UnionMixin.addIntersect(query, intersectQuery2)

      expect(query.unions).toHaveLength(2)
      expect(query.unions![0].type).toBe('INTERSECT')
      expect(query.unions![1].type).toBe('INTERSECT')
    })
  })

  describe('addExcept', () => {
    it('should add an EXCEPT clause to the query', () => {
      UnionMixin.addExcept(query, unionQuery)

      expect(query.unions).toBeDefined()
      expect(query.unions).toHaveLength(1)
      expect(query.unions![0]).toEqual({
        type: 'EXCEPT',
        query: unionQuery
      })
    })

    it('should throw error when exceptQuery is null', () => {
      expect(() => {
        UnionMixin.addExcept(query, null as any)
      }).toThrow('EXCEPT requires a query')
    })

    it('should throw error when exceptQuery is undefined', () => {
      expect(() => {
        UnionMixin.addExcept(query, undefined as any)
      }).toThrow('EXCEPT requires a query')
    })

    it('should add multiple EXCEPT clauses', () => {
      const exceptQuery2 = {} as QuerySelect

      UnionMixin.addExcept(query, unionQuery)
      UnionMixin.addExcept(query, exceptQuery2)

      expect(query.unions).toHaveLength(2)
      expect(query.unions![0].type).toBe('EXCEPT')
      expect(query.unions![1].type).toBe('EXCEPT')
    })
  })

  describe('addMinus', () => {
    it('should add a MINUS clause to the query', () => {
      UnionMixin.addMinus(query, unionQuery)

      expect(query.unions).toBeDefined()
      expect(query.unions).toHaveLength(1)
      expect(query.unions![0]).toEqual({
        type: 'MINUS',
        query: unionQuery
      })
    })

    it('should throw error when minusQuery is null', () => {
      expect(() => {
        UnionMixin.addMinus(query, null as any)
      }).toThrow('EXCEPT requires a query')
    })

    it('should throw error when minusQuery is undefined', () => {
      expect(() => {
        UnionMixin.addMinus(query, undefined as any)
      }).toThrow('EXCEPT requires a query')
    })

    it('should add multiple MINUS clauses', () => {
      const minusQuery2 = {} as QuerySelect

      UnionMixin.addMinus(query, unionQuery)
      UnionMixin.addMinus(query, minusQuery2)

      expect(query.unions).toHaveLength(2)
      expect(query.unions![0].type).toBe('MINUS')
      expect(query.unions![1].type).toBe('MINUS')
    })
  })

  describe('mixed operations', () => {
    it('should handle mixed set operations', () => {
      const query2 = {} as QuerySelect
      const query3 = {} as QuerySelect
      const query4 = {} as QuerySelect

      UnionMixin.addUnion(query, unionQuery)
      UnionMixin.addIntersect(query, query2)
      UnionMixin.addExcept(query, query3)
      UnionMixin.addMinus(query, query4)

      expect(query.unions).toHaveLength(4)
      expect(query.unions![0].type).toBe('UNION')
      expect(query.unions![1].type).toBe('INTERSECT')
      expect(query.unions![2].type).toBe('EXCEPT')
      expect(query.unions![3].type).toBe('MINUS')
    })
  })
})
