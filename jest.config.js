module.exports = {
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts']
};
