class ListNode {
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

  static create(...elements) {
    return new DoublyLinkedList(elements);
  }

  append(...items) {
    for (const item of items) {
      const node = new ListNode(item, this.tail, null, this);
      if (this.tail) {
        this.tail.next = node;
      } else {
        this.head = node;
      }
      this.tail = node;
      this.length++;
    }
  }

  prepend(...items) {
    for (const item of items.reverse()) {
      const node = new ListNode(item, null, this.head, this);
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
    this.removeNode(this.tail);
    return value;
  }

  removeFirst() {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.removeNode(this.head);
    return value;
  }

  iterate(fn, thisArg = this) {
    let current = this.head;
    let index = 0;
    while (current) {
      fn.call(thisArg, current.value, index, this);
      current = current.next;
      index++;
    }
  }

  iterateReverse(fn, thisArg = this) {
    let current = this.tail;
    let index = this.length - 1;
    while (current) {
      fn.call(thisArg, current.value, index, this);
      current = current.prev;
      index--;
    }
  }

  transform(fn, thisArg = this) {
    const newList = new DoublyLinkedList();
    for (let current = this.head; current; current = current.next) {
      newList.append(fn.call(thisArg, current.value, this));
    }
    return newList;
  }

  transformReverse(fn, thisArg = this) {
    const newList = new DoublyLinkedList();
    for (let current = this.tail; current; current = current.prev) {
      newList.append(fn.call(thisArg, current.value, this));
    }
    return newList;
  }

  accumulate(fn, initialValue) {
    let acc = initialValue;
    for (let current = this.head; current; current = current.next) {
      acc = fn(acc, current.value, this);
    }
    return acc;
  }

  accumulateReverse(fn, initialValue) {
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

  getElement(n) {
    let current = this.head;
    let index = 0;
    while (current) {
      if (index === n) return current.value;
      current = current.next;
      index++;
    }
    return undefined;
  }

  getElementReverse(n) {
    let current = this.tail;
    let index = 0;
    while (current) {
      if (index === n) return current.value;
      current = current.prev;
      index++;
    }
    return undefined;
  }

  extractSlice(from = 0, to = this.length) {
    const sublist = new DoublyLinkedList();
    let index = 0;
    for (let current = this.head; current && index < to; current = current.next) {
      if (index >= from) sublist.append(current.value);
      index++;
    }
    return sublist;
  }

  extractSliceReverse(from = 0, to = this.length) {
    const sublist = new DoublyLinkedList();
    let index = 0;
    for (let current = this.tail; current && index < to; current = current.prev) {
      if (index >= from) sublist.prepend(current.value);
      index++;
    }
    return sublist;
  }

  modifyList(start, deleteCount, ...items) {
    let current = this.head;
    let index = 0;
    while (current && index < start) {
      current = current.next;
      index++;
    }

    const removed = new DoublyLinkedList();
    for (let i = 0; i < deleteCount && current; i++) {
      removed.append(current.value);
      this.removeNode(current);
      current = current.next;
    }

    for (const item of items.reverse()) {
      const node = new ListNode(item, current ? current.prev : null, current, this);
      if (node.prev) node.prev.next = node;
      else this.head = node;
      if (node.next) node.next.prev = node;
      else this.tail = node;
      this.length++;
    }

    return removed;
  }

  toArray() {
    const array = [];
    for (let current = this.head; current; current = current.next) {
      array.push(current.value);
    }
    return array;
  }

  toArrayReverse() {
    const array = [];
    for (let current = this.tail; current; current = current.prev) {
      array.push(current.value);
    }
    return array;
  }

  prependNode(node) {
    if (node.list) node.list.removeNode(node);
    node.list = this;
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.length++;
  }

  appendNode(node) {
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
    if (node.list !== this) throw new Error('Node is not part of this list');
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

export { DoublyLinkedList, ListNode };
