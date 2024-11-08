"use strict";

const SyncHook = require("./SyncHook");
const SyncBailHook = require("./SyncBailHook");
const SyncWaterfallHook = require("./SyncWaterfallHook");
const SyncLoopHook = require("./SyncLoopHook");
const AsyncParallelHook = require("./AsyncParallelHook");
const AsyncParallelBailHook = require("./AsyncParallelBailHook");
const AsyncSeriesHook = require("./AsyncSeriesHook");
const AsyncSeriesBailHook = require("./AsyncSeriesBailHook");
const AsyncSeriesLoopHook = require("./AsyncSeriesLoopHook");
const AsyncSeriesWaterfallHook = require("./AsyncSeriesWaterfallHook");
const HookMap = require("./HookMap");
const MultiHook = require("./MultiHook");

module.exports = {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesLoopHook,
  AsyncSeriesWaterfallHook,
  HookMap,
  MultiHook
};
