'use strict';

const nodeDataMap = new WeakMap();

class SymbolTree {
    constructor(description = 'SymbolTree data') {
        this.symbol = Symbol(description);
    }

    initialize(object) {
        if (!nodeDataMap.has(object)) {
            nodeDataMap.set(object, { parent: null, children: [] });
        }
        return object;
    }

    insertBefore(referenceNode, newNode) {
        this._ensureNotExists(newNode);
        const refData = nodeDataMap.get(referenceNode);
        const parentData = nodeDataMap.get(refData.parent);
        const index = parentData.children.indexOf(referenceNode);
        parentData.children.splice(index, 0, newNode);
        nodeDataMap.set(newNode, { parent: refData.parent, children: [] });
        return newNode;
    }

    insertAfter(referenceNode, newNode) {
        this._ensureNotExists(newNode);
        const refData = nodeDataMap.get(referenceNode);
        const parentData = nodeDataMap.get(refData.parent);
        const index = parentData.children.indexOf(referenceNode);
        parentData.children.splice(index + 1, 0, newNode);
        nodeDataMap.set(newNode, { parent: refData.parent, children: [] });
        return newNode;
    }

    prependChild(parentNode, newNode) {
        this._ensureNotExists(newNode);
        const parentData = nodeDataMap.get(parentNode);
        parentData.children.unshift(newNode);
        nodeDataMap.set(newNode, { parent: parentNode, children: [] });
        return newNode;
    }

    appendChild(parentNode, newNode) {
        this._ensureNotExists(newNode);
        const parentData = nodeDataMap.get(parentNode);
        parentData.children.push(newNode);
        nodeDataMap.set(newNode, { parent: parentNode, children: [] });
        return newNode;
    }

    remove(node) {
        const nodeData = nodeDataMap.get(node);
        if (nodeData && nodeData.parent !== null) {
            const parentData = nodeDataMap.get(nodeData.parent);
            const index = parentData.children.indexOf(node);
            parentData.children.splice(index, 1);
            nodeDataMap.set(node, { parent: null, children: [] });
        }
        return node;
    }

    hasChildren(node) {
        const nodeData = nodeDataMap.get(node);
        return nodeData && nodeData.children.length > 0;
    }

    firstChild(node) {
        const nodeData = nodeDataMap.get(node);
        return nodeData && nodeData.children[0];
    }

    lastChild(node) {
        const nodeData = nodeDataMap.get(node);
        return nodeData && nodeData.children[nodeData.children.length - 1];
    }

    previousSibling(node) {
        const nodeData = nodeDataMap.get(node);
        if (nodeData && nodeData.parent !== null) {
            const parentData = nodeDataMap.get(nodeData.parent);
            const index = parentData.children.indexOf(node);
            return parentData.children[index - 1] || null;
        }
        return null;
    }

    nextSibling(node) {
        const nodeData = nodeDataMap.get(node);
        if (nodeData && nodeData.parent !== null) {
            const parentData = nodeDataMap.get(nodeData.parent);
            const index = parentData.children.indexOf(node);
            return parentData.children[index + 1] || null;
        }
        return null;
    }

    parent(node) {
        const nodeData = nodeDataMap.get(node);
        return nodeData && nodeData.parent;
    }

    _ensureNotExists(node) {
        if (nodeDataMap.has(node) && nodeDataMap.get(node).parent !== null) {
            throw new Error('Node is already a part of another SymbolTree');
        }
    }
}

module.exports = SymbolTree;
