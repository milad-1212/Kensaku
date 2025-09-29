/**
 * Base interface for database migrations.
 */
export interface MigrationBase {
  /** Migration version identifier */
  version: string
  /** Human-readable migration name */
  name: string
  /** Function to execute the migration */
  up: () => Promise<void>
  /** Function to rollback the migration */
  down: () => Promise<void>
  /** Optional dependencies on other migrations */
  dependencies?: string[]
}

/**
 * Configuration for migration management.
 */
export interface MigrationConfig {
  /** Table name to store migration history */
  table: string
  /** Directory containing migration files */
  directory: string
  /** Optional regex pattern to match migration files */
  pattern?: RegExp
}

/**
 * Interface for running database migrations.
 */
export interface MigrationRunner {
  /**
   * Runs all pending migrations.
   * @returns Promise that resolves when migrations are complete
   */
  run(): Promise<void>

  /**
   * Rolls back migrations to a target version.
   * @param target - Optional target version to rollback to
   * @returns Promise that resolves when rollback is complete
   */
  rollback(target?: string): Promise<void>

  /**
   * Gets the status of all migrations.
   * @returns Promise that resolves to array of migration statuses
   */
  status(): Promise<MigrationStatus[]>

  /**
   * Creates a new migration file.
   * @param name - Name for the new migration
   * @returns Promise that resolves to the created file path
   */
  create(name: string): Promise<string>
}

/**
 * Status information for a migration.
 */
export interface MigrationStatus {
  /** Migration version */
  version: string
  /** Migration name */
  name: string
  /** Whether the migration has been executed */
  executed: boolean
  /** When the migration was executed */
  executedAt?: Date
  /** Optional checksum for verification */
  checksum?: string
}
