"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.Yallist = void 0;

class Yallist {
    constructor(list = []) {
        this.head = null;
        this.tail = null;
        this.length = 0;
        list.forEach(item => this.push(item));
    }

    static create(list = []) {
        return new Yallist(list);
    }

    *[Symbol.iterator]() {
        let current = this.head;
        while (current) {
            yield current.value;
            current = current.next;
        }
    }

    removeNode(node) {
        if (node.list !== this) throw new Error('Node does not belong to this list');
        const { next, prev } = node;

        if (next) next.prev = prev;
        if (prev) prev.next = next;

        if (node === this.head) this.head = next;
        if (node === this.tail) this.tail = prev;

        this.length--;
        node.next = node.prev = node.list = null;
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

    push(...items) {
        items.forEach(item => this.insertAfter(this.tail, item));
        return this.length;
    }

    unshift(...items) {
        items.forEach(item => this.unshiftSingle(item));
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

    forEach(callback, thisArg = this) {
        let current = this.head, index = 0;
        while (current) {
            callback.call(thisArg, current.value, index++, this);
            current = current.next;
        }
    }

    forEachReverse(callback, thisArg = this) {
        let current = this.tail, index = this.length - 1;
        while (current) {
            callback.call(thisArg, current.value, index--, this);
            current = current.prev;
        }
    }

    get(index) {
        if (index < 0 || index >= this.length) return undefined;
        let current = this.head;
        for (let i = 0; i < index; i++) {
            current = current.next;
        }
        return current && current.value;
    }

    getReverse(index) {
        if (index < 0 || index >= this.length) return undefined;
        let current = this.tail;
        for (let i = 0; i < index; i++) {
            current = current.prev;
        }
        return current && current.value;
    }

    map(callback, thisArg = this) {
        const resultList = new Yallist();
        this.forEach((value, index) => resultList.push(callback.call(thisArg, value, index, this)));
        return resultList;
    }

    mapReverse(callback, thisArg = this) {
        const resultList = new Yallist();
        this.forEachReverse((value, index) => resultList.push(callback.call(thisArg, value, index, this)));
        return resultList;
    }

    reduce(callback, initialValue) {
        if (!this.head && arguments.length < 2) throw new TypeError('Reduce of empty list with no initial value');
        let accumulator = arguments.length > 1 ? initialValue : this.head.value;
        let current = arguments.length > 1 ? this.head : this.head.next;
        let index = 0;
        while (current) {
            accumulator = callback(accumulator, current.value, index++);
            current = current.next;
        }
        return accumulator;
    }

    reduceReverse(callback, initialValue) {
        if (!this.tail && arguments.length < 2) throw new TypeError('Reduce of empty list with no initial value');
        let accumulator = arguments.length > 1 ? initialValue : this.tail.value;
        let current = arguments.length > 1 ? this.tail : this.tail.prev;
        let index = this.length - 1;
        while (current) {
            accumulator = callback(accumulator, current.value, index--);
            current = current.prev;
        }
        return accumulator;
    }

    toArray() {
        const array = [];
        this.forEach(value => array.push(value));
        return array;
    }

    toArrayReverse() {
        const array = [];
        this.forEachReverse(value => array.push(value));
        return array;
    }

    slice(from = 0, to = this.length) {
        if (from < 0) from += this.length;
        if (to < 0) to += this.length;
        from = Math.max(0, from);
        to = Math.min(this.length, to);

        const newList = new Yallist();
        let current = this.head;
        for (let i = 0; i < from && current; i++) current = current.next;
        for (let i = from; i < to && current; i++, current = current.next) {
            newList.push(current.value);
        }
        return newList;
    }

    sliceReverse(from = 0, to = this.length) {
        if (from < 0) from += this.length;
        if (to < 0) to += this.length;
        from = Math.max(0, from);
        to = Math.min(this.length, to);

        const newList = new Yallist();
        let current = this.tail;
        for (let i = this.length; i > to && current; i--) current = current.prev;
        for (let i = to; i > from && current; i--, current = current.prev) {
            newList.push(current.value);
        }
        return newList;
    }

    splice(start, deleteCount = 0, ...elements) {
        if (start < 0) start = this.length + start;
        start = Math.max(0, Math.min(this.length, start));

        let current = this.head;
        for (let i = 0; i < start && current; i++) current = current.next;

        const removed = [];
        for (let i = 0; i < deleteCount && current; i++) {
            removed.push(current.value);
            current = this.removeNode(current);
        }

        for (const element of elements) {
            current = this.insertAfter(current ? current.prev : null, element);
        }

        return removed;
    }

    reverse() {
        let current = this.head;
        [this.head, this.tail] = [this.tail, this.head];
        while (current) {
            const next = current.next;
            [current.prev, current.next] = [current.next, current.prev];
            current = next;
        }
        return this;
    }

    insertAfter(node, value) {
        const newNode = new Node(value, node, node ? node.next : this.head, this);
        if (node) {
            if (node.next) node.next.prev = newNode;
            node.next = newNode;
            if (node === this.tail) this.tail = newNode;
        } else {
            this.head = newNode;
            if (!this.tail) this.tail = newNode;
        }
        this.length++;
        return newNode;
    }

    unshiftSingle(item) {
        this.head = new Node(item, null, this.head, this);
        if (this.head.next) this.head.next.prev = this.head;
        if (!this.tail) this.tail = this.head;
        this.length++;
    }
}

class Node {
    constructor(value, prev = null, next = null, list = null) {
        this.value = value;
        this.prev = prev;
        this.next = next;
        this.list = list;
    }
}

exports.Yallist = Yallist;
exports.Node = Node;
