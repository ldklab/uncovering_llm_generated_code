'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function setupProperty(exports, name, getter) {
  Object.defineProperty(exports, name, {
    enumerable: true,
    get: getter
  });
}

const _core = (() => {
  let data;
  return () => data || (data = require('@jest/core'));
})();

const _jestCli = (() => {
  let data;
  return () => data || (data = require('jest-cli'));
})();

setupProperty(exports, 'SearchSource', function() { return _core().SearchSource; });
setupProperty(exports, 'TestScheduler', function() { return _core().TestScheduler; });
setupProperty(exports, 'TestWatcher', function() { return _core().TestWatcher; });
setupProperty(exports, 'getVersion', function() { return _core().getVersion; });
setupProperty(exports, 'runCLI', function() { return _core().runCLI; });
setupProperty(exports, 'run', function() { return _jestCli().run; });
