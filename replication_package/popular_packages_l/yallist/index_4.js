class Node {
  constructor(value, prev = null, next = null, list = null) {
    this.value = value;
    this.prev = prev;
    this.next = next;
    this.list = list;
  }
}

class DoublyLinkedList {
  constructor(iterable) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    if (iterable) {
      for (const item of iterable) {
        this.append(item);
      }
    }
  }

  static from(...elements) {
    return new DoublyLinkedList(elements);
  }

  append(...elements) {
    for (const element of elements) {
      const node = new Node(element, this.tail, null, this);
      if (this.tail) {
        this.tail.next = node;
      } else {
        this.head = node;
      }
      this.tail = node;
      this.length++;
    }
  }

  prepend(...elements) {
    for (const element of elements.reverse()) {
      const node = new Node(element, null, this.head, this);
      if (this.head) {
        this.head.prev = node;
      } else {
        this.tail = node;
      }
      this.head = node;
      this.length++;
    }
  }

  removeLast() {
    if (!this.tail) return undefined;
    const value = this.tail.value;
    this._removeNode(this.tail);
    return value;
  }

  removeFirst() {
    if (!this.head) return undefined;
    const value = this.head.value;
    this._removeNode(this.head);
    return value;
  }

  forEach(callback, context = this) {
    let index = 0;
    for (let node = this.head; node; node = node.next) {
      callback.call(context, node.value, index++, this);
    }
  }

  forEachReversed(callback, context = this) {
    let index = this.length - 1;
    for (let node = this.tail; node; node = node.prev) {
      callback.call(context, node.value, index--, this);
    }
  }

  map(callback, context = this) {
    const result = new DoublyLinkedList();
    for (let node = this.head; node; node = node.next) {
      result.append(callback.call(context, node.value, this));
    }
    return result;
  }

  mapReversed(callback, context = this) {
    const result = new DoublyLinkedList();
    for (let node = this.tail; node; node = node.prev) {
      result.append(callback.call(context, node.value, this));
    }
    return result;
  }

  reduce(callback, initialValue) {
    let accumulator = initialValue;
    for (let node = this.head; node; node = node.next) {
      accumulator = callback(accumulator, node.value, this);
    }
    return accumulator;
  }

  reduceReversed(callback, initialValue) {
    let accumulator = initialValue;
    for (let node = this.tail; node; node = node.prev) {
      accumulator = callback(accumulator, node.value, this);
    }
    return accumulator;
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

  get(index) {
    let node = this.head;
    let counter = 0;

    while (node) {
      if (counter === index) return node.value;
      node = node.next;
      counter++;
    }
    return undefined;
  }

  getReversed(index) {
    let node = this.tail;
    let counter = 0;

    while (node) {
      if (counter === index) return node.value;
      node = node.prev;
      counter++;
    }
    return undefined;
  }

  slice(start = 0, end = this.length) {
    const result = new DoublyLinkedList();
    let index = 0;
    for (let node = this.head; node && index < end; node = node.next) {
      if (index >= start) result.append(node.value);
      index++;
    }
    return result;
  }

  sliceReversed(start = 0, end = this.length) {
    const result = new DoublyLinkedList();
    let index = 0;
    for (let node = this.tail; node && index < end; node = node.prev) {
      if (index >= start) result.prepend(node.value);
      index++;
    }
    return result;
  }

  splice(start, deleteCount, ...elements) {
    let index = 0;
    let node = this.head;

    while (node && index < start) {
      node = node.next;
      index++;
    }

    const removed = new DoublyLinkedList();
    for (let i = 0; i < deleteCount && node; i++) {
      removed.append(node.value);
      const nextNode = node.next;
      this._removeNode(node);
      node = nextNode;
    }

    for (const element of elements.reverse()) {
      const newNode = new Node(element, node ? node.prev : null, node, this);
      if (newNode.prev) newNode.prev.next = newNode;
      else this.head = newNode;
      if (newNode.next) newNode.next.prev = newNode;
      else this.tail = newNode;
      this.length++;
    }

    return removed;
  }

  toArray() {
    const array = [];
    for (let node = this.head; node; node = node.next) {
      array.push(node.value);
    }
    return array;
  }

  toArrayReversed() {
    const array = [];
    for (let node = this.tail; node; node = node.prev) {
      array.push(node.value);
    }
    return array;
  }

  prependNode(node) {
    if (node.list) node.list._removeNode(node);
    node.list = this;
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.length++;
  }

  appendNode(node) {
    if (node.list) node.list._removeNode(node);
    node.list = this;
    node.prev = this.tail;
    node.next = null;
    if (this.tail) this.tail.next = node;
    this.tail = node;
    if (!this.head) this.head = node;
    this.length++;
  }

  _removeNode(node) {
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

export { DoublyLinkedList as List, Node };
