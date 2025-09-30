// Mock pg module first
jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({
      rows: [{ id: 1, name: 'John' }],
      rowCount: 1,
      fields: [
        { name: 'id', dataTypeID: 23 },
        { name: 'name', dataTypeID: 1043 }
      ]
    }),
    end: jest.fn().mockResolvedValue(undefined)
  }))
}))

// Mock DialectFactory
jest.mock('@core/dialects/builders', () => ({
  DialectFactory: {
    createGetDataTypeMethod: jest.fn().mockReturnValue(jest.fn().mockReturnValue('VARCHAR'))
  },
  QueryBuilders: {
    buildSetOperations: jest.fn(),
    buildSelectClause: jest.fn().mockImplementation((query, parts) => {
      if (query.columns) {
        parts.push('SELECT', query.columns.join(', '))
      }
    }),
    buildFromClause: jest.fn().mockImplementation((query, parts) => {
      if (query.from) {
        parts.push('FROM', query.from)
      }
    }),
    buildJoinClauses: jest.fn(),
    buildWhereClause: jest.fn(),
    buildGroupByClause: jest.fn(),
    buildHavingClause: jest.fn(),
    buildOrderByClause: jest.fn(),
    buildLimitClause: jest.fn(),
    buildOffsetClause: jest.fn()
  },
  ClauseBuilders: {
    buildWhereConditions: jest.fn().mockImplementation((conditions, params) => {
      // Add the WHERE parameter to the params array
      conditions.forEach((condition: any) => {
        if (condition.value !== undefined) {
          params.push(condition.value)
        }
      })
      return `id = $${params.length}`
    })
  },
  ParameterBuilders: {
    addParam: jest.fn().mockImplementation((value, params) => {
      params.push(value)
      return `$${params.length}`
    }),
    addParamPostgres: jest.fn().mockImplementation((value, params) => {
      params.push(value)
      return `$${params.length}`
    })
  }
}))

import { Postgres } from '@core/dialects/Postgres'
import { Base } from '@core/dialects/Base'
import { DialectFactory } from '@core/dialects/builders'

describe('Postgres Dialect', () => {
  let postgres: Postgres
  let mockConfig: any

  beforeEach(() => {
    mockConfig = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      username: 'user',
      password: 'password'
    }
    postgres = new Postgres(mockConfig)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should extend Base class', () => {
      expect(postgres).toBeInstanceOf(Base)
    })

    it('should initialize with config', () => {
      expect(postgres['config']).toBe(mockConfig)
    })
  })

  describe('createConnection', () => {
    it('should create PostgreSQL connection with default values', async () => {
      const pg = await import('pg')

      await postgres.createConnection(mockConfig)

      expect(pg.Client).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        database: 'test',
        user: 'user',
        password: 'password',
        ssl: false
      })
    })

    it('should create PostgreSQL connection with SSL', async () => {
      const sslConfig = {
        ...mockConfig,
        ssl: true
      }
      const pg = await import('pg')

      await postgres.createConnection(sslConfig)

      expect(pg.Client).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        database: 'test',
        user: 'user',
        password: 'password',
        ssl: { rejectUnauthorized: false }
      })
    })

    it('should return connection with query method', async () => {
      const connection = await postgres.createConnection(mockConfig)

      expect(typeof connection.query).toBe('function')
      expect(typeof connection.transaction).toBe('function')
      expect(typeof connection.close).toBe('function')
    })

    it('should execute query and return results', async () => {
      const connection = await postgres.createConnection(mockConfig)

      const result = await connection.query('SELECT * FROM users', [1])

      expect(result).toEqual({
        rows: [{ id: 1, name: 'John' }],
        rowCount: 1,
        fields: [
          { name: 'id', type: '23', nullable: true },
          { name: 'name', type: '1043', nullable: true }
        ]
      })
    })

    it('should handle transaction successfully', async () => {
      const connection = await postgres.createConnection(mockConfig)

      const result = await connection.transaction(async tx => {
        await tx.query('INSERT INTO users VALUES ($1)', ['John'])
        await tx.commit()
        return 'success'
      })

      expect(result).toBe('success')
    })

    it('should handle transaction rollback on error', async () => {
      const connection = await postgres.createConnection(mockConfig)

      await expect(
        connection.transaction(async tx => {
          await tx.query('INSERT INTO users VALUES ($1)', ['John'])
          throw new Error('Transaction failed')
        })
      ).rejects.toThrow('Transaction failed')
    })

    it('should close connection', async () => {
      const connection = await postgres.createConnection(mockConfig)

      await connection.close()

      // Should not throw error
      expect(true).toBe(true)
    })
  })

  describe('buildSelectQuery', () => {
    it('should build basic SELECT query', () => {
      const query = {
        columns: ['id', 'name'],
        from: 'users'
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('FROM')
      expect(result.params).toEqual([])
    })

    it('should build SELECT query with DISTINCT', () => {
      const query = {
        columns: ['name'],
        from: 'users',
        distinct: true
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT DISTINCT')
    })

    it('should build SELECT query with aggregations', () => {
      const query = {
        aggregations: [
          {
            function: 'COUNT' as const,
            column: 'id',
            alias: 'total'
          }
        ],
        from: 'users'
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('COUNT')
    })

    it('should call QueryBuilders.buildSetOperations', () => {
      const { QueryBuilders } = require('@core/dialects/builders')
      const query = {
        columns: ['id'],
        from: 'users',
        unions: [
          {
            type: 'UNION',
            query: { columns: ['id'], from: 'profiles' }
          }
        ]
      }

      postgres.buildSelectQuery(query as any)

      expect(QueryBuilders.buildSetOperations).toHaveBeenCalledWith(
        query,
        expect.any(Array),
        expect.any(Array),
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  describe('buildInsertQuery', () => {
    it('should build INSERT query with single row', () => {
      const query = {
        into: 'users',
        values: {
          name: 'John',
          age: 30
        }
      }

      const result = postgres.buildInsertQuery(query as any)

      expect(result.sql).toBe('INSERT INTO "users" ("name", "age") VALUES ($1, $2)')
      expect(result.params).toEqual(['John', 30])
    })

    it('should build INSERT query with multiple rows', () => {
      const query = {
        into: 'users',
        values: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      }

      const result = postgres.buildInsertQuery(query as any)

      expect(result.sql).toBe('INSERT INTO "users" ("name", "age") VALUES ($1, $2), ($3, $4)')
      expect(result.params).toEqual(['John', 30, 'Jane', 25])
    })

    it('should build INSERT query with RETURNING clause', () => {
      const query = {
        into: 'users',
        values: {
          name: 'John'
        },
        returning: ['id', 'name']
      }

      const result = postgres.buildInsertQuery(query as any)

      expect(result.sql).toContain('RETURNING')
      expect(result.sql).toContain('"id", "name"')
    })

    it('should build INSERT query with ON CONFLICT', () => {
      const query = {
        into: 'users',
        values: {
          name: 'John',
          email: 'john@example.com'
        },
        conflict: {
          target: ['email'],
          action: 'DO_UPDATE' as const,
          update: {
            name: 'EXCLUDED.name'
          }
        }
      }

      const result = postgres.buildInsertQuery(query as any)

      expect(result.sql).toContain('ON CONFLICT')
      expect(result.sql).toContain('DO UPDATE')
    })
  })

  describe('buildUpdateQuery', () => {
    it('should build UPDATE query', () => {
      const query = {
        table: 'users',
        set: {
          name: 'John',
          age: 30
        },
        where: [
          {
            column: 'id',
            operator: '=' as const,
            value: 1
          }
        ]
      }

      const result = postgres.buildUpdateQuery(query as any)

      expect(result.sql).toBe('UPDATE "users" SET "name" = $1, "age" = $2 WHERE id = $3')
      expect(result.params).toEqual(['John', 30, 1])
    })

    it('should build UPDATE query without WHERE clause', () => {
      const query = {
        table: 'users',
        set: {
          name: 'John'
        }
      }

      const result = postgres.buildUpdateQuery(query as any)

      expect(result.sql).toBe('UPDATE "users" SET "name" = $1')
      expect(result.params).toEqual(['John'])
    })

    it('should build UPDATE query with RETURNING clause', () => {
      const query = {
        table: 'users',
        set: {
          name: 'John'
        },
        returning: ['id', 'name']
      }

      const result = postgres.buildUpdateQuery(query as any)

      expect(result.sql).toContain('RETURNING')
      expect(result.sql).toContain('"id", "name"')
    })
  })

  describe('buildDeleteQuery', () => {
    it('should build DELETE query', () => {
      const query = {
        from: 'users',
        where: [
          {
            column: 'id',
            operator: '=' as const,
            value: 1
          }
        ]
      }

      const result = postgres.buildDeleteQuery(query as any)

      expect(result.sql).toBe('DELETE FROM "users" WHERE id = $1')
      expect(result.params).toEqual([1])
    })

    it('should build DELETE query without WHERE clause', () => {
      const query = {
        from: 'users'
      }

      const result = postgres.buildDeleteQuery(query as any)

      expect(result.sql).toBe('DELETE FROM "users"')
      expect(result.params).toEqual([])
    })

    it('should build DELETE query with RETURNING clause', () => {
      const query = {
        from: 'users',
        returning: ['id', 'name']
      }

      const result = postgres.buildDeleteQuery(query as any)

      expect(result.sql).toContain('RETURNING')
      expect(result.sql).toContain('"id", "name"')
    })
  })

  describe('buildMergeQuery', () => {
    it('should build MERGE query', () => {
      const query = {
        into: 'users',
        using: 'temp_users',
        on: [
          {
            column: 'users.id',
            operator: '=' as const,
            value: 'temp_users.user_id'
          }
        ],
        whenMatched: {
          update: {
            name: 'temp_users.name'
          }
        },
        whenNotMatched: {
          insert: {
            id: 'temp_users.user_id',
            name: 'temp_users.name'
          }
        }
      }

      const result = postgres.buildMergeQuery(query as any)

      expect(result.sql).toContain('MERGE INTO')
      expect(result.sql).toContain('USING')
      expect(result.sql).toContain('ON')
      expect(result.sql).toContain('WHEN MATCHED')
      expect(result.sql).toContain('WHEN NOT MATCHED')
    })
  })

  describe('escapeIdentifier', () => {
    it('should escape simple identifier with double quotes', () => {
      const result = postgres.escapeIdentifier('users')
      expect(result).toBe('"users"')
    })

    it('should escape identifier with double quotes', () => {
      const result = postgres.escapeIdentifier('user"name')
      expect(result).toBe('"user""name"')
    })

    it('should escape qualified identifier', () => {
      const result = postgres.escapeIdentifier('schema.users')
      expect(result).toBe('"schema"."users"')
    })

    it('should escape qualified identifier with double quotes', () => {
      const result = postgres.escapeIdentifier('schema.user"name')
      expect(result).toBe('"schema"."user""name"')
    })
  })

  describe('escapeValue', () => {
    it('should escape null value', () => {
      const result = postgres.escapeValue(null)
      expect(result).toBe('NULL')
    })

    it('should escape undefined value', () => {
      const result = postgres.escapeValue(undefined)
      expect(result).toBe('NULL')
    })

    it('should escape string value', () => {
      const result = postgres.escapeValue('hello')
      expect(result).toBe("'hello'")
    })

    it('should escape string with quotes', () => {
      const result = postgres.escapeValue("hello'world")
      expect(result).toBe("'hello''world'")
    })

    it('should escape boolean true', () => {
      const result = postgres.escapeValue(true)
      expect(result).toBe('true')
    })

    it('should escape boolean false', () => {
      const result = postgres.escapeValue(false)
      expect(result).toBe('false')
    })

    it('should escape Date value', () => {
      const date = new Date('2023-01-01T00:00:00.000Z')
      const result = postgres.escapeValue(date)
      expect(result).toBe("'2023-01-01T00:00:00.000Z'")
    })

    it('should escape array value', () => {
      const result = postgres.escapeValue([1, 'hello', true])
      expect(result).toBe("ARRAY[1, 'hello', true]")
    })

    it('should escape nested array value', () => {
      const result = postgres.escapeValue([1, [2, 3]])
      expect(result).toBe('ARRAY[1, ARRAY[2, 3]]')
    })

    it('should escape object value', () => {
      const result = postgres.escapeValue({ name: 'John', age: 30 })
      expect(result).toBe('\'{"name":"John","age":30}\'')
    })

    it('should escape number value', () => {
      const result = postgres.escapeValue(42)
      expect(result).toBe('42')
    })

    it('should escape decimal value', () => {
      const result = postgres.escapeValue(3.14)
      expect(result).toBe('3.14')
    })
  })

  describe('getDataType', () => {
    it('should call DialectFactory.createGetDataTypeMethod', () => {
      postgres.getDataType('string')

      expect(DialectFactory.createGetDataTypeMethod).toHaveBeenCalledWith('postgres')
    })

    it('should return PostgreSQL data type', () => {
      const result = postgres.getDataType('string')
      expect(result).toBe('VARCHAR')
    })
  })

  describe('PostgreSQL-specific features', () => {
    it('should support JSON operations', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonPaths: [
          {
            column: 'profile',
            path: 'name',
            operator: '->>' as const,
            alias: 'profile_name'
          }
        ]
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('FROM')
    })

    it('should support Array operations', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayOperations: [
          {
            column: 'tags',
            operation: 'CONTAINS' as const,
            value: ['admin']
          }
        ]
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('FROM')
    })

    it('should support PIVOT operations', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        pivot: {
          column: 'category',
          values: ['A', 'B'],
          aggregate: 'SUM(amount)',
          alias: 'pivot_result'
        }
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('FROM')
    })
  })

  describe('private methods', () => {
    it('should call buildBasicSelectClauses', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('SELECT')
      expect(result.sql).toContain('FROM')
    })

    it('should call buildAdvancedClauses', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildSelectQuery(query as any)

      // Should build successfully without advanced clauses
      expect(result.sql).toBeDefined()
      expect(result.sql).toContain('SELECT')
    })
  })

  describe('buildAggregationExpression', () => {
    it('should build PERCENTILE_CONT aggregation', () => {
      const query = {
        aggregations: [
          {
            function: 'PERCENTILE_CONT' as const,
            column: 'score',
            percentile: 0.95,
            alias: 'p95_score'
          }
        ],
        from: 'scores'
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain(
        'PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "score") AS "p95_score"'
      )
    })

    it('should build PERCENTILE_DISC aggregation', () => {
      const query = {
        aggregations: [
          {
            function: 'PERCENTILE_DISC' as const,
            column: 'score',
            percentile: 0.5,
            alias: 'median_score'
          }
        ],
        from: 'scores'
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain(
        'PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY "score") AS "median_score"'
      )
    })

    it('should build PERCENTILE_CONT with default percentile', () => {
      const query = {
        aggregations: [
          {
            function: 'PERCENTILE_CONT' as const,
            column: 'score'
          }
        ],
        from: 'scores'
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "score")')
    })

    it('should build DISTINCT aggregation', () => {
      const query = {
        aggregations: [
          {
            function: 'COUNT' as const,
            column: 'id',
            distinct: true,
            alias: 'unique_count'
          }
        ],
        from: 'users'
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('COUNT(DISTINCT "id") AS "unique_count"')
    })
  })

  describe('buildJsonPathClause', () => {
    it('should build JSON path clause with alias', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonPaths: [
          {
            column: 'profile',
            path: 'name',
            operator: '->>' as const,
            alias: 'profile_name'
          }
        ]
      }

      const result = postgres.buildJsonPathClause(query as any)

      expect(result).toBe('"profile"->>\'name\' AS "profile_name"')
    })

    it('should build JSON path clause without alias', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonPaths: [
          {
            column: 'profile',
            path: 'name',
            operator: '->' as const
          }
        ]
      }

      const result = postgres.buildJsonPathClause(query as any)

      expect(result).toBe('"profile"->\'name\'')
    })

    it('should return empty string when no jsonPaths', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildJsonPathClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildJsonFunctionClause', () => {
    it('should build json_extract function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonFunctions: [
          {
            column: 'profile',
            path: 'name',
            function: 'json_extract' as const,
            alias: 'extracted_name'
          }
        ]
      }

      const result = postgres.buildJsonFunctionClause(query as any)

      expect(result).toBe('json_extract("profile", \'name\') AS "extracted_name"')
    })

    it('should build json_set function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonFunctions: [
          {
            column: 'profile',
            path: 'name',
            function: 'json_set' as const,
            value: 'John',
            alias: 'updated_profile'
          }
        ]
      }

      const result = postgres.buildJsonFunctionClause(query as any)

      expect(result).toBe('json_set("profile", \'name\', \'John\') AS "updated_profile"')
    })

    it('should build json_remove function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonFunctions: [
          {
            column: 'profile',
            path: 'temp_field',
            function: 'json_remove' as const,
            alias: 'cleaned_profile'
          }
        ]
      }

      const result = postgres.buildJsonFunctionClause(query as any)

      expect(result).toBe('json_remove("profile", \'temp_field\') AS "cleaned_profile"')
    })

    it('should build json_insert function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonFunctions: [
          {
            column: 'profile',
            path: 'new_field',
            function: 'json_insert' as const,
            value: 'new_value',
            alias: 'inserted_profile'
          }
        ]
      }

      const result = postgres.buildJsonFunctionClause(query as any)

      expect(result).toBe(
        'json_insert("profile", \'new_field\', \'new_value\') AS "inserted_profile"'
      )
    })

    it('should build json_replace function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonFunctions: [
          {
            column: 'profile',
            path: 'name',
            function: 'json_replace' as const,
            value: 'Jane',
            alias: 'replaced_profile'
          }
        ]
      }

      const result = postgres.buildJsonFunctionClause(query as any)

      expect(result).toBe('json_replace("profile", \'name\', \'Jane\') AS "replaced_profile"')
    })

    it('should build json_valid function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        jsonFunctions: [
          {
            column: 'profile',
            path: '',
            function: 'json_valid' as const,
            alias: 'is_valid_json'
          }
        ]
      }

      const result = postgres.buildJsonFunctionClause(query as any)

      expect(result).toBe('json_valid("profile") AS "is_valid_json"')
    })

    it('should return empty string when no jsonFunctions', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildJsonFunctionClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildArrayFunctionClause', () => {
    it('should build array_agg function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayFunctions: [
          {
            column: 'tags',
            function: 'array_agg' as const,
            alias: 'all_tags'
          }
        ]
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('array_agg("tags") AS "all_tags"')
    })

    it('should build array_agg with orderBy', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayFunctions: [
          {
            column: 'tags',
            function: 'array_agg' as const,
            orderBy: ['tag_name'],
            alias: 'ordered_tags'
          }
        ]
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('array_agg("tags" ORDER BY "tag_name") AS "ordered_tags"')
    })

    it('should build unnest function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayFunctions: [
          {
            column: 'tags',
            function: 'unnest' as const,
            alias: 'individual_tag'
          }
        ]
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('unnest("tags") AS "individual_tag"')
    })

    it('should build array_length function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayFunctions: [
          {
            column: 'tags',
            function: 'array_length' as const,
            alias: 'tag_count'
          }
        ]
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('array_length("tags", 1) AS "tag_count"')
    })

    it('should build array_append function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayFunctions: [
          {
            column: 'tags',
            function: 'array_append' as const,
            value: 'new_tag',
            alias: 'extended_tags'
          }
        ]
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('array_append("tags", \'new_tag\') AS "extended_tags"')
    })

    it('should build array_prepend function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayFunctions: [
          {
            column: 'tags',
            function: 'array_prepend' as const,
            value: 'first_tag',
            alias: 'prepended_tags'
          }
        ]
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('array_prepend("tags", \'first_tag\') AS "prepended_tags"')
    })

    it('should build array_cat function', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayFunctions: [
          {
            column: 'tags',
            function: 'array_cat' as const,
            value: ['tag1', 'tag2'],
            alias: 'concatenated_tags'
          }
        ]
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('array_cat("tags", ARRAY[\'tag1\', \'tag2\']) AS "concatenated_tags"')
    })

    it('should return empty string when no arrayFunctions', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildArrayFunctionClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildArraySliceClause', () => {
    it('should build array slice clause', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arraySlices: [
          {
            column: 'tags',
            start: 1,
            end: 3,
            alias: 'first_tags'
          }
        ]
      }

      const result = postgres.buildArraySliceClause(query as any)

      expect(result).toBe('"tags"[1:3] AS "first_tags"')
    })

    it('should build array slice without alias', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arraySlices: [
          {
            column: 'tags',
            start: 0,
            end: 2
          }
        ]
      }

      const result = postgres.buildArraySliceClause(query as any)

      expect(result).toBe('"tags"[0:2]')
    })

    it('should return empty string when no arraySlices', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildArraySliceClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildPivotClause', () => {
    it('should build pivot clause with alias', () => {
      const query = {
        columns: ['id'],
        from: 'sales',
        pivot: {
          column: 'category',
          values: ['A', 'B', 'C'],
          aggregate: 'SUM(amount)',
          alias: 'pivot_result'
        }
      }

      const result = postgres.buildPivotClause(query as any)

      expect(result).toBe('PIVOT (SUM(amount) FOR "category" IN ("A", "B", "C")) AS "pivot_result"')
    })

    it('should build pivot clause without alias', () => {
      const query = {
        columns: ['id'],
        from: 'sales',
        pivot: {
          column: 'category',
          values: ['A', 'B'],
          aggregate: 'COUNT(*)'
        }
      }

      const result = postgres.buildPivotClause(query as any)

      expect(result).toBe('PIVOT (COUNT(*) FOR "category" IN ("A", "B"))')
    })

    it('should return empty string when no pivot', () => {
      const query = {
        columns: ['id'],
        from: 'sales'
      }

      const result = postgres.buildPivotClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildUnpivotClause', () => {
    it('should build unpivot clause', () => {
      const query = {
        columns: ['id'],
        from: 'sales',
        unpivot: {
          columns: ['q1', 'q2', 'q3'],
          valueColumn: 'amount',
          nameColumn: 'quarter'
        }
      }

      const result = postgres.buildUnpivotClause(query as any)

      expect(result).toBe('UNPIVOT ("amount" FOR "quarter" IN ("q1", "q2", "q3"))')
    })

    it('should return empty string when no unpivot', () => {
      const query = {
        columns: ['id'],
        from: 'sales'
      }

      const result = postgres.buildUnpivotClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildOrdinalityClause', () => {
    it('should build ordinality clause', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        ordinality: {
          valueColumn: 'value',
          ordinalityColumn: 'row_number'
        }
      }

      const result = postgres.buildOrdinalityClause(query as any)

      expect(result).toBe('WITH ORDINALITY AS "value", "row_number"')
    })

    it('should return empty string when no ordinality', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildOrdinalityClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildArrayOperationClause', () => {
    it('should build array operation clause', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayOperations: [
          {
            column: 'tags',
            operator: 'CONTAINS' as const,
            value: ['admin', 'user']
          }
        ]
      }

      const result = postgres.buildArrayOperationClause(query as any)

      expect(result).toBe("\"tags\" CONTAINS ARRAY['admin', 'user']")
    })

    it('should build array operation with single value', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayOperations: [
          {
            column: 'tags',
            operator: '=' as const,
            value: 'admin'
          }
        ]
      }

      const result = postgres.buildArrayOperationClause(query as any)

      expect(result).toBe('"tags" = \'admin\'')
    })

    it('should return empty string when no arrayOperations', () => {
      const query = {
        columns: ['id'],
        from: 'users'
      }

      const result = postgres.buildArrayOperationClause(query as any)

      expect(result).toBe('')
    })
  })

  describe('buildWhereClauseWithArrayOperations', () => {
    it('should build WHERE clause with array operations', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        where: [
          {
            column: 'status',
            operator: '=' as const,
            value: 'active'
          }
        ],
        arrayOperations: [
          {
            column: 'tags',
            operator: 'CONTAINS' as const,
            value: ['admin']
          }
        ]
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('AND')
      expect(result.sql).toContain('CONTAINS')
    })

    it('should build WHERE clause with only array operations', () => {
      const query = {
        columns: ['id'],
        from: 'users',
        arrayOperations: [
          {
            column: 'tags',
            operator: 'CONTAINS' as const,
            value: ['admin']
          }
        ]
      }

      const result = postgres.buildSelectQuery(query as any)

      expect(result.sql).toContain('WHERE')
      expect(result.sql).toContain('CONTAINS')
    })
  })

  describe('buildMergeQuery edge cases', () => {
    it('should handle MERGE with subquery using', () => {
      const query = {
        into: 'users',
        using: {
          query: 'SELECT * FROM temp_users',
          params: []
        },
        on: [
          {
            column: 'users.id',
            operator: '=' as const,
            value: 'temp_users.user_id'
          }
        ],
        whenMatched: {
          update: {
            name: 'temp_users.name'
          }
        }
      }

      const result = postgres.buildMergeQuery(query as any)

      expect(result.sql).toContain('USING (SELECT * FROM temp_users)')
    })

    it('should handle MERGE with whenMatched delete', () => {
      const query = {
        into: 'users',
        using: 'temp_users',
        on: [
          {
            column: 'users.id',
            operator: '=' as const,
            value: 'temp_users.user_id'
          }
        ],
        whenMatched: {
          delete: true
        }
      }

      const result = postgres.buildMergeQuery(query as any)

      expect(result.sql).toContain('WHEN MATCHED THEN DELETE')
    })

    it('should handle MERGE with conflict where clause', () => {
      const query = {
        into: 'users',
        values: {
          name: 'John',
          email: 'john@example.com'
        },
        conflict: {
          target: ['email'],
          action: 'DO_UPDATE' as const,
          update: {
            name: 'EXCLUDED.name'
          },
          where: [
            {
              column: 'status',
              operator: '=' as const,
              value: 'active'
            }
          ]
        }
      }

      const result = postgres.buildInsertQuery(query as any)

      expect(result.sql).toContain('WHERE')
    })

    it('should handle MERGE with returning clause', () => {
      const query = {
        into: 'users',
        using: 'temp_users',
        on: [
          {
            column: 'users.id',
            operator: '=' as const,
            value: 'temp_users.user_id'
          }
        ],
        whenMatched: {
          update: {
            name: 'temp_users.name'
          }
        },
        returning: ['id', 'name']
      }

      const result = postgres.buildMergeQuery(query as any)

      expect(result.sql).toContain('RETURNING')
      expect(result.sql).toContain('"id", "name"')
    })
  })

  describe('escapeValue edge cases', () => {
    it('should escape bigint value', () => {
      const result = postgres.escapeValue(BigInt(123456789))
      expect(result).toBe('123456789')
    })

    it('should escape symbol value', () => {
      const sym = Symbol('test')
      const result = postgres.escapeValue(sym)
      expect(result).toBe(`'${String(sym).replace(/'/g, "''")}'`)
    })

    it('should escape function value', () => {
      const func = () => 'test'
      const result = postgres.escapeValue(func)
      expect(result).toBe(`'${String(func).replace(/'/g, "''")}'`)
    })

    it('should escape object with quotes in JSON', () => {
      const obj = { name: "John's data", value: 'test' }
      const result = postgres.escapeValue(obj)
      expect(result).toBe('\'{"name":"John\'\'s data","value":"test"}\'')
    })

    it('should escape unknown type as string', () => {
      const unknownValue = { toString: () => 'unknown' }
      const result = postgres.escapeValue(unknownValue)
      expect(result).toBe(`'${JSON.stringify(unknownValue).replace(/'/g, "''")}'`)
    })
  })

  describe('addParam', () => {
    it('should use ParameterBuilders.addParamPostgres', () => {
      const { ParameterBuilders } = require('@core/dialects/builders')
      const params: unknown[] = []

      postgres['addParam']('test', params)

      expect(ParameterBuilders.addParamPostgres).toHaveBeenCalledWith('test', params)
    })
  })
})
