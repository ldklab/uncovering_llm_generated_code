const acorn = require('acorn');

function simple(node, visitors, base = defaultWalker, state = null) {
  const visitNode = (node, state, override) => {
    const type = override || node.type;
    if (visitors[type]) visitors[type](node, state, visitNode);
    else base[type](node, state, visitNode);
  };
  visitNode(node, state);
}

function ancestor(node, visitors, base = defaultWalker, state = []) {
  const visitNode = (node, state, override) => {
    const type = override || node.type;
    const newAncestors = state.concat(node);
    if (visitors[type]) visitors[type](node, newAncestors);
    base[type](node, newAncestors, visitNode);
  };
  visitNode(node, state);
}

function recursive(node, state, functions, base = defaultWalker) {
  const visitNode = (node, state, override) => {
    const type = override || node.type;
    if (functions[type]) functions[type](node, state, visitNode);
    else base[type](node, state, visitNode);
  };
  visitNode(node, state);
}

function make(functions, base = defaultWalker) {
  return { ...base, ...functions };
}

function full(node, callback, base = defaultWalker, state = null) {
  const visitNode = (node, state) => {
    callback(node, state, node.type);
    base[node.type](node, state, visitNode);
  };
  visitNode(node, state);
}

function fullAncestor(node, callback, base = defaultWalker, state = []) {
  const visitNode = (node, state) => {
    const newAncestors = state.concat(node);
    callback(node, newAncestors);
    base[node.type](node, newAncestors, visitNode);
  };
  visitNode(node, state);
}

function findNodeAt(node, start, end, test, base = defaultWalker, state = null) {
  let result;
  const visitNode = (node, state, override) => {
    const type = override || node.type;
    if ((start == null || node.start <= start) &&
        (end == null || node.end >= end) &&
        (typeof test === "string" ? type === test : test(type, node))) {
      result = node;
    }
    base[type](node, state, visitNode);
  };
  visitNode(node, state);
  return result;
}

function findNodeAround(node, pos, test, base = defaultWalker, state = null) {
  let result;
  const visitNode = (node, state, override) => {
    const type = override || node.type;
    if (node.start <= pos && node.end >= pos &&
        (typeof test === "string" ? type === test : test(type, node))) {
      result = node;
    }
    base[type](node, state, visitNode);
  };
  visitNode(node, state);
  return result;
}

function findNodeAfter(node, pos, test, base = defaultWalker, state = null) {
  let result;
  const visitNode = (node, state, override) => {
    const type = override || node.type;
    if (node.end >= pos &&
        (typeof test === "string" ? type === test : test(type, node))) {
      if (!result || node.start < result.start) result = node;
    }
    base[type](node, state, visitNode);
  };
  visitNode(node, state);
  return result;
}

const defaultWalker = {
  Program(node, state, visitNode) {
    node.body.forEach(statement => visitNode(statement, state, "Statement"));
  },
  Literal(node, state, visitNode) {},
  // Extend with more node types as needed
};

module.exports = {
  simple, ancestor, recursive, make, full, fullAncestor,
  findNodeAt, findNodeAround, findNodeAfter
};
