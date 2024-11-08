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
    if (iterable) this.#initializeFromIterable(iterable);
  }

  static create(...args) {
    return new Yallist(args);
  }

  push(...items) {
    items.forEach(item => this.#insertEnd(item));
  }

  unshift(...items) {
    items.reverse().forEach(item => this.#insertStart(item));
  }

  pop() {
    return this.tail ? this.#removeNode(this.tail).value : undefined;
  }

  shift() {
    return this.head ? this.#removeNode(this.head).value : undefined;
  }

  forEach(fn, thisp = this) {
    this.#iterateList((node, index) => fn.call(thisp, node.value, index, this));
  }

  forEachReverse(fn, thisp = this) {
    this.#iterateListReverse((node, index) => fn.call(thisp, node.value, index, this));
  }

  map(fn, thisp = this) {
    return this.#mapNodes(node => fn.call(thisp, node.value, this));
  }

  mapReverse(fn, thisp = this) {
    return this.#mapNodesReverse(node => fn.call(thisp, node.value, this));
  }

  reduce(fn, initialValue) {
    return this.#reduceList(fn, initialValue);
  }

  reduceReverse(fn, initialValue) {
    return this.#reduceListReverse(fn, initialValue);
  }

  reverse() {
    [this.head, this.tail] = [this.tail, this.head];
    this.#reverseLinks();
  }

  get(n) {
    return this.#getNode(n)?.value;
  }

  getReverse(n) {
    return this.#getNodeReverse(n)?.value;
  }

  slice(from = 0, to = this.length) {
    return this.#sliceList(from, to);
  }

  sliceReverse(from = 0, to = this.length) {
    return this.#sliceListReverse(from, to);
  }

  splice(start, deleteCount, ...items) {
    return this.#spliceList(start, deleteCount, items);
  }

  toArray() {
    return this.#listToArray();
  }

  toArrayReverse() {
    return this.#listToArrayReverse();
  }

  unshiftNode(node) {
    this.#transferNode(node, true);
  }

  pushNode(node) {
    this.#transferNode(node, false);
  }

  #initializeFromIterable(iterable) {
    for (const item of iterable) this.push(item);
  }

  #insertEnd(value) {
    const node = new Node(value, this.tail, null, this);
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.length++;
  }

  #insertStart(value) {
    const node = new Node(value, null, this.head, this);
    if (this.head) this.head.prev = node;
    else this.tail = node;
    this.head = node;
    this.length++;
  }

  #removeNode(node) {
    if (node.list !== this) throw new Error('Node does not belong to this list');
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
    node.next = node.prev = node.list = null;
    this.length--;
    return node;
  }

  #iterateList(callback) {
    let current = this.head, index = 0;
    while (current) {
      callback(current, index);
      current = current.next;
      index++;
    }
  }

  #iterateListReverse(callback) {
    let current = this.tail, index = this.length - 1;
    while (current) {
      callback(current, index);
      current = current.prev;
      index--;
    }
  }

  #mapNodes(fn) {
    const result = new Yallist();
    this.#iterateList(node => result.push(fn(node)));
    return result;
  }

  #mapNodesReverse(fn) {
    const result = new Yallist();
    this.#iterateListReverse(node => result.push(fn(node)));
    return result;
  }

  #reduceList(fn, acc) {
    this.#iterateList((node) => acc = fn(acc, node.value, this));
    return acc;
  }

  #reduceListReverse(fn, acc) {
    this.#iterateListReverse((node) => acc = fn(acc, node.value, this));
    return acc;
  }

  #reverseLinks() {
    let current = this.head;
    while (current) {
      [current.prev, current.next] = [current.next, current.prev];
      current = current.prev;
    }
  }

  #getNode(n) {
    let current = this.head, index = 0;
    while (current) {
      if (index === n) return current;
      current = current.next;
      index++;
    }
    return undefined;
  }

  #getNodeReverse(n) {
    let current = this.tail, index = 0;
    while (current) {
      if (index === n) return current;
      current = current.prev;
      index++;
    }
    return undefined;
  }

  #sliceList(from, to) {
    const result = new Yallist();
    let current = this.head, index = 0;
    while (current && index < to) {
      if (index >= from) result.push(current.value);
      current = current.next;
      index++;
    }
    return result;
  }

  #sliceListReverse(from, to) {
    const result = new Yallist();
    let current = this.tail, index = 0;
    while (current && index < to) {
      if (index >= from) result.unshift(current.value);
      current = current.prev;
      index++;
    }
    return result;
  }

  #spliceList(start, deleteCount, items) {
    let current = this.head, index = 0;
    while (current && index < start) {
      current = current.next;
      index++;
    }

    const deleted = new Yallist();
    for (let i = 0; i < deleteCount && current; i++) {
      deleted.push(current.value);
      current = this.#removeNode(current).next;
    }

    items.reverse().forEach(item => this.#insertNodeBefore(current, item));
    return deleted;
  }

  #listToArray() {
    const result = [];
    this.#iterateList(node => result.push(node.value));
    return result;
  }

  #listToArrayReverse() {
    const result = [];
    this.#iterateListReverse(node => result.push(node.value));
    return result;
  }

  #transferNode(node, isUnshift) {
    if (node.list) node.list.removeNode(node);
    node.list = this;
    if (isUnshift) {
      node.prev = null;
      node.next = this.head;
      if (this.head) this.head.prev = node;
      this.head = node;
      if (!this.tail) this.tail = node;
    } else {
      node.prev = this.tail;
      node.next = null;
      if (this.tail) this.tail.next = node;
      this.tail = node;
      if (!this.head) this.head = node;
    }
    this.length++;
  }

  #insertNodeBefore(current, value) {
    const node = new Node(value, current ? current.prev : null, current, this);
    if (node.prev) node.prev.next = node;
    else this.head = node;
    if (node.next) node.next.prev = node;
    else this.tail = node;
    this.length++;
  }
}

export { Yallist, Node };
