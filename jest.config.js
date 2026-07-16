export default {
  testEnvironment: 'node',
  testMatch: ['**/server/tests/**/*.test.js'],
  transform: {},
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/tests/**',
    '!server/index.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/server/tests/',
  ],
  testTimeout: 30000,
  verbose: true,
};
