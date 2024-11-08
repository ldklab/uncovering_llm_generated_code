"use strict";

const _context = require("./context").default;
const visitors = require("./visitors");
const t = require("@babel/types");
const cache = require("./cache");
const _path = require("./path").default;
const _scope = require("./scope").default;
const _hub = require("./hub").default;

exports.default = traverse;
exports.NodePath = _path;
exports.Scope = _scope;
exports.Hub = _hub;
exports.visitors = visitors;

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () { return cache; };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) return obj;
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) return cache.get(obj);
  var newObj = {};
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = Object.getOwnPropertyDescriptor(obj, key);
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) cache.set(obj, newObj);
  return newObj;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function traverse(parent, opts, scope, state, parentPath) {
  if (!parent) return;
  if (!opts) opts = {};

  if (!opts.noScope && !scope) {
    if (parent.type !== "Program" && parent.type !== "File") {
      throw new Error(
        "You must pass a scope and parentPath unless traversing a Program/File. " +
        `Instead of that you tried to traverse a ${parent.type} node without ` +
        "passing scope and parentPath."
      );
    }
  }

  if (!t.VISITOR_KEYS[parent.type]) {
    return;
  }

  visitors.explode(opts);
  traverse.node(parent, opts, scope, state, parentPath);
}

traverse.visitors = visitors;
traverse.verify = visitors.verify;
traverse.explode = visitors.explode;

traverse.cheap = function (node, enter) {
  return t.traverseFast(node, enter);
};

traverse.node = function (node, opts, scope, state, parentPath, skipKeys) {
  const keys = t.VISITOR_KEYS[node.type];
  if (!keys) return;
  const context = new _context(scope, opts, state, parentPath);

  for (const key of keys) {
    if (skipKeys && skipKeys[key]) continue;
    if (context.visit(node, key)) return;
  }
};

traverse.clearNode = function (node, opts) {
  t.removeProperties(node, opts);
  cache.path.delete(node);
};

traverse.removeProperties = function (tree, opts) {
  t.traverseFast(tree, traverse.clearNode, opts);
  return tree;
};

function hasDenylistedType(path, state) {
  if (path.node.type === state.type) {
    state.has = true;
    path.stop();
  }
}

traverse.hasType = function (tree, type, denylistTypes) {
  if (denylistTypes?.includes(tree.type)) return false;
  if (tree.type === type) return true;
  const state = {
    has: false,
    type: type
  };
  traverse(tree, {
    noScope: true,
    denylist: denylistTypes,
    enter: hasDenylistedType
  }, null, state);
  return state.has;
};

traverse.cache = cache;
