'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const core = () => require('@jest/core');
const jestCli = () => require('jest-cli');

exports.SearchSource = core().SearchSource;
exports.createTestScheduler = core().createTestScheduler;
exports.getVersion = core().getVersion;
exports.run = jestCli().run;
exports.runCLI = core().runCLI;
