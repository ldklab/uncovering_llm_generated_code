'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const lazyLoad = (callback) => ({
  enumerable: true,
  get: callback
});

const core = () => require('@jest/core');
const jestCli = () => require('jest-cli');

Object.defineProperty(exports, 'SearchSource', lazyLoad(() => core().SearchSource));
Object.defineProperty(exports, 'TestScheduler', lazyLoad(() => core().TestScheduler));
Object.defineProperty(exports, 'TestWatcher', lazyLoad(() => core().TestWatcher));
Object.defineProperty(exports, 'getVersion', lazyLoad(() => core().getVersion));
Object.defineProperty(exports, 'runCLI', lazyLoad(() => core().runCLI));
Object.defineProperty(exports, 'run', lazyLoad(() => jestCli().run));
