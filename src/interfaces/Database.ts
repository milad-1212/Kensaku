/**
 * Configuration for database connection pooling.
 */
export interface ConnectionPoolConfig {
  /** Minimum number of connections in the pool */
  min?: number
  /** Maximum number of connections in the pool */
  max?: number
  /** Time in milliseconds before idle connections are closed */
  idleTimeout?: number
  /** Time in milliseconds to wait for a connection from the pool */
  acquireTimeout?: number
}

/**
 * Configuration object for database connections.
 */
export interface DatabaseConfig {
  /** Database type/dialect */
  type: DatabaseType
  /** Database host address */
  host?: string
  /** Database port number */
  port?: number
  /** Database name to connect to */
  database: string
  /** Username for database authentication */
  username?: string
  /** Password for database authentication */
  password?: string
  /** Enable SSL connection */
  ssl?: boolean
  /** Connection pool configuration */
  pool?: ConnectionPoolConfig
}

/**
 * Information about a database field/column.
 */
export interface DatabaseFieldInfo {
  /** Field name */
  name: string
  /** Field data type */
  type: string
  /** Whether the field allows null values */
  nullable: boolean
}

/**
 * Result object returned by database queries.
 */
export interface DatabaseQueryResult {
  /** Array of result rows */
  rows: unknown[]
  /** Number of rows returned */
  rowCount: number
  /** Optional field information */
  fields?: DatabaseFieldInfo[]
}

/**
 * Interface for database transactions.
 */
export interface DatabaseTransaction {
  /**
   * Executes a SQL query within the transaction.
   * @param sql - SQL query string
   * @param params - Optional array of query parameters
   * @returns Promise that resolves to query results
   */
  query(sql: string, params?: unknown[]): Promise<DatabaseQueryResult>

  /**
   * Commits the transaction.
   * @returns Promise that resolves when transaction is committed
   */
  commit(): Promise<void>

  /**
   * Rolls back the transaction.
   * @returns Promise that resolves when transaction is rolled back
   */
  rollback(): Promise<void>
}

/**
 * Supported database types.
 */
export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite'
