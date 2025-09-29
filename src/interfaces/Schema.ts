/**
 * Interface for database column definition.
 */
export interface SchemaColumn {
  /** Column name */
  name: string
  /** Column data type */
  type: SchemaDataType
  /** Whether the column allows null values */
  nullable?: boolean
  /** Default value for the column */
  default?: unknown
  /** Whether this is a primary key column */
  primaryKey?: boolean
  /** Whether this column has a unique constraint */
  unique?: boolean
  /** Whether this column auto-increments */
  autoIncrement?: boolean
  /** Optional comment for the column */
  comment?: string
}

/**
 * Interface for database constraint definition.
 */
export interface SchemaConstraint {
  /** Constraint name */
  name: string
  /** Type of constraint */
  type: SchemaConstraintType
  /** Columns involved in the constraint */
  columns: string[]
  /** Foreign key reference (for FOREIGN KEY constraints) */
  references?: SchemaForeignKey
  /** Check condition (for CHECK constraints) */
  check?: string
}

/**
 * Supported constraint types.
 */
export type SchemaConstraintType = 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK'

/**
 * Supported database data types.
 */
export type SchemaDataType =
  | 'VARCHAR'
  | 'TEXT'
  | 'CHAR'
  | 'INT'
  | 'BIGINT'
  | 'SMALLINT'
  | 'TINYINT'
  | 'DECIMAL'
  | 'FLOAT'
  | 'DOUBLE'
  | 'BOOLEAN'
  | 'BOOL'
  | 'DATE'
  | 'TIME'
  | 'TIMESTAMP'
  | 'DATETIME'
  | 'JSON'
  | 'JSONB'
  | 'UUID'
  | 'ENUM'
  | 'ARRAY'
  | 'BLOB'

/**
 * Interface for foreign key reference definition.
 */
export interface SchemaForeignKey {
  /** Referenced table name */
  table: string
  /** Referenced column name */
  column: string
  /** Action to take on delete */
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'SET DEFAULT'
  /** Action to take on update */
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'SET DEFAULT'
}

/**
 * Interface for database index definition.
 */
export interface SchemaIndexDefinition {
  /** Index name */
  name: string
  /** Columns included in the index */
  columns: string[]
  /** Whether this is a unique index */
  unique?: boolean
  /** Index type */
  type?: SchemaIndexType
  /** Optional WHERE clause for partial index */
  where?: string
}

/**
 * Supported index types.
 */
export type SchemaIndexType = 'BTREE' | 'HASH' | 'GIN' | 'GiST' | 'SPGIST' | 'BRIN'

/**
 * Interface for schema migration definition.
 */
export interface SchemaMigration {
  /** Migration version */
  version: string
  /** Migration name */
  name: string
  /** SQL to execute the migration */
  up: string
  /** SQL to rollback the migration */
  down: string
  /** Optional dependencies on other migrations */
  dependencies?: string[]
}

/**
 * Interface for database table definition.
 */
export interface SchemaTable {
  /** Table name */
  name: string
  /** Table columns */
  columns: SchemaColumn[]
  /** Optional indexes */
  indexes?: SchemaIndexDefinition[]
  /** Optional constraints */
  constraints?: SchemaConstraint[]
  /** Optional table comment */
  comment?: string
}
