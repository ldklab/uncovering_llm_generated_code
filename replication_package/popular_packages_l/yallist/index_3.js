class Node {
  constructor(value, prev = null, next = null, list = null) {
    this.value = value;
    this.prev = prev;
    this.next = next;
    this.list = list;
  }
}

class Yallist {
  constructor(iterable) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    if (iterable) {
      for (const item of iterable) {
        this.push(item);
      }
    }
  }

  static create(...args) {
    return new Yallist(args);
  }

  push(...items) {
    items.forEach(item => {
      const node = new Node(item, this.tail, null, this);
      if (this.tail) this.tail.next = node;
      else this.head = node;
      this.tail = node;
      this.length++;
    });
  }

  unshift(...items) {
    items.reverse().forEach(item => {
      const node = new Node(item, null, this.head, this);
      if (this.head) this.head.prev = node;
      else this.tail = node;
      this.head = node;
      this.length++;
    });
  }

  pop() {
    if (!this.tail) return undefined;
    const value = this.tail.value;
    this.removeNode(this.tail);
    return value;
  }

  shift() {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.removeNode(this.head);
    return value;
  }

  forEach(fn, thisp = this) {
    let current = this.head, index = 0;
    while (current) {
      fn.call(thisp, current.value, index++, this);
      current = current.next;
    }
  }

  forEachReverse(fn, thisp = this) {
    let current = this.tail, index = this.length - 1;
    while (current) {
      fn.call(thisp, current.value, index--, this);
      current = current.prev;
    }
  }

  map(fn, thisp = this) {
    const result = new Yallist();
    let current = this.head;
    while (current) {
      result.push(fn.call(thisp, current.value, this));
      current = current.next;
    }
    return result;
  }

  mapReverse(fn, thisp = this) {
    const result = new Yallist();
    let current = this.tail;
    while (current) {
      result.push(fn.call(thisp, current.value, this));
      current = current.prev;
    }
    return result;
  }

  reduce(fn, initialValue) {
    let acc = initialValue, current = this.head;
    while (current) {
      acc = fn(acc, current.value, this);
      current = current.next;
    }
    return acc;
  }

  reduceReverse(fn, initialValue) {
    let acc = initialValue, current = this.tail;
    while (current) {
      acc = fn(acc, current.value, this);
      current = current.prev;
    }
    return acc;
  }

  reverse() {
    let current = this.head;
    [this.head, this.tail] = [this.tail, this.head];
    while (current) {
      [current.next, current.prev] = [current.prev, current.next];
      current = current.prev;
    }
  }

  get(n) {
    let current = this.head, index = 0;
    while (current) {
      if (index++ === n) return current.value;
      current = current.next;
    }
    return undefined;
  }

  getReverse(n) {
    let current = this.tail, index = 0;
    while (current) {
      if (index++ === n) return current.value;
      current = current.prev;
    }
    return undefined;
  }

  slice(from = 0, to = this.length) {
    const result = new Yallist();
    let current = this.head, index = 0;
    while (current && index < to) {
      if (index++ >= from) result.push(current.value);
      current = current.next;
    }
    return result;
  }

  sliceReverse(from = 0, to = this.length) {
    const result = new Yallist();
    let current = this.tail, index = 0;
    while (current && index < to) {
      if (index++ >= from) result.unshift(current.value);
      current = current.prev;
    }
    return result;
  }

  splice(start, deleteCount, ...items) {
    let current = this.head, index = 0;
    while (current && index < start) {
      current = current.next;
      index++;
    }
    const result = new Yallist();
    for (let i = 0; i < deleteCount && current; i++) {
      result.push(current.value);
      const next = current.next;
      this.removeNode(current);
      current = next;
    }
    items.reverse().forEach(item => {
      const node = new Node(item, current ? current.prev : null, current, this);
      if (node.prev) node.prev.next = node;
      else this.head = node;
      if (node.next) node.next.prev = node;
      else this.tail = node;
      this.length++;
    });
    return result;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  toArrayReverse() {
    const result = [];
    let current = this.tail;
    while (current) {
      result.push(current.value);
      current = current.prev;
    }
    return result;
  }

  unshiftNode(node) {
    if (node.list) node.list.removeNode(node);
    node.list = this;
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.length++;
  }

  pushNode(node) {
    if (node.list) node.list.removeNode(node);
    node.list = this;
    node.prev = this.tail;
    node.next = null;
    if (this.tail) this.tail.next = node;
    this.tail = node;
    if (!this.head) this.head = node;
    this.length++;
  }

  removeNode(node) {
    if (node.list !== this) throw new Error('Node does not belong to this list');
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
    node.list = null;
    node.next = null;
    node.prev = null;
    this.length--;
  }
}

export { Yallist, Node };
