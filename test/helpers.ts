/**
 * Test Helpers & Utilities
 *
 * Common helper functions for testing across the application.
 */

import { Test, TestingModule } from '@nestjs/testing';

/**
 * Setup test module with common providers
 */
export async function createTestingModule(
  metadata: any,
): Promise<TestingModule> {
  const module: TestingModule = await Test.createTestingModule(
    metadata,
  ).compile();

  return module;
}

/**
 * Create a test module with all default providers
 */
export async function createFullTestModule(
  imports: any[] = [],
  providers: any[] = [],
  exports: any[] = [],
) {
  const module = await Test.createTestingModule({
    imports,
    providers,
    exports,
  }).compile();

  return module;
}

/**
 * Wait for async operations with timeout
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Create a promise that resolves after a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Assert that an error was thrown with specific message
 */
export async function expectError(
  fn: () => Promise<any>,
  expectedMessage?: string,
) {
  try {
    await fn();
    throw new Error('Expected error was not thrown');
  } catch (error: any) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(
        `Expected error message "${expectedMessage}" but got "${error.message}"`,
      );
    }
  }
}

/**
 * Compare two objects ignoring id and timestamp fields
 */
export function compareObjects(
  obj1: any,
  obj2: any,
  ignoreFields: string[] = ['id', 'createdAt', 'updatedAt', 'deletedAt'],
) {
  const obj1Copy = { ...obj1 };
  const obj2Copy = { ...obj2 };

  ignoreFields.forEach((field) => {
    delete obj1Copy[field];
    delete obj2Copy[field];
  });

  return JSON.stringify(obj1Copy) === JSON.stringify(obj2Copy);
}

/**
 * Verify cache was called correctly
 */
export function verifyCacheCall(
  cacheSpy: jest.Mock,
  method: string,
  times = 1,
) {
  const calls = cacheSpy.mock.calls.filter((call) =>
    call[0] === method,
  );
  expect(calls.length).toBeGreaterThanOrEqual(times);
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.message) return error.response.message;
  return 'Unknown error';
}

/**
 * Reset all mocks in a module
 */
export function resetAllMocks(module: TestingModule) {
  const providers = module.get('__providers__') || [];
  providers.forEach((provider: any) => {
    if (provider instanceof jest.fn) {
      provider.mockClear();
    }
  });
}

/**
 * Create spy on console methods
 */
export function spyOnConsole() {
  return {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    debug: jest.spyOn(console, 'debug').mockImplementation(),
  };
}

/**
 * Restore console spies
 */
export function restoreConsole(spies: any) {
  Object.values(spies).forEach((spy: any) => spy.mockRestore());
}

/**
 * Validate date is within range
 */
export function isDateInRange(
  date: Date,
  start: Date,
  end: Date,
): boolean {
  return date >= start && date <= end;
}

/**
 * Create a date in the past
 */
export function getPastDate(daysBack = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date;
}

/**
 * Create a date in the future
 */
export function getFutureDate(daysAhead = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}

/**
 * Create a date range
 */
export function createDateRange(
  daysBack = 7,
): { start: Date; end: Date } {
  const start = getPastDate(daysBack);
  const end = new Date();
  return { start, end };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Create a partial mock object
 */
export function createPartialMock<T>(partial: Partial<T>): Partial<T> {
  return partial;
}

/**
 * Verify spy was called with specific arguments
 */
export function expectSpyCalledWith(
  spy: jest.Mock,
  ...args: any[]
) {
  expect(spy).toHaveBeenCalledWith(...args);
}

/**
 * Get the last call arguments from a spy
 */
export function getLastCallArgs(spy: jest.Mock): any[] {
  const calls = spy.mock.calls;
  return calls[calls.length - 1] || [];
}

/**
 * Mock fetch globally for HTTP testing
 */
export function mockGlobalFetch(response?: any) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response || {}),
      text: () => Promise.resolve(JSON.stringify(response || {})),
    } as Response),
  );
}

/**
 * Restore global fetch
 */
export function restoreGlobalFetch() {
  delete (global as any).fetch;
}

/**
 * Create benchmark timer for performance testing
 */
export function createBenchmark(name: string) {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return duration;
    },
  };
}
