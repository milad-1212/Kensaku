/**
 * Jest configuration object
 * @description Configuration for running TypeScript tests with ESM support, coverage collection, and path aliases
 */
export default {
  /** TypeScript ESM preset for Jest */
  preset: 'ts-jest/presets/default-esm',
  /** Node.js test environment */
  testEnvironment: 'node',
  /** File extensions to treat as ESM modules */
  extensionsToTreatAsEsm: ['.ts'],
  /** Root directories to search for tests */
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  /** Test file pattern matching */
  testMatch: ['**/?(*.)+(spec|test).ts'],
  /** TypeScript transformation configuration */
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        /** Enable ESM support in ts-jest */
        useESM: true
      }
    ]
  },
  /** Files to include in coverage collection */
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
  /** Directory for coverage reports */
  coverageDirectory: 'coverage',
  /** Coverage report formats */
  coverageReporters: ['text', 'lcov', 'html'],
  /** Path alias mapping for imports */
  moduleNameMapper: {
    /** Root source directory alias */
    '^@root/*': '<rootDir>/src/$1',
    /** Builders directory alias */
    '^@builders/(.*)$': '<rootDir>/src/builders/$1',
    /** Constants directory alias */
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    /** Core directory alias */
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    /** Interfaces directory alias */
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    /** Schemas directory alias */
    '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
    /** Tests directory alias */
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  /** Setup files to run after Jest environment is set up */
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  /** Patterns to ignore during transformation */
  transformIgnorePatterns: ['node_modules/(?!(sqlite3|sqlite)/)'],
  /** Test timeout in milliseconds */
  testTimeout: 10000
}
