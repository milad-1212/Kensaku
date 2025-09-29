/**
 * @fileoverview Kensaku - A TypeScript SQL Query Builder
 * @description Main entry point for the Kensaku library, providing a fluent interface.
 * @version 1.0.0
 * @author NeaByteLab
 * @license MIT
 *
 * @example
 * ```typescript
 * import { Kensaku } from 'kensaku'
 *
 * const db = new Kensaku({
 *   type: 'postgresql',
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'mydb',
 *   username: 'user',
 *   password: 'password'
 * })
 *
 * // Build and execute queries
 * const users = await db.select('*').from('users').where('active', '=', true).execute()
 * ```
 */

/**
 * Core database functionality.
 * @description Re-exports main Kensaku class, connection manager, and query engine.
 */
export * from '@core/index'

/**
 * TypeScript interfaces and type definitions.
 * @description Re-exports all interface definitions for database operations, queries, and configurations.
 */
export * from '@interfaces/index'
