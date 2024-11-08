'use strict';

// Utilizing ES6 exports for module functionality
exports.SearchSource = undefined;
exports.createTestScheduler = undefined;
exports.getVersion = undefined;
exports.run = undefined;
exports.runCLI = undefined;

// Core functionalities from @jest/core are imported lazily
function _core() {
  const data = require('@jest/core');
  _core = () => data;
  return data;
}

// Jest CLI functionalities are similarly imported lazily
function _jestCli() {
  const data = require('jest-cli');
  _jestCli = () => data;
  return data;
}

Object.defineProperty(exports, 'SearchSource', {
  enumerable: true,
  get: () => _core().SearchSource
});
Object.defineProperty(exports, 'createTestScheduler', {
  enumerable: true,
  get: () => _core().createTestScheduler
});
Object.defineProperty(exports, 'getVersion', {
  enumerable: true,
  get: () => _core().getVersion
});
Object.defineProperty(exports, 'run', {
  enumerable: true,
  get: () => _jestCli().run
});
Object.defineProperty(exports, 'runCLI', {
  enumerable: true,
  get: () => _core().runCLI
});
