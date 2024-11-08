"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Re-exports all exports from these modules
export * from './stringify.js';
export * from './traversal.js';
export * from './manipulation.js';
export * from './querying.js';
export * from './legacy.js';
export * from './helpers.js';
export * from './feeds.js';

/** @deprecated Use these methods from `domhandler` directly. */
import { isTag, isCDATA, isText, isComment, isDocument, hasChildren } from 'domhandler';

// Export deprecated methods, indicating use from `domhandler` directly
exports.isTag = isTag;
exports.isCDATA = isCDATA;
exports.isText = isText;
exports.isComment = isComment;
exports.isDocument = isDocument;
exports.hasChildren = hasChildren;
