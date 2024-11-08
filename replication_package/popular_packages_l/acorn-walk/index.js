const acorn = require('acorn');

function simple(node, visitors, base = defaultWalker, state = null) {
  function c(node, st, override) {
    let type = override || node.type, found = visitors[type];
    if (found) found(node, st, c);
    else base[type](node, st, c);
  }
  c(node, state);
}

function ancestor(node, visitors, base = defaultWalker, state = []) {
  function c(node, st, override) {
    let type = override || node.type, found = visitors[type];
    let newAncestors = st.concat(node);
    if (found) found(node, newAncestors);
    base[type](node, newAncestors, c);
  }
  c(node, state);
}

function recursive(node, state, functions, base = defaultWalker) {
  function c(node, st, override) {
    let type = override || node.type, found = functions[type];
    if (found) found(node, st, c);
    else base[type](node, st, c);
  }
  c(node, state);
}

function make(functions, base = defaultWalker) {
  let walker = Object.create(base);
  for (let type in functions) walker[type] = functions[type];
  return walker;
}

function full(node, callback, base = defaultWalker, state = null) {
  function c(node, st) {
    callback(node, st, node.type);
    base[node.type](node, st, c);
  }
  c(node, state);
}

function fullAncestor(node, callback, base = defaultWalker, state = []) {
  function c(node, st) {
    let newAncestors = st.concat(node);
    callback(node, newAncestors);
    base[node.type](node, newAncestors, c);
  }
  c(node, state);
}

function findNodeAt(node, start, end, test, base = defaultWalker, state = null) {
  let result;
  function c(node, st, override) {
    let type = override || node.type;
    if ((start == null || node.start != null && node.start <= start) &&
        (end == null || node.end != null && node.end >= end))
      if (typeof test == "string" ? type === test : test(type, node)) result = node;
    base[type](node, st, c);
  }
  c(node, state);
  return result;
}

function findNodeAround(node, pos, test, base = defaultWalker, state = null) {
  let result;
  function c(node, st, override) {
    let type = override || node.type;
    if (node.start != null && node.start <= pos && node.end != null && node.end >= pos)
      if (typeof test == "string" ? type === test : test(type, node)) result = node;
    base[type](node, st, c);
  }
  c(node, state);
  return result;
}

function findNodeAfter(node, pos, test, base = defaultWalker, state = null) {
  let result;
  function c(node, st, override) {
    let type = override || node.type;
    if (node.end != null && node.end >= pos)
      if (typeof test == "string" ? type === test : test(type, node)) { 
        if (!result || node.start < result.start) result = node;
      }
    base[type](node, st, c);
  }
  c(node, state);
  return result;
}

const defaultWalker = {
  Program(node, st, c) {
    for (let i = 0; i < node.body.length; i++) c(node.body[i], st, "Statement");
  },
  // Default implementations for other nodes as placeholders
  Literal(node, st, c) {},
  // Add any other node types you need in your implementation
};

module.exports = {
  simple, ancestor, recursive, make, full, fullAncestor,
  findNodeAt, findNodeAround, findNodeAfter
};
