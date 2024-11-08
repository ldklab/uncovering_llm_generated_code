"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.Yallist = void 0;

class Yallist {
    constructor(list = []) {
        this.tail = null;
        this.head = null;
        this.length = 0;
        for (const item of list) {
            this.push(item);
        }
    }

    static create(list = []) {
        return new Yallist(list);
    }

    *[Symbol.iterator]() {
        for (let walker = this.head; walker; walker = walker.next) {
            yield walker.value;
        }
    }

    push(...args) {
        args.forEach(arg => this._push(arg));
        return this.length;
    }

    unshift(...args) {
        args.forEach(arg => this._unshift(arg));
        return this.length;
    }

    pop() {
        if (!this.tail) return undefined;
        const value = this.tail.value;
        this.tail = this.tail.prev;
        if (this.tail) {
            this.tail.next = null;
        } else {
            this.head = null;
        }
        this.length--;
        return value;
    }

    shift() {
        if (!this.head) return undefined;
        const value = this.head.value;
        this.head = this.head.next;
        if (this.head) {
            this.head.prev = null;
        } else {
            this.tail = null;
        }
        this.length--;
        return value;
    }

    forEach(fn, thisp = this) {
        for (let walker = this.head, i = 0; walker; i++, walker = walker.next) {
            fn.call(thisp, walker.value, i, this);
        }
    }

    forEachReverse(fn, thisp = this) {
        for (let walker = this.tail, i = this.length - 1; walker; i--, walker = walker.prev) {
            fn.call(thisp, walker.value, i, this);
        }
    }

    get(n) {
        let walker = this.head;
        for (let i = 0; walker && i < n; i++) {
            walker = walker.next;
        }
        return walker ? walker.value : undefined;
    }

    getReverse(n) {
        let walker = this.tail;
        for (let i = 0; walker && i < n; i++) {
            walker = walker.prev;
        }
        return walker ? walker.value : undefined;
    }

    map(fn, thisp = this) {
        const res = new Yallist();
        for (let walker = this.head; walker; walker = walker.next) {
            res.push(fn.call(thisp, walker.value, this));
        }
        return res;
    }

    mapReverse(fn, thisp = this) {
        const res = new Yallist();
        for (let walker = this.tail; walker; walker = walker.prev) {
            res.push(fn.call(thisp, walker.value, this));
        }
        return res;
    }

    reduce(fn, initial) {
        let acc = initial;
        let walker = this.head;
        if (acc === undefined) {
            if (!walker) throw new TypeError('Reduce of empty list with no initial value');
            acc = walker.value;
            walker = walker.next;
        }
        for (let i = 0; walker; i++, walker = walker.next) {
            acc = fn(acc, walker.value, i);
        }
        return acc;
    }

    reduceReverse(fn, initial) {
        let acc = initial;
        let walker = this.tail;
        if (acc === undefined) {
            if (!walker) throw new TypeError('Reduce of empty list with no initial value');
            acc = walker.value;
            walker = walker.prev;
        }
        for (let i = this.length - 1; walker; i--, walker = walker.prev) {
            acc = fn(acc, walker.value, i);
        }
        return acc;
    }

    toArray() {
        const arr = [];
        for (let walker = this.head; walker; walker = walker.next) {
            arr.push(walker.value);
        }
        return arr;
    }

    toArrayReverse() {
        const arr = [];
        for (let walker = this.tail; walker; walker = walker.prev) {
            arr.push(walker.value);
        }
        return arr;
    }

    slice(from = 0, to = this.length) {
        if (to < 0) to += this.length;
        if (from < 0) from += this.length;
        const ret = new Yallist();
        if (to < from || to < 0) return ret;
        from = Math.max(0, from);
        to = Math.min(this.length, to);

        let walker = this.head;
        for (let i = 0; walker && i < from; i++) {
            walker = walker.next;
        }
        for (let i = from; walker && i < to; i++, walker = walker.next) {
            ret.push(walker.value);
        }
        return ret;
    }

    sliceReverse(from = 0, to = this.length) {
        if (to < 0) to += this.length;
        if (from < 0) from += this.length;
        const ret = new Yallist();
        if (to < from || to < 0) return ret;
        from = Math.max(0, from);
        to = Math.min(this.length, to);

        let walker = this.tail;
        for (let i = this.length; walker && i > to; i--) {
            walker = walker.prev;
        }
        for (let i = to; walker && i > from; i--, walker = walker.prev) {
            ret.push(walker.value);
        }
        return ret;
    }

    splice(start, deleteCount = 0, ...nodes) {
        if (start > this.length) start = this.length;
        if (start < 0) start = this.length + start;

        let walker = this.head;
        for (let i = 0; walker && i < start; i++) {
            walker = walker.next;
        }

        const ret = [];
        for (let i = 0; walker && i < deleteCount; i++) {
            ret.push(walker.value);
            walker = this._removeNode(walker);
        }

        if (!walker) walker = this.tail;

        nodes.forEach(nodeValue => {
            walker = this._insertAfter(walker, nodeValue);
        });

        return ret;
    }

    reverse() {
        [this.head, this.tail] = [this.tail, this.head];
        for (let walker = this.head; walker; walker = walker.prev) {
            [walker.prev, walker.next] = [walker.next, walker.prev];
        }
        return this;
    }

    _push(item) {
        this.tail = new Node(item, this.tail, null, this);
        if (!this.head) this.head = this.tail;
        this.length++;
    }

    _unshift(item) {
        this.head = new Node(item, null, this.head, this);
        if (!this.tail) this.tail = this.head;
        this.length++;
    }

    _removeNode(node) {
        if (!node || node.list !== this) throw new Error('removing node which does not belong to this list');

        const { next, prev } = node;
        if (prev) prev.next = next;
        if (next) next.prev = prev;
        if (node === this.head) this.head = next;
        if (node === this.tail) this.tail = prev;

        node.prev = node.next = null;
        this.length--;
        return next;
    }

    _insertAfter(node, value) {
        const inserted = new Node(value, node, node ? node.next : this.head, this);
        if (!inserted.next) {
            this.tail = inserted;
        }
        if (!inserted.prev) {
            this.head = inserted;
        }
        this.length++;
        return inserted;
    }
}

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

exports.Yallist = Yallist;
exports.Node = Node;
