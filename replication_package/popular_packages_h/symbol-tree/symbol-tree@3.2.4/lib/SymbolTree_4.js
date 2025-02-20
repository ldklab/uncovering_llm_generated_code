'use strict';

const SymbolTreeNode = require('./SymbolTreeNode');
const TreePosition = require('./TreePosition');
const TreeIterator = require('./TreeIterator');

function returnTrue() {
    return true;
}

class SymbolTree {
    constructor(description) {
        this.symbol = Symbol(description || 'SymbolTree data');
    }

    initialize(object) {
        this._node(object);
        return object;
    }

    _node(object) {
        if (!object) return null;
        let node = object[this.symbol];
        if (!node) object[this.symbol] = node = new SymbolTreeNode();
        return node;
    }

    hasChildren(object) {
        return this._node(object).hasChildren;
    }

    firstChild(object) {
        return this._node(object).firstChild;
    }

    lastChild(object) {
        return this._node(object).lastChild;
    }

    previousSibling(object) {
        return this._node(object).previousSibling;
    }

    nextSibling(object) {
        return this._node(object).nextSibling;
    }

    parent(object) {
        return this._node(object).parent;
    }

    lastInclusiveDescendant(object) {
        let node;
        while (node = this._node(object).lastChild) {
            object = node;
        }
        return object;
    }

    preceding(object, options = {}) {
        const { root } = options;
        if (object === root) return null;
        const previousSibling = this._node(object).previousSibling;
        if (previousSibling) return this.lastInclusiveDescendant(previousSibling);
        return this._node(object).parent;
    }

    following(object, options = {}) {
        const { root, skipChildren } = options;
        const firstChild = !skipChildren && this._node(object).firstChild;
        if (firstChild) return firstChild;
        let current = object;
        while (current && current !== root) {
            const nextSibling = this._node(current).nextSibling;
            if (nextSibling) return nextSibling;
            current = this._node(current).parent;
        }
        return null;
    }

    childrenToArray(parent, options = {}) {
        const { array = [], filter = returnTrue, thisArg } = options;
        let object = this._node(parent).firstChild;
        while (object) {
            const node = this._node(object);
            if (filter.call(thisArg, object)) array.push(object);
            object = node.nextSibling;
        }
        return array;
    }

    ancestorsToArray(object, options = {}) {
        const { array = [], filter = returnTrue, thisArg } = options;
        while (object) {
            if (filter.call(thisArg, object)) array.push(object);
            object = this._node(object).parent;
        }
        return array;
    }

    treeToArray(root, options = {}) {
        const { array = [], filter = returnTrue, thisArg } = options;
        let object = root;
        while (object) {
            if (filter.call(thisArg, object)) array.push(object);
            object = this.following(object, { root });
        }
        return array;
    }

    childrenIterator(parent, options = {}) {
        const reverse = options.reverse || false;
        const parentNode = this._node(parent);
        return new TreeIterator(this, parent, reverse ? parentNode.lastChild : parentNode.firstChild, reverse ? TreeIterator.PREV : TreeIterator.NEXT);
    }

    previousSiblingsIterator(object) {
        return new TreeIterator(this, object, this._node(object).previousSibling, TreeIterator.PREV);
    }

    nextSiblingsIterator(object) {
        return new TreeIterator(this, object, this._node(object).nextSibling, TreeIterator.NEXT);
    }

    ancestorsIterator(object) {
        return new TreeIterator(this, object, object, TreeIterator.PARENT);
    }

    treeIterator(root, options = {}) {
        const reverse = options.reverse || false;
        return new TreeIterator(this, root, reverse ? this.lastInclusiveDescendant(root) : root, reverse ? TreeIterator.PRECEDING : TreeIterator.FOLLOWING);
    }

    index(child) {
        const childNode = this._node(child);
        const parentNode = this._node(childNode.parent);
        if (!parentNode) return -1;
        let currentNode = parentNode.firstChild;
        let index = 0;
        while (currentNode !== child) {
            currentNode = this._node(currentNode).nextSibling;
            index++;
        }
        return index;
    }

    childrenCount(parent) {
        const parentNode = this._node(parent);
        return parentNode.lastChild ? this.index(parentNode.lastChild) + 1 : 0;
    }

    compareTreePosition(left, right) {
        if (left === right) return 0;
        const leftAncestors = [];
        for (let current = left; current; current = this.parent(current)) {
            if (current === right) return TreePosition.CONTAINS | TreePosition.PRECEDING;
            leftAncestors.push(current);
        }
        const rightAncestors = [];
        for (let current = right; current; current = this.parent(current)) {
            if (current === left) return TreePosition.CONTAINED_BY | TreePosition.FOLLOWING;
            rightAncestors.push(current);
        }
        if (!leftAncestors.length || !rightAncestors.length || leftAncestors[leftAncestors.length - 1] !== rightAncestors[rightAncestors.length - 1]) return TreePosition.DISCONNECTED;
        let sharedAncestorDepth = 0;
        const minLength = Math.min(leftAncestors.length, rightAncestors.length);
        for (let i = 0; i < minLength; i++) {
            if (leftAncestors[i] !== rightAncestors[i]) break;
            sharedAncestorDepth = i;
        }
        const leftIndex = this.index(leftAncestors[sharedAncestorDepth + 1]);
        const rightIndex = this.index(rightAncestors[sharedAncestorDepth + 1]);
        return leftIndex < rightIndex ? TreePosition.PRECEDING : TreePosition.FOLLOWING;
    }

    remove(object) {
        const node = this._node(object);
        const prevNode = this._node(node.previousSibling);
        const nextNode = this._node(node.nextSibling);
        const parentNode = this._node(node.parent);
        if (prevNode) prevNode.nextSibling = node.nextSibling;
        if (nextNode) nextNode.previousSibling = node.previousSibling;
        if (parentNode) {
            if (parentNode.firstChild === object) parentNode.firstChild = node.nextSibling;
            if (parentNode.lastChild === object) parentNode.lastChild = node.previousSibling;
            parentNode.childrenChanged();
        }
        node.parent = node.previousSibling = node.nextSibling = null;
        node.cachedIndex = -1;
        return object;
    }

    insertBefore(reference, newObject) {
        const refNode = this._node(reference);
        const prevNode = this._node(refNode.previousSibling);
        const newNode = this._node(newObject);
        if (newNode.isAttached) throw new Error('Object already in tree.');
        newNode.parent = refNode.parent;
        newNode.previousSibling = refNode.previousSibling;
        newNode.nextSibling = reference;
        refNode.previousSibling = newObject;
        if (prevNode) prevNode.nextSibling = newObject;
        if (this._node(refNode.parent).firstChild === reference) refNode.parent.firstChild = newObject;
        this._node(refNode.parent).childrenChanged();
        return newObject;
    }

    insertAfter(reference, newObject) {
        const refNode = this._node(reference);
        const nextNode = this._node(refNode.nextSibling);
        const newNode = this._node(newObject);
        if (newNode.isAttached) throw new Error('Object already in tree.');
        newNode.parent = refNode.parent;
        newNode.previousSibling = reference;
        newNode.nextSibling = refNode.nextSibling;
        refNode.nextSibling = newObject;
        if (nextNode) nextNode.previousSibling = newObject;
        if (this._node(refNode.parent).lastChild === reference) refNode.parent.lastChild = newObject;
        this._node(refNode.parent).childrenChanged();
        return newObject;
    }

    prependChild(parent, newObject) {
        if (this._node(parent).hasChildren) {
            this.insertBefore(this._node(parent).firstChild, newObject);
        } else {
            const newNode = this._node(newObject);
            newNode.parent = parent;
            this._node(parent).firstChild = newObject;
            this._node(parent).lastChild = newObject;
            this._node(parent).childrenChanged();
        }
        return newObject;
    }

    appendChild(parent, newObject) {
        if (this._node(parent).hasChildren) {
            this.insertAfter(this._node(parent).lastChild, newObject);
        } else {
            const newNode = this._node(newObject);
            newNode.parent = parent;
            this._node(parent).firstChild = newObject;
            this._node(parent).lastChild = newObject;
            this._node(parent).childrenChanged();
        }
        return newObject;
    }
}

module.exports = SymbolTree;
SymbolTree.TreePosition = TreePosition;
