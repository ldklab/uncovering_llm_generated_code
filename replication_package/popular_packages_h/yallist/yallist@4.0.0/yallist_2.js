'use strict';

class Node {
  constructor(value, prev = null, next = null, list = null) {
    this.value = value;
    this.prev = prev;
    this.next = next;
    this.list = list;

    if (prev) prev.next = this;
    if (next) next.prev = this;
  }
}

class Yallist {
  constructor(list) {
    this.head = null;
    this.tail = null;
    this.length = 0;

    if (list && typeof list.forEach === 'function') {
      list.forEach(item => this.push(item));
    } else if (arguments.length > 0) {
      Array.from(arguments).forEach(item => this.push(item));
    }
  }

  static create(...args) {
    return new Yallist(...args);
  }

  removeNode(node) {
    if (node.list !== this) throw new Error('Removing node not in list');

    const { next, prev } = node;
    if (next) next.prev = prev;
    if (prev) prev.next = next;

    if (node === this.head) this.head = next;
    if (node === this.tail) this.tail = prev;

    node.next = node.prev = node.list = null;
    this.length--;
    return next;
  }

  unshiftNode(node) {
    if (node === this.head) return;
    if (node.list) node.list.removeNode(node);

    node.next = this.head;
    node.prev = null;
    node.list = this;

    if (this.head) this.head.prev = node;
    this.head = node;

    if (!this.tail) this.tail = node;
    this.length++;
  }

  pushNode(node) {
    if (node === this.tail) return;
    if (node.list) node.list.removeNode(node);

    node.prev = this.tail;
    node.next = null;
    node.list = this;

    if (this.tail) this.tail.next = node;
    this.tail = node;

    if (!this.head) this.head = node;
    this.length++;
  }

  push(...items) {
    items.forEach(item => {
      this.tail = new Node(item, this.tail, null, this);
      if (!this.head) this.head = this.tail;
      this.length++;
    });
    return this.length;
  }

  unshift(...items) {
    items.reverse().forEach(item => {
      this.head = new Node(item, null, this.head, this);
      if (!this.tail) this.tail = this.head;
      this.length++;
    });
    return this.length;
  }

  pop() {
    if (!this.tail) return undefined;
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.length--;
    return value;
  }

  shift() {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.length--;
    return value;
  }

  forEach(fn, thisArg = this) {
    let currentNode = this.head;
    let index = 0;
    while (currentNode) {
      fn.call(thisArg, currentNode.value, index++, this);
      currentNode = currentNode.next;
    }
  }

  forEachReverse(fn, thisArg = this) {
    let currentNode = this.tail;
    let index = this.length - 1;
    while (currentNode) {
      fn.call(thisArg, currentNode.value, index--, this);
      currentNode = currentNode.prev;
    }
  }

  get(n) {
    let currentNode = this.head;
    let index = 0;
    while (currentNode && index < n) {
      currentNode = currentNode.next;
      index++;
    }
    return currentNode ? currentNode.value : undefined;
  }

  getReverse(n) {
    let currentNode = this.tail;
    let index = 0;
    while (currentNode && index < n) {
      currentNode = currentNode.prev;
      index++;
    }
    return currentNode ? currentNode.value : undefined;
  }

  map(fn, thisArg = this) {
    const result = new Yallist();
    this.forEach((value) => {
      result.push(fn.call(thisArg, value, this));
    });
    return result;
  }

  mapReverse(fn, thisArg = this) {
    const result = new Yallist();
    this.forEachReverse((value) => {
      result.push(fn.call(thisArg, value, this));
    });
    return result;
  }

  reduce(fn, initial) {
    let accumulator;
    let currentNode = this.head;
    if (arguments.length > 1) {
      accumulator = initial;
    } else if (this.head) {
      accumulator = this.head.value;
      currentNode = this.head.next;
    } else {
      throw new TypeError('Reduce of empty list with no initial value');
    }

    let index = 0;
    while (currentNode) {
      accumulator = fn(accumulator, currentNode.value, index++, this);
      currentNode = currentNode.next;
    }

    return accumulator;
  }

  reduceReverse(fn, initial) {
    let accumulator;
    let currentNode = this.tail;
    if (arguments.length > 1) {
      accumulator = initial;
    } else if (this.tail) {
      accumulator = this.tail.value;
      currentNode = this.tail.prev;
    } else {
      throw new TypeError('Reduce of empty list with no initial value');
    }

    let index = this.length - 1;
    while (currentNode) {
      accumulator = fn(accumulator, currentNode.value, index--, this);
      currentNode = currentNode.prev;
    }

    return accumulator;
  }

  toArray() {
    const arr = new Array(this.length);
    let index = 0;
    let currentNode = this.head;
    while (currentNode) {
      arr[index++] = currentNode.value;
      currentNode = currentNode.next;
    }
    return arr;
  }

  toArrayReverse() {
    const arr = new Array(this.length);
    let index = 0;
    let currentNode = this.tail;
    while (currentNode) {
      arr[index++] = currentNode.value;
      currentNode = currentNode.prev;
    }
    return arr;
  }

  slice(from = 0, to = this.length) {
    if (to < 0) to += this.length;
    if (from < 0) from += this.length;
    const result = new Yallist();

    if (to < from || to < 0 || from >= this.length) return result;
    if (from < 0) from = 0;
    if (to > this.length) to = this.length;

    let currentNode = this.head;
    let index = 0;
    while (currentNode && index < from) {
      currentNode = currentNode.next;
      index++;
    }
    while (currentNode && index < to) {
      result.push(currentNode.value);
      currentNode = currentNode.next;
      index++;
    }
    return result;
  }

  sliceReverse(from = 0, to = this.length) {
    if (to < 0) to += this.length;
    if (from < 0) from += this.length;
    const result = new Yallist();

    if (to < from || to < 0 || from >= this.length) return result;
    if (from < 0) from = 0;
    if (to > this.length) to = this.length;

    let currentNode = this.tail;
    let index = this.length;
    while (currentNode && index > to) {
      currentNode = currentNode.prev;
      index--;
    }
    while (currentNode && index > from) {
      result.push(currentNode.value);
      currentNode = currentNode.prev;
      index--;
    }
    return result;
  }

  splice(start, deleteCount, ...nodes) {
    if (start > this.length) start = this.length - 1;
    if (start < 0) start = this.length + start;

    let currentNode = this.head;
    let index = 0;
    while (currentNode && index < start) {
      currentNode = currentNode.next;
      index++;
    }

    const removed = [];
    for (let i = 0; currentNode && i < deleteCount; i++) {
      removed.push(currentNode.value);
      currentNode = this.removeNode(currentNode);
    }

    if (!currentNode) currentNode = this.tail;
    if (currentNode !== this.head && currentNode !== this.tail) {
      currentNode = currentNode.prev;
    }

    nodes.forEach(nodeValue => {
      currentNode = insert(this, currentNode, nodeValue);
    });

    return removed;
  }

  reverse() {
    let currentNode = this.head;
    this.head = this.tail;
    this.tail = currentNode;
    while (currentNode) {
      const temp = currentNode.next;
      currentNode.next = currentNode.prev;
      currentNode.prev = temp;
      currentNode = currentNode.prev;
    }
    return this;
  }
}

function insert(self, node, value) {
  const newNode = node === self.head 
    ? new Node(value, null, node, self) 
    : new Node(value, node, node.next, self);

  if (!newNode.next) self.tail = newNode;
  if (!newNode.prev) self.head = newNode;

  self.length++;
  return newNode;
}

module.exports = Yallist;

try {
  require('./iterator.js')(Yallist);
} catch (error) {}
