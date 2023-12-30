module.exports = {
    preset: process.env.JEST_ENV === 'browser' ? undefined : 'ts-jest',
    testMatch: process.env.JEST_ENV === 'browser' ? ['**/browser-tests/**/*.test.ts'] : ['**/tests/**/*.test.ts'],
    testEnvironment: process.env.JEST_ENV === 'browser' ? undefined : 'node',
    // other configurations
};
