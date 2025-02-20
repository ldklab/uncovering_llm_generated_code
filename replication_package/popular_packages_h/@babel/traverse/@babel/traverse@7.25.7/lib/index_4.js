"use strict";

import Hub from "./hub.js";
import NodePath from "./path/index.js";
import Scope from "./scope/index.js";
import "./path/context.js";
import * as visitors from "./visitors.js";
import { VISITOR_KEYS, removeProperties, traverseFast } from "@babel/types";
import * as cache from "./cache.js";
import { traverseNode } from "./traverse-node.js";

export {
  Hub,
  NodePath,
  Scope,
  visitors as visitors
};

export default function traverse(parent, opts = {}, scope, state, parentPath, visitSelf) {
  if (!parent) return;

  if (!opts.noScope && !scope) {
    if (parent.type !== "Program" && parent.type !== "File") {
      throw new Error(
        `You must pass a scope and parentPath unless traversing a Program/File. Instead of that you tried to traverse a ${parent.type} node without passing scope and parentPath.`
      );
    }
  }

  if (!parentPath && visitSelf) {
    throw new Error("visitSelf can only be used when providing a NodePath.");
  }

  if (!VISITOR_KEYS[parent.type]) {
    return;
  }

  visitors.explode(opts);

  traverseNode(parent, opts, scope, state, parentPath, null, visitSelf);
}

traverse.visitors = visitors;
traverse.verify = visitors.verify;
traverse.explode = visitors.explode;

traverse.cheap = function (node, enter) {
  traverseFast(node, enter);
};

traverse.node = function (node, opts, scope, state, path, skipKeys) {
  traverseNode(node, opts, scope, state, path, skipKeys);
};

traverse.clearNode = function (node, opts) {
  removeProperties(node, opts);
};

traverse.removeProperties = function (tree, opts) {
  traverseFast(tree, traverse.clearNode, opts);
  return tree;
};

function hasDenylistedType(path, state) {
  if (path.node.type === state.type) {
    state.has = true;
    path.stop();
  }
}

traverse.hasType = function (tree, type, denylistTypes) {
  if (denylistTypes && denylistTypes.includes(tree.type)) return false;
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
