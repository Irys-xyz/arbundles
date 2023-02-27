const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json"],
  //src or file
  testRegex: "((src|file))/.*(test|spec)\\.(ts)x?$",
  coverageDirectory: "coverage",
  // dont collect covergage from injected
  collectCoverageFrom: ["((src)|(file))/**/*.{ts,js}", "!src/**/*.d.ts"], // , "!src/**/*[I|i]njected*.ts"], // in case we want only the covery of not injecected stuff
  setupFiles: ["<rootDir>/src/__tests__/setup.jest.js"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  modulePaths: [
    '<rootDir>'
  ],
};
