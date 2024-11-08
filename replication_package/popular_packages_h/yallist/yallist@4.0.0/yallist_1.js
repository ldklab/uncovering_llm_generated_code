'use strict';

module.exports = Yallist;

Yallist.Node = Node;
Yallist.create = Yallist;

function Yallist(items) {
  if (!(this instanceof Yallist)) {
    return new Yallist(items);
  }

  this.head = null;
  this.tail = null;
  this.length = 0;

  if (items) {
    if (typeof items.forEach === 'function') {
      items.forEach(item => this.push(item));
    } else {
      Array.from(arguments).forEach(item => this.push(item));
    }
  }
}

Yallist.prototype = {
  pushNode(node) {
    if (node.list) node.list.removeNode(node);

    node.prev = this.tail;
    node.next = null;
    if (this.tail) this.tail.next = node;
    else this.head = node; 

    this.tail = node;
    node.list = this;
    this.length++;
  },

  unshiftNode(node) {
    if (node.list) node.list.removeNode(node);

    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    else this.tail = node;

    this.head = node;
    node.list = this;
    this.length++;
  },

  removeNode(node) {
    if (node.list !== this) throw new Error('Node does not belong to this list');

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;

    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;

    node.list.length--;
    node.next = node.prev = node.list = null;
  },

  push(...values) {
    values.forEach(value => push(this, value));
    return this.length;
  },

  unshift(...values) {
    values.forEach(value => unshift(this, value));
    return this.length;
  },

  pop() {
    if (!this.tail) return undefined;

    const value = this.tail.value;
    this.removeNode(this.tail);
    return value;
  },

  shift() {
    if (!this.head) return undefined;

    const value = this.head.value;
    this.removeNode(this.head);
    return value;
  },

  forEach(fn, thisArg) {
    thisArg = thisArg || this;
    for (let walker = this.head, i = 0; walker; i++) {
      fn.call(thisArg, walker.value, i, this);
      walker = walker.next;
    }
  },

  forEachReverse(fn, thisArg) {
    thisArg = thisArg || this;
    for (let walker = this.tail, i = this.length - 1; walker; i--) {
      fn.call(thisArg, walker.value, i, this);
      walker = walker.prev;
    }
  },

  map(fn, thisArg) {
    const res = new Yallist();
    this.forEach(value => res.push(fn.call(thisArg || this, value)));
    return res;
  },

  mapReverse(fn, thisArg) {
    const res = new Yallist();
    this.forEachReverse(value => res.push(fn.call(thisArg || this, value)));
    return res;
  },

  reduce(fn, initialValue) {
    if (!this.head && arguments.length < 2) throw new TypeError('Reduce of empty list with no initial value');

    let acc = arguments.length > 1 ? initialValue : this.head.value;
    for (let walker = arguments.length > 1 ? this.head : this.head.next, i = arguments.length > 1 ? 0 : 1; walker; i++) {
      acc = fn(acc, walker.value, i);
      walker = walker.next;
    }
    return acc;
  },

  reduceReverse(fn, initialValue) {
    if (!this.tail && arguments.length < 2) throw new TypeError('Reduce of empty list with no initial value');

    let acc = arguments.length > 1 ? initialValue : this.tail.value;
    for (let walker = arguments.length > 1 ? this.tail : this.tail.prev, i = this.length - (arguments.length > 1 ? 1 : 2); walker; i--) {
      acc = fn(acc, walker.value, i);
      walker = walker.prev;
    }
    return acc;
  },

  toArray() {
    const arr = [];
    this.forEach(value => arr.push(value));
    return arr;
  },

  toArrayReverse() {
    const arr = [];
    this.forEachReverse(value => arr.push(value));
    return arr;
  },

  slice(from, to) {
    const ret = [];
    let i = 0;
    for (let walker = this.head; walker && i < to; i++) {
      if (i >= from) ret.push(walker.value);
      walker = walker.next;
    }
    return Yallist.fromArray(ret);
  },

  sliceReverse(from, to) {
    const ret = [];
    let i = this.length - 1;
    for (let walker = this.tail; walker && i >= from; i--) {
      if (i < to) ret.push(walker.value);
      walker = walker.prev;
    }
    return Yallist.fromArray(ret.reverse());
  },

  splice(index, deleteCount, ...nodes) {
    if (index < 0) index += this.length;
    if (index > this.length - 1) index = this.length - 1;

    let walker = this.head;
    for (let i = 0; i < index && walker; i++) walker = walker.next;

    const ret = [];
    for (let i = 0; i < deleteCount && walker; i++) {
      ret.push(walker.value);
      walker = this.removeNode(walker);
    }

    nodes.reverse().forEach(value => {
      walker = insert(this, walker, value);
    });

    return ret;
  },

  reverse() {
    let head = this.head;
    this.head = this.tail;
    this.tail = head;

    for (let walker = this.head; walker; walker = walker.prev) {
      const prev = walker.prev;
      walker.prev = walker.next;
      walker.next = prev;
    }
    return this;
  }
};

function push(self, value) {
  self.tail = new Node(value, self.tail, null, self);
  if (!self.head) self.head = self.tail;
  self.length++;
}

function unshift(self, value) {
  self.head = new Node(value, null, self.head, self);
  if (!self.tail) self.tail = self.head;
  self.length++;
}

function insert(self, node, value) {
  const newNode = node ? new Node(value, node.prev, node, self) : new Node(value, null, self.head, self);
  if (newNode.prev) newNode.prev.next = newNode;
  else self.head = newNode;
  if (newNode.next) newNode.next.prev = newNode;
  else self.tail = newNode;
  self.length++;
  return newNode;
}

function Node(value, prev, next, list) {
  this.value = value;
  this.prev = prev;
  this.next = next;
  this.list = list;

  if (prev) prev.next = this;
  if (next) next.prev = this;
}

try {
  require('./iterator.js')(Yallist);
} catch {}
