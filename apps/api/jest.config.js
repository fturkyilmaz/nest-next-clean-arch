module.exports = {
  displayName: '@diet/api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'commonjs',
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
  ],
  moduleNameMapper: {
    '^@infrastructure/(.*)$': '<rootDir>/../../packages/infrastructure/$1',
    '^@application/(.*)$': '<rootDir>/../../packages/application/$1',
    '^@domain/(.*)$': '<rootDir>/../../packages/domain/$1',
  },
};
