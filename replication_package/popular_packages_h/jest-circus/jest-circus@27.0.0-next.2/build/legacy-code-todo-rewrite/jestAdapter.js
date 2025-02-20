'use strict';

var _jestUtil = require('jest-util');

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const FRAMEWORK_INITIALIZER = require.resolve('./jestAdapterInit');

const jestAdapter = async (
  globalConfig,
  config,
  environment,
  runtime,
  testPath,
  sendMessageToJest
) => {
  var _runtime$setGlobalsFo;

  const {
    initialize,
    runAndTransformResultsToJestFormat
  } = runtime.requireInternalModule(FRAMEWORK_INITIALIZER);
  const {globals, snapshotState} = await initialize({
    config,
    environment,
    globalConfig,
    localRequire: runtime.requireModule.bind(runtime),
    parentProcess: process,
    sendMessageToJest,
    setGlobalsForRuntime:
      (_runtime$setGlobalsFo = runtime.setGlobalsForRuntime) === null ||
      _runtime$setGlobalsFo === void 0
        ? void 0
        : _runtime$setGlobalsFo.bind(runtime),
    testPath
  });

  if (config.timers === 'fake' || config.timers === 'modern') {
    // during setup, this cannot be null (and it's fine to explode if it is)
    environment.fakeTimersModern.useFakeTimers();
  } else if (config.timers === 'legacy') {
    environment.fakeTimers.useFakeTimers();
  }

  globals.beforeEach(() => {
    if (config.resetModules) {
      runtime.resetModules();
    }

    if (config.clearMocks) {
      runtime.clearAllMocks();
    }

    if (config.resetMocks) {
      runtime.resetAllMocks();

      if (config.timers === 'legacy') {
        // during setup, this cannot be null (and it's fine to explode if it is)
        environment.fakeTimers.useFakeTimers();
      }
    }

    if (config.restoreMocks) {
      runtime.restoreAllMocks();
    }
  });

  for (const path of config.setupFilesAfterEnv) {
    const esm = runtime.unstable_shouldLoadAsEsm(path);

    if (esm) {
      await runtime.unstable_importModule(path);
    } else {
      runtime.requireModule(path);
    }
  }

  const esm = runtime.unstable_shouldLoadAsEsm(testPath);

  if (esm) {
    await runtime.unstable_importModule(testPath);
  } else {
    runtime.requireModule(testPath);
  }

  const results = await runAndTransformResultsToJestFormat({
    config,
    globalConfig,
    testPath
  });

  _addSnapshotData(results, snapshotState); // We need to copy the results object to ensure we don't leaks the prototypes
  // from the VM. Jasmine creates the result objects in the parent process, we
  // should consider doing that for circus as well.

  return (0, _jestUtil.deepCyclicCopy)(results, {
    keepPrototype: false
  });
};

const _addSnapshotData = (results, snapshotState) => {
  results.testResults.forEach(({fullName, status}) => {
    if (status === 'pending' || status === 'failed') {
      // if test is skipped or failed, we don't want to mark
      // its snapshots as obsolete.
      snapshotState.markSnapshotsAsCheckedForTest(fullName);
    }
  });
  const uncheckedCount = snapshotState.getUncheckedCount();
  const uncheckedKeys = snapshotState.getUncheckedKeys();

  if (uncheckedCount) {
    snapshotState.removeUncheckedKeys();
  }

  const status = snapshotState.save();
  results.snapshot.fileDeleted = status.deleted;
  results.snapshot.added = snapshotState.added;
  results.snapshot.matched = snapshotState.matched;
  results.snapshot.unmatched = snapshotState.unmatched;
  results.snapshot.updated = snapshotState.updated;
  results.snapshot.unchecked = !status.deleted ? uncheckedCount : 0; // Copy the array to prevent memory leaks

  results.snapshot.uncheckedKeys = Array.from(uncheckedKeys);
};

module.exports = jestAdapter;
