const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/env.ts"],
  globalSetup: "<rootDir>/test/setup/globalSetup.js",
  transform: {
    ...tsJestTransformCfg,
  },
};