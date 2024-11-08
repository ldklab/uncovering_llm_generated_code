const deepClone = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  return Array.isArray(obj) ? obj.map(deepClone) : Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepClone(v)]));
};

const upperBound = (array, pred) => {
  let low = 0, high = array.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (pred(array[mid])) high = mid;
    else low = mid + 1;
  }
  return low;
};

const Syntax = Object.freeze({
  AssignmentExpression: 'AssignmentExpression',
  ArrayExpression: 'ArrayExpression',
  // ... rest of the node types
});

const VisitorKeys = Object.freeze({
  AssignmentExpression: ['left', 'right'],
  ArrayExpression: ['elements'],
  // ... rest of the visitor keys
});

const VisitorOption = {
  Break: {},
  Skip: {},
  Remove: {}
};

class Reference {
  constructor(parent, key) {
    this.parent = parent;
    this.key = key;
  }

  replace(node) {
    this.parent[this.key] = node;
  }

  remove() {
    if (Array.isArray(this.parent)) {
      this.parent.splice(this.key, 1);
      return true;
    } else {
      this.replace(null);
      return false;
    }
  }
}

class Element {
  constructor(node, path, wrap, ref) {
    this.node = node;
    this.path = path;
    this.wrap = wrap;
    this.ref = ref;
  }
}

class Controller {
  path() {
    return this.__leavelist.slice(2).flatMap(e => e.path || []);
  }
  
  type() {
    return this.current().type || this.__current.wrap;
  }
  
  parents() {
    return this.__leavelist.slice(1).map(e => e.node);
  }
  
  current() {
    return this.__current.node;
  }
  
  __execute(callback, element) {
    this.__state = null;
    const prev = this.__current;
    this.__current = element;
    const result = callback ? callback.call(this, element.node, this.__leavelist.at(-1)?.node) : undefined;
    this.__current = prev;
    return result;
  }

  notify(flag) {
    this.__state = flag;
  }

  skip() {
    this.notify(VisitorOption.Skip);
  }

  break() {
    this.notify(VisitorOption.Break);
  }

  remove() {
    this.notify(VisitorOption.Remove);
  }

  __init(root, visitor) {
    this.visitor = visitor;
    this.root = root;
    this.__worklist = [new Element(root, null, null, null)];
    this.__leavelist = [new Element(null, null, null, null)];
    this.__current = null;
    this.__state = null;
    this.__fallback = visitor.fallback === 'iteration' ? Object.keys :
                      typeof visitor.fallback === 'function' ? visitor.fallback : null;
    this.__keys = { ...VisitorKeys, ...(visitor.keys || {}) };
  }

  traverse(root, visitor) {
    this.__init(root, visitor);
    const sentinel = {};
    const { __worklist: worklist, __leavelist: leavelist } = this;

    while (worklist.length) {
      let element = worklist.pop();

      if (element === sentinel) {
        element = leavelist.pop();
        const result = this.__execute(visitor.leave, element);
        if (this.__state === VisitorOption.Break || result === VisitorOption.Break) return;
        continue;
      }

      if (element.node) {
        const enterResult = this.__execute(visitor.enter, element);
        if (this.__state === VisitorOption.Break || enterResult === VisitorOption.Break) return;

        worklist.push(sentinel);
        leavelist.push(element);

        if (this.__state === VisitorOption.Skip || enterResult === VisitorOption.Skip) continue;

        const node = element.node;
        const candidates = this.__keys[node.type || element.wrap] || (this.__fallback && this.__fallback(node));
        if (!candidates) throw new Error(`Unknown node type ${node.type || element.wrap}.`);

        candidates.reverse().forEach(key => {
          const candidate = node[key];
          if (!candidate) return;
          if (Array.isArray(candidate)) {
            candidate.forEach((c, i) => {
              if (c) worklist.push(new Element(c, [key, i], isProperty(node.type, key) ? 'Property' : null, null));
            });
          } else if (isNode(candidate)) {
            worklist.push(new Element(candidate, key, null, null));
          }
        });
      }
    }
  }

  replace(root, visitor) {
    this.__init(root, visitor);
    const sentinel = {};
    const { __worklist: worklist, __leavelist: leavelist } = this;

    const outer = { root };
    const ref = new Reference(outer, 'root');
    const element = new Element(root, null, null, ref);
    worklist.push(element);
    leavelist.push(element);

    while (worklist.length) {
      let element = worklist.pop();

      if (element === sentinel) {
        element = leavelist.pop();
        const leaveResult = this.__execute(visitor.leave, element);
        if (leaveResult !== undefined && LeaveResult !== VisitorOption.Break &&
            LeaveResult !== VisitorOption.Skip && LeaveResult !== VisitorOption.Remove) {
          element.ref.replace(leaveResult);
        }

        if (this.__state === VisitorOption.Remove || leaveResult === VisitorOption.Remove) {
          element.ref.remove();
        }

        if (this.__state === VisitorOption.Break || leaveResult === VisitorOption.Break) return outer.root;
        continue;
      }

      const enterResult = this.__execute(visitor.enter, element);
      if (enterResult !== undefined && enterResult !== VisitorOption.Break &&
          enterResult !== VisitorOption.Skip && enterResult !== VisitorOption.Remove) {
        element.ref.replace(enterResult);
        element.node = enterResult;
      }

      if (this.__state === VisitorOption.Remove || enterResult === VisitorOption.Remove) {
        element.ref.remove();
        element.node = null;
      }

      if (this.__state === VisitorOption.Break || enterResult === VisitorOption.Break) return outer.root;

      const node = element.node;
      if (!node) continue;

      worklist.push(sentinel);
      leavelist.push(element);

      if (this.__state === VisitorOption.Skip || enterResult === VisitorOption.Skip) continue;

      const candidates = this.__keys[node.type || element.wrap] || (this.__fallback && this.__fallback(node));
      if (!candidates) throw new Error(`Unknown node type ${node.type || element.wrap}.`);

      candidates.reverse().forEach(key => {
        const candidate = node[key];
        if (!candidate) return;
        if (Array.isArray(candidate)) {
          candidate.forEach((c, i) => {
            if (c) worklist.push(new Element(c, [key, i], isProperty(node.type, key) ? 'Property' : null, new Reference(candidate, i)));
          });
        } else if (isNode(candidate)) {
          worklist.push(new Element(candidate, key, null, new Reference(node, key)));
        }
      });
    }

    return outer.root;
  }
}

const isNode = node => node && typeof node === 'object' && typeof node.type === 'string';
const isProperty = (nodeType, key) => (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === 'properties';

const attachComments = (tree, providedComments, tokens) => {
  if (!tree.range) throw new Error('attachComments needs range information');
  if (!tokens.length) {
    if (providedComments.length) tree.leadingComments = providedComments.map(comment => ({ ...comment, extendedRange: [0, tree.range[0]] }));
    return tree;
  }

  const comments = providedComments.map(comment => {
    const cl = deepClone(comment);
    const tokIndex = upperBound(tokens, token => token.range[0] > cl.range[0]);
    cl.extendedRange = [cl.range[0], tokens[tokIndex]?.range[0] ?? cl.range[1]];
    if (tokIndex > 0) cl.extendedRange[0] = tokens[tokIndex - 1]?.range[1] ?? cl.extendedRange[0];
    return cl;
  });

  let cursor = 0;
  const traverseTree = (callback) => {
    const controller = new Controller();
    controller.traverse(tree, {
      enter(node) {
        let result = callback(node);
        while (cursor < comments.length) {
          const comment = comments[cursor];
          if (comment.extendedRange[1] > node.range[0]) break;
          if (comment.extendedRange[1] === node.range[0]) {
            (node.leadingComments ||= []).push(comment);
            comments.splice(cursor, 1);
          } else cursor++;
        }
        if (result === VisitorOption.Break) return VisitorOption.Break;
        if (cursor === comments.length || comments[cursor].extendedRange[0] > node.range[1]) {
          return VisitorOption.Skip;
        }
      }
    });
  };

  traverseTree((node) => {
    let result = VisitorOption.Break;
    while (cursor < comments.length) {
      const comment = comments[cursor];
      if (node.range[1] < comment.extendedRange[0]) break;
      if (node.range[1] === comment.extendedRange[0]) {
        (node.trailingComments ||= []).push(comment);
        comments.splice(cursor, 1);
      } else cursor++;
    }
    if (cursor === comments.length || comments[cursor].extendedRange[0] > node.range[1]) result = VisitorOption.Skip;
    return result;
  });

  return tree;
};

const traverse = (root, visitor) => new Controller().traverse(root, visitor);
const replace = (root, visitor) => new Controller().replace(root, visitor);

module.exports = {
  Syntax,
  traverse,
  replace,
  attachComments,
  VisitorKeys,
  VisitorOption,
  Controller,
  cloneEnvironment: () => ({}),
};
