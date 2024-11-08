"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Re-export all exports from ./factory module
exports.factory = require('./factory');

// Re-export all exports from ./handlers module
exports.handlers = require('./handlers');

/**
 * Default plugins
 */
// Re-export all exports from ./plugins/default module
exports.defaultPlugins = require('./plugins/default');

/**
 * Legacy exports
 */
// Re-export all exports from ./legacy module
exports.legacy = require('./legacy');
