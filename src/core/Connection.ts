import type { DatabaseConfig, ConnectionBase } from '@interfaces/index'
import { Base, Postgres, MySql, Sqlite } from '@core/dialects/index'
import { getInvalidDatabaseTypeError } from '@constants/ErrorMap'

/**
 * Database connection manager with connection pooling.
 * @description Manages database connections and provides connection pooling functionality.
 */
export class Connection {
  /** Database configuration object */
  private readonly config: DatabaseConfig
  /** Database dialect instance */
  private readonly dialect: Base
  /** Connection pool array */
  private pool: ConnectionBase[] = []
  /** Connection status flag */
  private isConnected: boolean = false
  /** Initialization promise to prevent multiple initializations */
  private initializationPromise: Promise<void> | null = null

  /**
   * Creates a new Connection instance.
   * @param config - Database configuration
   */
  constructor(config: DatabaseConfig) {
    this.config = config
    this.dialect = this.createDialect(config.type)
  }

  /**
   * Gets a connection from the pool or creates a new one.
   * @returns Promise that resolves to a database connection
   * @throws {Error} When connection creation fails
   */
  async getConnection(): Promise<ConnectionBase> {
    if (!this.isConnected) {
      this.initializationPromise ??= this.initialize()
      await this.initializationPromise
    }
    if (this.pool.length > 0) {
      const connection: ConnectionBase | undefined = this.pool.pop()
      if (connection) {
        return connection
      }
    }
    return this.createConnection()
  }

  /**
   * Releases a connection back to the pool or closes it.
   * @param connection - The connection to release
   */
  async releaseConnection(connection: ConnectionBase): Promise<void> {
    if (this.pool.length < (this.config.pool?.max ?? 10)) {
      this.pool.push(connection)
    } else {
      await connection.close()
    }
  }

  /**
   * Gets the database dialect instance.
   * @returns Database dialect instance
   */
  getDialect(): Base {
    return this.dialect
  }

  /**
   * Closes all connections in the pool.
   */
  async close(): Promise<void> {
    try {
      await Promise.allSettled(this.pool.map((conn: ConnectionBase) => conn.close()))
    } catch (error) {
      console.warn('Error closing some connections:', error)
    } finally {
      this.pool = []
      this.isConnected = false
    }
  }

  /**
   * Creates a new database connection.
   * @returns Promise that resolves to a new connection
   * @throws {Error} When connection creation fails
   */
  private async createConnection(): Promise<ConnectionBase> {
    return this.dialect.createConnection(this.config)
  }

  /**
   * Creates the appropriate database dialect based on type.
   * @param type - Database type
   * @returns Database dialect instance
   * @throws {Error} When database type is unsupported
   */
  private createDialect(type: string): Base {
    switch (type) {
      case 'postgresql':
        return new Postgres(this.config)
      case 'mysql':
        return new MySql(this.config)
      case 'sqlite':
        return new Sqlite(this.config)
      default:
        throw new Error(getInvalidDatabaseTypeError(type))
    }
  }

  /**
   * Initializes the connection pool with minimum connections.
   * @throws {Error} When connection initialization fails
   */
  private async initialize(): Promise<void> {
    const minConnections: number = this.config.pool?.min ?? 1
    const connections: ConnectionBase[] = await Promise.all(
      Array.from({ length: minConnections }, () => this.createConnection())
    )
    this.pool.push(...connections)
    this.isConnected = true
  }
}
