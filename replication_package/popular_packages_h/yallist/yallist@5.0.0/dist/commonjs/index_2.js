"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.Yallist = void 0;

class Node {
    constructor(value, prev, next, list) {
        this.value = value;
        this.prev = prev || undefined;
        this.next = next || undefined;
        this.list = list;

        if (prev) prev.next = this;
        if (next) next.prev = this;
    }
}

class Yallist {
    constructor(list = []) {
        this.head = null;
        this.tail = null;
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

    removeNode(node) {
        if (node.list !== this) {
            throw new Error('removing node which does not belong to this list');
        }

        const { next, prev } = node;

        if (next) next.prev = prev;
        if (prev) prev.next = next;
        
        if (node === this.head) this.head = next;
        if (node === this.tail) this.tail = prev;
        
        this.length--;
        
        node.list = node.next = node.prev = undefined;
        
        return next;
    }

    unshiftNode(node) {
        if (node.list) node.list.removeNode(node);

        node.next = this.head;
        node.prev = undefined;
        node.list = this;
        
        if (this.head) this.head.prev = node;
        if (!this.tail) this.tail = node;
        
        this.head = node;
        this.length++;
    }

    pushNode(node) {
        if (node.list) node.list.removeNode(node);

        node.prev = this.tail;
        node.next = undefined;
        node.list = this;

        if (this.tail) this.tail.next = node;
        if (!this.head) this.head = node;

        this.tail = node;
        this.length++;
    }

    push(...args) {
        for (const item of args) push(this, item);
        return this.length;
    }

    unshift(...args) {
        for (const item of args) unshift(this, item);
        return this.length;
    }

    pop() {
        if (!this.tail) return undefined;

        const res = this.tail.value;
        this.tail = this.tail.prev;

        if (this.tail) this.tail.next = undefined;
        else this.head = undefined;

        this.length--;
        return res;
    }

    shift() {
        if (!this.head) return undefined;

        const res = this.head.value;
        this.head = this.head.next;

        if (this.head) this.head.prev = undefined;
        else this.tail = undefined;

        this.length--;
        return res;
    }

    forEach(fn, thisp = this) {
        for (let walker = this.head, i = 0; !!walker; i++) {
            fn.call(thisp, walker.value, i, this);
            walker = walker.next;
        }
    }

    forEachReverse(fn, thisp = this) {
        for (let walker = this.tail, i = this.length - 1; !!walker; i--) {
            fn.call(thisp, walker.value, i, this);
            walker = walker.prev;
        }
    }

    get(n) {
        let i = 0;
        let walker = this.head;

        while (walker && i < n) {
            walker = walker.next;
            i++;
        }

        return walker ? walker.value : undefined;
    }

    getReverse(n) {
        let i = 0;
        let walker = this.tail;

        while (walker && i < n) {
            walker = walker.prev;
            i++;
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
        let acc, walker = this.head;
        
        if (arguments.length > 1) {
            acc = initial;
        } else if (this.head) {
            acc = this.head.value;
            walker = this.head.next;
        } else {
            throw new TypeError('Reduce of empty list with no initial value');
        }
        
        for (let i = 0; walker; i++) {
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
            acc = this.tail.value;
            walker = this.tail.prev;
        } else {
            throw new TypeError('Reduce of empty list with no initial value');
        }

        for (let i = this.length - 1; walker; i--) {
            acc = fn(acc, walker.value, i);
            walker = walker.prev;
        }

        return acc;
    }

    toArray() {
        const arr = new Array(this.length);
        let i = 0;
        for (let walker = this.head; walker; walker = walker.next) {
            arr[i++] = walker.value;
        }
        return arr;
    }

    toArrayReverse() {
        const arr = new Array(this.length);
        let i = 0;
        for (let walker = this.tail; walker; walker = walker.prev) {
            arr[i++] = walker.value;
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

        let walker = this.head;
        for (let i = 0; walker && i < from; i++) walker = walker.next;
        for (; walker && i < to; i++, walker = walker.next) ret.push(walker.value);

        return ret;
    }

    sliceReverse(from = 0, to = this.length) {
        if (to < 0) to += this.length;
        if (from < 0) from += this.length;

        const ret = new Yallist();
        if (to < from || to < 0) return ret;
        if (from < 0) from = 0;
        if (to > this.length) to = this.length;

        let walker = this.tail;
        for (let i = this.length; walker && i > to; i--) walker = walker.prev;
        for (; walker && i > from; i--, walker = walker.prev) ret.push(walker.value);

        return ret;
    }

    splice(start, deleteCount = 0, ...nodes) {
        if (start > this.length) start = this.length - 1;
        if (start < 0) start = this.length + start;

        let walker = this.head;
        for (let i = 0; walker && i < start; i++) walker = walker.next;
        
        const ret = [];
        for (let i = 0; walker && i < deleteCount; i++) {
            ret.push(walker.value);
            walker = this.removeNode(walker);
        }

        if (!walker) walker = this.tail;
        else if (walker !== this.tail) walker = walker.prev;

        for (const v of nodes) walker = insertAfter(this, walker, v);
        
        return ret;
    }

    reverse() {
        const head = this.head;
        const tail = this.tail;

        for (let walker = this.head; walker; walker = walker.prev) {
            const p = walker.prev;
            walker.prev = walker.next;
            walker.next = p;
        }

        this.head = tail;
        this.tail = head;

        return this;
    }
}

function insertAfter(self, node, value) {
    const inserted = new Node(value, node, node ? node.next : self.head, self);

    if (!inserted.next) self.tail = inserted;
    if (!inserted.prev) self.head = inserted;

    self.length++;
    return inserted;
}

function push(self, item) {
    self.tail = new Node(item, self.tail, undefined, self);
    if (!self.head) self.head = self.tail;
    self.length++;
}

function unshift(self, item) {
    self.head = new Node(item, undefined, self.head, self);
    if (!self.tail) self.tail = self.head;
    self.length++;
}

exports.Yallist = Yallist;
exports.Node = Node;
