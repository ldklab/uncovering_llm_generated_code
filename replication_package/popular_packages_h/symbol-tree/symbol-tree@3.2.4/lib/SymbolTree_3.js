'use strict';

/**
 * @module symbol-tree
 * @description This module manages a tree structure where each node retains relationships to its parent, children, and siblings.
 * The SymbolTree class provides methods to manipulate and traverse these relationships efficiently.
 */

const SymbolTreeNode = require('./SymbolTreeNode');
const TreePosition = require('./TreePosition');
const TreeIterator = require('./TreeIterator');

class SymbolTree {

    /**
     * @constructor
     * @param {string} [description='SymbolTree data'] Description for the Symbol
     */
    constructor(description) {
        this.symbol = Symbol(description || 'SymbolTree data');
    }

    initialize(object) {
        this._node(object);
        return object;
    }

    _node(object) {
        if (!object) return null;
        if (!object[this.symbol]) {
            object[this.symbol] = new SymbolTreeNode();
        }
        return object[this.symbol];
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
        let lastChild;
        let current = object;
        while ((lastChild = this._node(current).lastChild)) {
            current = lastChild;
        }
        return current;
    }

    preceding(object, options) {
        const treeRoot = options?.root;

        if (object === treeRoot) return null;

        const previousSibling = this._node(object).previousSibling;
        return previousSibling ? this.lastInclusiveDescendant(previousSibling) : this._node(object).parent;
    }

    following(object, options) {
        const treeRoot = options?.root;
        const skipChildren = options?.skipChildren;

        const firstChild = !skipChildren && this._node(object).firstChild;
        if (firstChild) return firstChild;

        let current = object;
        while (current) {
            if (current === treeRoot) return null;
            const nextSibling = this._node(current).nextSibling;
            if (nextSibling) return nextSibling;
            current = this._node(current).parent;
        }
        return null;
    }

    childrenToArray(parent, options = {}) {
        const array = options.array || [];
        const filter = options.filter || (() => true);
        const thisArg = options.thisArg;

        let object = this._node(parent).firstChild;
        let index = 0;
        while (object) {
            const node = this._node(object);
            node.setCachedIndex(this._node(parent), index);
            if (filter.call(thisArg, object)) {
                array.push(object);
            }
            object = node.nextSibling;
            index++;
        }
        return array;
    }

    ancestorsToArray(object, options = {}) {
        const array = options.array || [];
        const filter = options.filter || (() => true);
        const thisArg = options.thisArg;

        let ancestor = object;
        while (ancestor) {
            if (filter.call(thisArg, ancestor)) {
                array.push(ancestor);
            }
            ancestor = this._node(ancestor).parent;
        }
        return array;
    }

    treeToArray(root, options = {}) {
        const array = options.array || [];
        const filter = options.filter || (() => true);
        const thisArg = options.thisArg;

        let object = root;
        while (object) {
            if (filter.call(thisArg, object)) {
                array.push(object);
            }
            object = this.following(object, { root });
        }
        return array;
    }

    childrenIterator(parent, options = {}) {
        const reverse = options.reverse;
        const parentNode = this._node(parent);

        return new TreeIterator(this, parent,
            reverse ? parentNode.lastChild : parentNode.firstChild,
            reverse ? TreeIterator.PREV : TreeIterator.NEXT);
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
        const reverse = options.reverse;
        return new TreeIterator(this, root,
            reverse ? this.lastInclusiveDescendant(root) : root,
            reverse ? TreeIterator.PRECEDING : TreeIterator.FOLLOWING);
    }

    index(child) {
        const childNode = this._node(child);
        const parentNode = this._node(childNode.parent);

        if (!parentNode) return -1;

        let currentIndex = childNode.getCachedIndex(parentNode);

        if (currentIndex >= 0) return currentIndex;

        currentIndex = 0;
        let object = parentNode.firstChild;

        if (parentNode.childIndexCachedUpTo) {
            const cachedUpToNode = this._node(parentNode.childIndexCachedUpTo);
            object = cachedUpToNode.nextSibling;
            currentIndex = cachedUpToNode.getCachedIndex(parentNode) + 1;
        }

        while (object) {
            const node = this._node(object);
            node.setCachedIndex(parentNode, currentIndex);
            if (object === child) break;
            currentIndex++;
            object = node.nextSibling;
        }

        parentNode.childIndexCachedUpTo = child;
        return currentIndex;
    }

    childrenCount(parent) {
        const parentNode = this._node(parent);
        if (!parentNode.lastChild) return 0;
        return this.index(parentNode.lastChild) + 1;
    }

    compareTreePosition(left, right) {
        if (left === right) return 0;

        const leftAncestors = [];
        let leftAncestor = left;

        while (leftAncestor) {
            if (leftAncestor === right) return TreePosition.CONTAINS | TreePosition.PRECEDING;
            leftAncestors.push(leftAncestor);
            leftAncestor = this.parent(leftAncestor);
        }

        const rightAncestors = [];
        let rightAncestor = right;

        while (rightAncestor) {
            if (rightAncestor === left) return TreePosition.CONTAINED_BY | TreePosition.FOLLOWING;
            rightAncestors.push(rightAncestor);
            rightAncestor = this.parent(rightAncestor);
        }

        const root = leftAncestors[leftAncestors.length - 1];

        if (!root || root !== rightAncestors[rightAncestors.length - 1]) return TreePosition.DISCONNECTED;

        let commonAncestorIndex = 0;
        const minLength = Math.min(leftAncestors.length, rightAncestors.length);

        for (let i = 0; i < minLength; ++i) {
            if (leftAncestors[leftAncestors.length - 1 - i] !== rightAncestors[rightAncestors.length - 1 - i]) break;
            commonAncestorIndex = i;
        }

        const leftIndex = this.index(leftAncestors[leftAncestors.length - 2 - commonAncestorIndex]);
        const rightIndex = this.index(rightAncestors[rightAncestors.length - 2 - commonAncestorIndex]);

        return rightIndex < leftIndex ? TreePosition.PRECEDING : TreePosition.FOLLOWING;
    }

    remove(removeObject) {
        const removeNode = this._node(removeObject);
        const parentNode = this._node(removeNode.parent);
        const prevNode = this._node(removeNode.previousSibling);
        const nextNode = this._node(removeNode.nextSibling);

        if (parentNode) {
            if (parentNode.firstChild === removeObject) {
                parentNode.firstChild = removeNode.nextSibling;
            }
            if (parentNode.lastChild === removeObject) {
                parentNode.lastChild = removeNode.previousSibling;
            }
        }

        if (prevNode) prevNode.nextSibling = removeNode.nextSibling;
        if (nextNode) nextNode.previousSibling = removeNode.previousSibling;

        removeNode.parent = removeNode.previousSibling = removeNode.nextSibling = null;
        removeNode.cachedIndex = -1;
        removeNode.cachedIndexVersion = NaN;

        if (parentNode) parentNode.childrenChanged();

        return removeObject;
    }

    insertBefore(referenceObject, newObject) {
        const referenceNode = this._node(referenceObject);
        const prevNode = this._node(referenceNode.previousSibling);
        const newNode = this._node(newObject);
        const parentNode = this._node(referenceNode.parent);

        if (newNode.isAttached) throw Error('Given object is already present in this SymbolTree, remove it first');

        newNode.parent = referenceNode.parent;
        newNode.previousSibling = referenceNode.previousSibling;
        newNode.nextSibling = referenceObject;
        referenceNode.previousSibling = newObject;

        if (prevNode) prevNode.nextSibling = newObject;
        if (parentNode && parentNode.firstChild === referenceObject) parentNode.firstChild = newObject;
        if (parentNode) parentNode.childrenChanged();

        return newObject;
    }

    insertAfter(referenceObject, newObject) {
        const referenceNode = this._node(referenceObject);
        const nextNode = this._node(referenceNode.nextSibling);
        const newNode = this._node(newObject);
        const parentNode = this._node(referenceNode.parent);

        if (newNode.isAttached) throw Error('Given object is already present in this SymbolTree, remove it first');

        newNode.parent = referenceNode.parent;
        newNode.previousSibling = referenceObject;
        newNode.nextSibling = referenceNode.nextSibling;
        referenceNode.nextSibling = newObject;

        if (nextNode) nextNode.previousSibling = newObject;
        if (parentNode && parentNode.lastChild === referenceObject) parentNode.lastChild = newObject;
        if (parentNode) parentNode.childrenChanged();

        return newObject;
    }

    prependChild(referenceObject, newObject) {
        const referenceNode = this._node(referenceObject);
        const newNode = this._node(newObject);

        if (newNode.isAttached) throw Error('Given object is already present in this SymbolTree, remove it first');

        if (referenceNode.hasChildren) {
            this.insertBefore(referenceNode.firstChild, newObject);
        } else {
            newNode.parent = referenceObject;
            referenceNode.firstChild = referenceNode.lastChild = newObject;
            referenceNode.childrenChanged();
        }

        return newObject;
    }

    appendChild(referenceObject, newObject) {
        const referenceNode = this._node(referenceObject);
        const newNode = this._node(newObject);

        if (newNode.isAttached) throw Error('Given object is already present in this SymbolTree, remove it first');

        if (referenceNode.hasChildren) {
            this.insertAfter(referenceNode.lastChild, newObject);
        } else {
            newNode.parent = referenceObject;
            referenceNode.firstChild = referenceNode.lastChild = newObject;
            referenceNode.childrenChanged();
        }

        return newObject;
    }
}

module.exports = SymbolTree;
SymbolTree.TreePosition = TreePosition;
