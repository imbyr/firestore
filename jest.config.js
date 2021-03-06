module.exports = {
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
    transform: {
        '^.+\\.(ts|js)$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    coverageReporters: ['html'],
    collectCoverageFrom: ["src/**/**.ts"],
};
