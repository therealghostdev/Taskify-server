"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jestConfig = {
    preset: 'ts-jest',
    roots: ['.'],
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverage: true,
    clearMocks: true,
    coverageDirectory: "coverage",
    testEnvironment: 'node',
};
exports.default = jestConfig;
