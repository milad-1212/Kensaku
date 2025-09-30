import { JsonMixin } from '@builders/mixins/index'
import type { QuerySelect, QueryJsonPath, QueryJsonFunction } from '@interfaces/index'

describe('JsonMixin', () => {
  let mockQuery: QuerySelect

  beforeEach(() => {
    mockQuery = {
      columns: [],
      from: 'users'
    }
  })

  describe('addJsonPath', () => {
    it('should add JSON path with default operator', () => {
      JsonMixin.addJsonPath(mockQuery, 'metadata', '$.name', undefined, 'user_name')

      expect(mockQuery.jsonPaths).toHaveLength(1)
      expect(mockQuery.jsonPaths![0]).toEqual({
        column: 'metadata',
        path: '$.name',
        operator: '->>',
        alias: 'user_name'
      })
    })

    it('should add JSON path with -> operator', () => {
      JsonMixin.addJsonPath(mockQuery, 'data', '$.items', '->', 'items')

      expect(mockQuery.jsonPaths).toHaveLength(1)
      expect(mockQuery.jsonPaths![0]).toEqual({
        column: 'data',
        path: '$.items',
        operator: '->',
        alias: 'items'
      })
    })

    it('should add JSON path with ->> operator', () => {
      JsonMixin.addJsonPath(mockQuery, 'profile', '$.settings.theme', '->>', 'theme')

      expect(mockQuery.jsonPaths).toHaveLength(1)
      expect(mockQuery.jsonPaths![0]).toEqual({
        column: 'profile',
        path: '$.settings.theme',
        operator: '->>',
        alias: 'theme'
      })
    })

    it('should add JSON path without alias', () => {
      JsonMixin.addJsonPath(mockQuery, 'metadata', '$.id')

      expect(mockQuery.jsonPaths).toHaveLength(1)
      expect(mockQuery.jsonPaths![0]).toEqual({
        column: 'metadata',
        path: '$.id',
        operator: '->>'
      })
    })

    it('should initialize jsonPaths array if undefined', () => {
      expect(mockQuery.jsonPaths).toBeUndefined()

      JsonMixin.addJsonPath(mockQuery, 'data', '$.value')

      expect(mockQuery.jsonPaths).toBeDefined()
      expect(mockQuery.jsonPaths).toHaveLength(1)
    })

    it('should append to existing jsonPaths array', () => {
      JsonMixin.addJsonPath(mockQuery, 'data', '$.field1', '->>', 'field1')
      JsonMixin.addJsonPath(mockQuery, 'data', '$.field2', '->>', 'field2')

      expect(mockQuery.jsonPaths).toHaveLength(2)
      expect(mockQuery.jsonPaths![0].path).toBe('$.field1')
      expect(mockQuery.jsonPaths![1].path).toBe('$.field2')
    })

    it('should handle complex JSON paths', () => {
      JsonMixin.addJsonPath(mockQuery, 'config', '$.database.connections[0].host', '->>', 'db_host')

      expect(mockQuery.jsonPaths).toHaveLength(1)
      expect(mockQuery.jsonPaths![0]).toEqual({
        column: 'config',
        path: '$.database.connections[0].host',
        operator: '->>',
        alias: 'db_host'
      })
    })

    it('should handle array index paths', () => {
      JsonMixin.addJsonPath(mockQuery, 'items', '$[0].name', '->>', 'first_item_name')

      expect(mockQuery.jsonPaths).toHaveLength(1)
      expect(mockQuery.jsonPaths![0]).toEqual({
        column: 'items',
        path: '$[0].name',
        operator: '->>',
        alias: 'first_item_name'
      })
    })
  })

  describe('addJsonFunction', () => {
    it('should add JSON_EXTRACT function', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_EXTRACT',
        'metadata',
        '$.name',
        undefined,
        'extracted_name'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_EXTRACT',
        column: 'metadata',
        path: '$.name',
        alias: 'extracted_name'
      })
    })

    it('should add JSON_SET function with value', () => {
      JsonMixin.addJsonFunction(mockQuery, 'JSON_SET', 'data', '$.status', 'active', 'updated_data')

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_SET',
        column: 'data',
        path: '$.status',
        value: 'active',
        alias: 'updated_data'
      })
    })

    it('should add JSON_INSERT function with value', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_INSERT',
        'config',
        '$.new_field',
        'new_value',
        'inserted_config'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_INSERT',
        column: 'config',
        path: '$.new_field',
        value: 'new_value',
        alias: 'inserted_config'
      })
    })

    it('should add JSON_REPLACE function with value', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_REPLACE',
        'profile',
        '$.email',
        'new@email.com',
        'updated_profile'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_REPLACE',
        column: 'profile',
        path: '$.email',
        value: 'new@email.com',
        alias: 'updated_profile'
      })
    })

    it('should add JSON_REMOVE function without value', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_REMOVE',
        'data',
        '$.temp_field',
        undefined,
        'cleaned_data'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_REMOVE',
        column: 'data',
        path: '$.temp_field',
        alias: 'cleaned_data'
      })
    })

    it('should add JSON_UNQUOTE function without value', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_UNQUOTE',
        'metadata',
        '$.quoted_string',
        undefined,
        'unquoted_string'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_UNQUOTE',
        column: 'metadata',
        path: '$.quoted_string',
        alias: 'unquoted_string'
      })
    })

    it('should add JSON_LENGTH function without value', () => {
      JsonMixin.addJsonFunction(mockQuery, 'JSON_LENGTH', 'items', '$', undefined, 'item_count')

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_LENGTH',
        column: 'items',
        path: '$',
        alias: 'item_count'
      })
    })

    it('should add JSON_TYPE function without value', () => {
      JsonMixin.addJsonFunction(mockQuery, 'JSON_TYPE', 'data', '$.field', undefined, 'field_type')

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_TYPE',
        column: 'data',
        path: '$.field',
        alias: 'field_type'
      })
    })

    it('should add JSON_VALID function without value', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_VALID',
        'json_column',
        '$',
        undefined,
        'is_valid_json'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_VALID',
        column: 'json_column',
        path: '$',
        alias: 'is_valid_json'
      })
    })

    it('should add JSON_CONTAINS function with value', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_CONTAINS',
        'data',
        '$.items',
        'target_item',
        'contains_item'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_CONTAINS',
        column: 'data',
        path: '$.items',
        value: 'target_item',
        alias: 'contains_item'
      })
    })

    it('should add JSON_SEARCH function with value', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_SEARCH',
        'data',
        '$.items[*].name',
        'search_term',
        'found_path'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_SEARCH',
        column: 'data',
        path: '$.items[*].name',
        value: 'search_term',
        alias: 'found_path'
      })
    })

    it('should initialize jsonFunctions array if undefined', () => {
      expect(mockQuery.jsonFunctions).toBeUndefined()

      JsonMixin.addJsonFunction(mockQuery, 'JSON_EXTRACT', 'data', '$.field')

      expect(mockQuery.jsonFunctions).toBeDefined()
      expect(mockQuery.jsonFunctions).toHaveLength(1)
    })

    it('should append to existing jsonFunctions array', () => {
      JsonMixin.addJsonFunction(mockQuery, 'JSON_EXTRACT', 'data', '$.field1', undefined, 'field1')
      JsonMixin.addJsonFunction(mockQuery, 'JSON_EXTRACT', 'data', '$.field2', undefined, 'field2')

      expect(mockQuery.jsonFunctions).toHaveLength(2)
      expect(mockQuery.jsonFunctions![0].path).toBe('$.field1')
      expect(mockQuery.jsonFunctions![1].path).toBe('$.field2')
    })

    it('should handle numeric values', () => {
      JsonMixin.addJsonFunction(mockQuery, 'JSON_SET', 'data', '$.count', 42, 'updated_count')

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_SET',
        column: 'data',
        path: '$.count',
        value: 42,
        alias: 'updated_count'
      })
    })

    it('should handle boolean values', () => {
      JsonMixin.addJsonFunction(mockQuery, 'JSON_SET', 'data', '$.enabled', true, 'updated_enabled')

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_SET',
        column: 'data',
        path: '$.enabled',
        value: true,
        alias: 'updated_enabled'
      })
    })

    it('should handle object values', () => {
      const objectValue = { key: 'value', nested: { prop: 123 } }
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_SET',
        'data',
        '$.object',
        objectValue,
        'updated_object'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonFunctions![0]).toEqual({
        function: 'JSON_SET',
        column: 'data',
        path: '$.object',
        value: objectValue,
        alias: 'updated_object'
      })
    })
  })

  describe('mixed JSON operations', () => {
    it('should handle both JSON paths and functions', () => {
      JsonMixin.addJsonPath(mockQuery, 'metadata', '$.name', '->>', 'user_name')
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_EXTRACT',
        'metadata',
        '$.age',
        undefined,
        'user_age'
      )

      expect(mockQuery.jsonPaths).toHaveLength(1)
      expect(mockQuery.jsonFunctions).toHaveLength(1)
      expect(mockQuery.jsonPaths![0].path).toBe('$.name')
      expect(mockQuery.jsonFunctions![0].path).toBe('$.age')
    })

    it('should handle multiple JSON paths', () => {
      JsonMixin.addJsonPath(mockQuery, 'data', '$.field1', '->>', 'field1')
      JsonMixin.addJsonPath(mockQuery, 'data', '$.field2', '->', 'field2')
      JsonMixin.addJsonPath(mockQuery, 'data', '$.field3', '->>', 'field3')

      expect(mockQuery.jsonPaths).toHaveLength(3)
      expect(mockQuery.jsonPaths![0].operator).toBe('->>')
      expect(mockQuery.jsonPaths![1].operator).toBe('->')
      expect(mockQuery.jsonPaths![2].operator).toBe('->>')
    })

    it('should handle multiple JSON functions', () => {
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_EXTRACT',
        'data',
        '$.field1',
        undefined,
        'extracted1'
      )
      JsonMixin.addJsonFunction(mockQuery, 'JSON_SET', 'data', '$.field2', 'value2', 'set_field2')
      JsonMixin.addJsonFunction(
        mockQuery,
        'JSON_REMOVE',
        'data',
        '$.field3',
        undefined,
        'removed_field3'
      )

      expect(mockQuery.jsonFunctions).toHaveLength(3)
      expect(mockQuery.jsonFunctions![0].function).toBe('JSON_EXTRACT')
      expect(mockQuery.jsonFunctions![1].function).toBe('JSON_SET')
      expect(mockQuery.jsonFunctions![2].function).toBe('JSON_REMOVE')
    })
  })
})
