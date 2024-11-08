'use strict';

class Node {
  constructor(value, prev = null, next = null, list = null) {
    this.list = list;
    this.value = value;
    this.prev = prev;
    this.next = next;
    
    if (prev) prev.next = this;
    if (next) next.prev = this;
  }
}

class Yallist {
  constructor(list) {
    if (!(this instanceof Yallist)) {
      return new Yallist(list);
    }
    
    this.head = null;
    this.tail = null;
    this.length = 0;

    if (typeof list?.forEach === 'function') {
      list.forEach(item => this.push(item));
    } else if (arguments.length > 0) {
      [...arguments].forEach(arg => this.push(arg));
    }
  }
  
  static create(...args) {
    return new Yallist(...args);
  }
  
  removeNode(node) {
    if (node.list !== this) {
      throw new Error('removing node which does not belong to this list');
    }

    const { next, prev } = node;
    
    if (next) next.prev = prev;
    if (prev) prev.next = next;

    if (node === this.head) this.head = next;
    if (node === this.tail) this.tail = prev;

    node.list.length--;
    node.next = node.prev = node.list = null;

    return next;
  }
  
  unshiftNode(node) {
    if (node === this.head) return;

    if (node.list) {
      node.list.removeNode(node);
    }
    
    node.list = this;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    
    if (!this.tail) this.tail = node;
    this.length++;
  }
  
  pushNode(node) {
    if (node === this.tail) return;

    if (node.list) {
      node.list.removeNode(node);
    }
    
    node.list = this;
    node.prev = this.tail;
    if (this.tail) this.tail.next = node;
    this.tail = node;
    
    if (!this.head) this.head = node;
    this.length++;
  }
  
  push(...items) {
    items.forEach(item => this.tail = new Node(item, this.tail, null, this));
    if (!this.head) this.head = this.tail;
    this.length += items.length;
    return this.length;
  }
  
  unshift(...items) {
    items.forEach(item => this.head = new Node(item, null, this.head, this));
    if (!this.tail) this.tail = this.head;
    this.length += items.length;
    return this.length;
  }
  
  pop() {
    if (!this.tail) return undefined;

    const res = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    this.length--;
    return res;
  }
  
  shift() {
    if (!this.head) return undefined;

    const res = this.head.value;
    this.head = this.head.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
    return res;
  }
  
  forEach(fn, thisp = this) {
    let walker = this.head;
    for (let i = 0; walker !== null; i++) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.next;
    }
  }
  
  forEachReverse(fn, thisp = this) {
    let walker = this.tail;
    for (let i = this.length - 1; walker !== null; i--) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.prev;
    }
  }
  
  get(n) {
    let walker = this.head;
    for (let i = 0; walker !== null && i < n; i++) {
      walker = walker.next;
    }
    return walker !== null ? walker.value : undefined;
  }
  
  getReverse(n) {
    let walker = this.tail;
    for (let i = 0; walker !== null && i < n; i++) {
      walker = walker.prev;
    }
    return walker !== null ? walker.value : undefined;
  }
  
  map(fn, thisp = this) {
    const res = new Yallist();
    let walker = this.head;
    while (walker !== null) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.next;
    }
    return res;
  }

  mapReverse(fn, thisp = this) {
    const res = new Yallist();
    let walker = this.tail;
    while (walker !== null) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.prev;
    }
    return res;
  }
  
  reduce(fn, initial) {
    let acc, walker = this.head;
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
    let acc, walker = this.tail;
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
    let walker = this.head;
    for (let i = 0; walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.next;
    }
    return arr;
  }

  toArrayReverse() {
    const arr = new Array(this.length);
    let walker = this.tail;
    for (let i = 0; walker !== null; i++) {
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
    
    let i = 0, walker = this.head;
    while (walker !== null && i < from) {
      walker = walker.next;
      i++;
    }
    while (walker !== null && i < to) {
      ret.push(walker.value);
      walker = walker.next;
      i++;
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
    
    let i = this.length, walker = this.tail;
    while (walker !== null && i > to) {
      walker = walker.prev;
      i--;
    }
    while (walker !== null && i > from) {
      ret.push(walker.value);
      walker = walker.prev;
      i--;
    }
    return ret;
  }
  
  splice(start, deleteCount, ...nodes) {
    if (start > this.length) start = this.length - 1;
    if (start < 0) start += this.length;
    
    let i = 0, walker = this.head;
    while (walker !== null && i < start) {
      walker = walker.next;
      i++;
    }
    
    const ret = [];
    for (i = 0; walker && i < deleteCount; i++) {
      ret.push(walker.value);
      walker = this.removeNode(walker);
    }
    if (walker === null) walker = this.tail;

    if (walker !== this.head && walker !== this.tail) walker = walker.prev;

    nodes.forEach(node => walker = this.insert(walker, node));
    return ret;
  }

  reverse() {
    let head = this.head, tail = this.tail;
    let walker = head;
    while (walker !== null) {
      const p = walker.prev;
      walker.prev = walker.next;
      walker.next = p;
      walker = walker.prev;
    }
    this.head = tail;
    this.tail = head;
    return this;
  }
  
  insert(node, value) {
    const inserted = node === this.head
      ? new Node(value, null, node, this)
      : new Node(value, node, node.next, this);

    if (inserted.next === null) this.tail = inserted;
    if (inserted.prev === null) this.head = inserted;
    
    this.length++;
    return inserted;
  }
}

module.exports = Yallist;

try {
  require('./iterator.js')(Yallist);
} catch (er) {}
