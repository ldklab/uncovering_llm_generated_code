/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
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

exports.SyncHook = SyncHook;
exports.SyncBailHook = SyncBailHook;
exports.SyncWaterfallHook = SyncWaterfallHook;
exports.SyncLoopHook = SyncLoopHook;
exports.AsyncParallelHook = AsyncParallelHook;
exports.AsyncParallelBailHook = AsyncParallelBailHook;
exports.AsyncSeriesHook = AsyncSeriesHook;
exports.AsyncSeriesBailHook = AsyncSeriesBailHook;
exports.AsyncSeriesLoopHook = AsyncSeriesLoopHook;
exports.AsyncSeriesWaterfallHook = AsyncSeriesWaterfallHook;
exports.HookMap = HookMap;
exports.MultiHook = MultiHook;
