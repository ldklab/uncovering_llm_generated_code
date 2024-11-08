/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

// Export hook classes from their respective files
module.exports = {
  SyncHook: require("./SyncHook"),
  SyncBailHook: require("./SyncBailHook"),
  SyncWaterfallHook: require("./SyncWaterfallHook"),
  SyncLoopHook: require("./SyncLoopHook"),
  AsyncParallelHook: require("./AsyncParallelHook"),
  AsyncParallelBailHook: require("./AsyncParallelBailHook"),
  AsyncSeriesHook: require("./AsyncSeriesHook"),
  AsyncSeriesBailHook: require("./AsyncSeriesBailHook"),
  AsyncSeriesLoopHook: require("./AsyncSeriesLoopHook"),
  AsyncSeriesWaterfallHook: require("./AsyncSeriesWaterfallHook"),
  HookMap: require("./HookMap"),
  MultiHook: require("./MultiHook")
};
