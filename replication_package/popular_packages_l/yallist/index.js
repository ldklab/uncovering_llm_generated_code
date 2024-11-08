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
    for (const item of items) {
      const node = new Node(item, this.tail, null, this);
      if (this.tail) {
        this.tail.next = node;
      } else {
        this.head = node;
      }
      this.tail = node;
      this.length++;
    }
  }

  unshift(...items) {
    for (const item of items.reverse()) {
      const node = new Node(item, null, this.head, this);
      if (this.head) {
        this.head.prev = node;
      } else {
        this.tail = node;
      }
      this.head = node;
      this.length++;
    }
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
    let current = this.head;
    let index = 0;
    while (current) {
      fn.call(thisp, current.value, index, this);
      current = current.next;
      index++;
    }
  }

  forEachReverse(fn, thisp = this) {
    let current = this.tail;
    let index = this.length - 1;
    while (current) {
      fn.call(thisp, current.value, index, this);
      current = current.prev;
      index--;
    }
  }

  map(fn, thisp = this) {
    const result = new Yallist();
    for (let current = this.head; current; current = current.next) {
      result.push(fn.call(thisp, current.value, this));
    }
    return result;
  }

  mapReverse(fn, thisp = this) {
    const result = new Yallist();
    for (let current = this.tail; current; current = current.prev) {
      result.push(fn.call(thisp, current.value, this));
    }
    return result;
  }

  reduce(fn, initialValue) {
    let acc = initialValue;
    for (let current = this.head; current; current = current.next) {
      acc = fn(acc, current.value, this);
    }
    return acc;
  }

  reduceReverse(fn, initialValue) {
    let acc = initialValue;
    for (let current = this.tail; current; current = current.prev) {
      acc = fn(acc, current.value, this);
    }
    return acc;
  }

  reverse() {
    let current = this.head;
    this.head = this.tail;
    this.tail = current;

    while (current) {
      const temp = current.next;
      current.next = current.prev;
      current.prev = temp;
      current = temp;
    }
  }

  get(n) {
    let current = this.head;
    let index = 0;
    while (current) {
      if (index === n) return current.value;
      current = current.next;
      index++;
    }
    return undefined;
  }

  getReverse(n) {
    let current = this.tail;
    let index = 0;
    while (current) {
      if (index === n) return current.value;
      current = current.prev;
      index++;
    }
    return undefined;
  }

  slice(from = 0, to = this.length) {
    const result = new Yallist();
    let index = 0;
    for (let current = this.head; current && index < to; current = current.next) {
      if (index >= from) result.push(current.value);
      index++;
    }
    return result;
  }

  sliceReverse(from = 0, to = this.length) {
    const result = new Yallist();
    let index = 0;
    for (let current = this.tail; current && index < to; current = current.prev) {
      if (index >= from) result.unshift(current.value);
      index++;
    }
    return result;
  }

  splice(start, deleteCount, ...items) {
    let current = this.head;
    let index = 0;
    while (current && index < start) {
      current = current.next;
      index++;
    }

    const result = new Yallist();
    for (let i = 0; i < deleteCount && current; i++) {
      result.push(current.value);
      this.removeNode(current);
      current = current.next;
    }

    for (const item of items.reverse()) {
      const node = new Node(item, current ? current.prev : null, current, this);
      if (node.prev) node.prev.next = node;
      else this.head = node;
      if (node.next) node.next.prev = node;
      else this.tail = node;
      this.length++;
    }

    return result;
  }

  toArray() {
    const result = [];
    for (let current = this.head; current; current = current.next) {
      result.push(current.value);
    }
    return result;
  }

  toArrayReverse() {
    const result = [];
    for (let current = this.tail; current; current = current.prev) {
      result.push(current.value);
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
