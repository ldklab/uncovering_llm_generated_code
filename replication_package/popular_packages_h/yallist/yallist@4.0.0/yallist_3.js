'use strict';

class Node {
  constructor(value, prev = null, next = null, list = null) {
    this.value = value;
    this.list = list;

    if (prev) {
      prev.next = this;
      this.prev = prev;
    } else {
      this.prev = null;
    }

    if (next) {
      next.prev = this;
      this.next = next;
    } else {
      this.next = null;
    }
  }
}

class Yallist {
  constructor(list) {
    if (!(this instanceof Yallist)) {
      return new Yallist(list);
    }

    this.tail = null;
    this.head = null;
    this.length = 0;

    if (list) {
      if (typeof list.forEach === 'function') {
        list.forEach(item => this.push(item));
      } else if (arguments.length > 0) {
        for (let i = 0, l = arguments.length; i < l; i++) {
          this.push(arguments[i]);
        }
      }
    }
  }

  removeNode(node) {
    if (node.list !== this) {
      throw new Error('Removing node which does not belong to this list');
    }

    const { next, prev } = node;

    if (next) next.prev = prev;
    if (prev) prev.next = next;

    if (node === this.head) this.head = next;
    if (node === this.tail) this.tail = prev;

    node.list.length--;
    node.next = null;
    node.prev = null;
    node.list = null;

    return next;
  }

  unshiftNode(node) {
    if (node === this.head) return;

    if (node.list) node.list.removeNode(node);

    const head = this.head;
    node.list = this;
    node.next = head;
    if (head) head.prev = node;

    this.head = node;
    if (!this.tail) this.tail = node;
    this.length++;
  }

  pushNode(node) {
    if (node === this.tail) return;

    if (node.list) node.list.removeNode(node);

    const tail = this.tail;
    node.list = this;
    node.prev = tail;
    if (tail) tail.next = node;

    this.tail = node;
    if (!this.head) this.head = node;
    this.length++;
  }

  push(...args) {
    args.forEach(item => push(this, item));
    return this.length;
  }

  unshift(...args) {
    args.forEach(item => unshift(this, item));
    return this.length;
  }

  pop() {
    if (!this.tail) return undefined;
    
    const res = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.length--;
    return res;
  }

  shift() {
    if (!this.head) return undefined;

    const res = this.head.value;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.length--;
    return res;
  }

  forEach(fn, thisp = this) {
    for (let walker = this.head, i = 0; walker !== null; i++) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.next;
    }
  }

  forEachReverse(fn, thisp = this) {
    for (let walker = this.tail, i = this.length - 1; walker !== null; i--) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.prev;
    }
  }

  get(n) {
    let i = 0;
    for (let walker = this.head; walker !== null && i < n; i++) {
      walker = walker.next;
    }
    if (i === n && walker !== null) {
      return walker.value;
    }
  }

  getReverse(n) {
    let i = 0;
    for (let walker = this.tail; walker !== null && i < n; i++) {
      walker = walker.prev;
    }
    if (i === n && walker !== null) {
      return walker.value;
    }
  }

  map(fn, thisp = this) {
    const res = new Yallist();
    for (let walker = this.head; walker !== null;) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.next;
    }
    return res;
  }

  mapReverse(fn, thisp = this) {
    const res = new Yallist();
    for (let walker = this.tail; walker !== null;) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.prev;
    }
    return res;
  }

  reduce(fn, initial) {
    let acc;
    let walker = this.head;

    if (arguments.length > 1) {
      acc = initial;
    } else if (this.head) {
      walker = this.head.next;
      acc = this.head.value;
    } else {
      throw new TypeError('Reduce of empty list with no initial value');
    }

    for (let i = 0; walker !== null; i++) {
      acc = fn(acc, walker.value, i);
      walker = walker.next;
    }

    return acc;
  }

  reduceReverse(fn, initial) {
    let acc;
    let walker = this.tail;

    if (arguments.length > 1) {
      acc = initial;
    } else if (this.tail) {
      walker = this.tail.prev;
      acc = this.tail.value;
    } else {
      throw new TypeError('Reduce of empty list with no initial value');
    }

    for (let i = this.length - 1; walker !== null; i--) {
      acc = fn(acc, walker.value, i);
      walker = walker.prev;
    }

    return acc;
  }

  toArray() {
    const arr = new Array(this.length);
    for (let i = 0, walker = this.head; walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.next;
    }
    return arr;
  }

  toArrayReverse() {
    const arr = new Array(this.length);
    for (let i = 0, walker = this.tail; walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.prev;
    }
    return arr;
  }

  slice(from = 0, to = this.length) {
    if (to < 0) to += this.length;
    if (from < 0) from += this.length;

    const ret = new Yallist();
    if (to < from || to < 0) return ret;

    if (from < 0) from = 0;
    if (to > this.length) to = this.length;

    let i = 0;
    let walker = this.head;
    for (; walker !== null && i < from; i++) {
      walker = walker.next;
    }
    for (; walker !== null && i < to; i++, walker = walker.next) {
      ret.push(walker.value);
    }
    return ret;
  }

  sliceReverse(from = 0, to = this.length) {
    if (to < 0) to += this.length;
    if (from < 0) from += this.length;

    const ret = new Yallist();
    if (to < from || to < 0) return ret;

    if (from < 0) from = 0;
    if (to > this.length) to = this.length;

    let i = this.length;
    let walker = this.tail;
    for (; walker !== null && i > to; i--) {
      walker = walker.prev;
    }
    for (; walker !== null && i > from; i--, walker = walker.prev) {
      ret.push(walker.value);
    }
    return ret;
  }

  splice(start, deleteCount, ...nodes) {
    if (start > this.length) start = this.length - 1;
    if (start < 0) start = this.length + start;

    let i = 0;
    let walker = this.head;
    for (; walker !== null && i < start; i++) {
      walker = walker.next;
    }

    const ret = [];
    for (i = 0; walker && i < deleteCount; i++) {
      ret.push(walker.value);
      walker = this.removeNode(walker);
    }
    if (walker === null) walker = this.tail;

    if (walker !== this.head && walker !== this.tail) {
      walker = walker.prev;
    }

    for (i = 0; i < nodes.length; i++) {
      walker = insert(this, walker, nodes[i]);
    }
    return ret;
  }

  reverse() {
    let head = this.head;
    let tail = this.tail;
    
    for (let walker = head; walker !== null; walker = walker.prev) {
      [walker.prev, walker.next] = [walker.next, walker.prev];
    }
    
    this.head = tail;
    this.tail = head;
    return this;
  }
}

function insert(self, node, value) {
  const inserted = node === self.head
    ? new Node(value, null, node, self)
    : new Node(value, node, node.next, self);

  if (inserted.next === null) self.tail = inserted;
  if (inserted.prev === null) self.head = inserted;

  self.length++;
  return inserted;
}

function push(self, item) {
  self.tail = new Node(item, self.tail, null, self);
  if (!self.head) self.head = self.tail;
  self.length++;
}

function unshift(self, item) {
  self.head = new Node(item, null, self.head, self);
  if (!self.tail) self.tail = self.head;
  self.length++;
}

// Export Yallist constructor
module.exports = Yallist;
