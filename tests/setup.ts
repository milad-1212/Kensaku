/**
 * Jest test setup file
 * @description Global test configuration and setup
 */

import { jest } from '@jest/globals'

// Global test timeout
jest.setTimeout(10000)

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchSQL(expected: string): R
      toHaveValidSQL(): R
      toHaveValidParams(): R
    }
  }
}
expect.extend({
  toMatchSQL(received: string, expected: string) {
    const normalize = (sql: string) => sql.replace(/\s+/g, ' ').trim().toLowerCase()
    const receivedNormalized = normalize(received)
    const expectedNormalized = normalize(expected)
    const pass = receivedNormalized === expectedNormalized
    return {
      pass,
      message: () =>
        pass
          ? `Expected SQL not to match: ${received}`
          : `Expected SQL to match: ${expected}\nReceived: ${received}`
    }
  },
  toHaveValidSQL(received: string) {
    const hasSelect = received.toLowerCase().includes('select')
    const hasFrom = received.toLowerCase().includes('from')
    const isValid = hasSelect && hasFrom
    return {
      pass: isValid,
      message: () =>
        isValid
          ? `Expected SQL to be invalid: ${received}`
          : `Expected valid SQL, but received: ${received}`
    }
  },
  toHaveValidParams(received: unknown[]) {
    const isValid =
      Array.isArray(received) && received.every(param => param !== undefined && param !== null)
    return {
      pass: isValid,
      message: () =>
        isValid
          ? `Expected params to be invalid: ${JSON.stringify(received)}`
          : `Expected valid params, but received: ${JSON.stringify(received)}`
    }
  }
})

beforeAll(async () => {})
afterAll(async () => {})
beforeEach(() => {
  jest.clearAllMocks()
})
afterEach(() => {})
