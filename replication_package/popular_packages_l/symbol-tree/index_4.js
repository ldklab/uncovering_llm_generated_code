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

    insertBefore(referenceObject, newObject) {
        this._ensureNotInTree(newObject);
        const refData = nodeDataMap.get(referenceObject);
        const parentData = nodeDataMap.get(refData.parent);
        const index = parentData.children.indexOf(referenceObject);
        parentData.children.splice(index, 0, newObject);
        nodeDataMap.set(newObject, { parent: refData.parent, children: [] });
        return newObject;
    }

    insertAfter(referenceObject, newObject) {
        this._ensureNotInTree(newObject);
        const refData = nodeDataMap.get(referenceObject);
        const parentData = nodeDataMap.get(refData.parent);
        const index = parentData.children.indexOf(referenceObject);
        parentData.children.splice(index + 1, 0, newObject);
        nodeDataMap.set(newObject, { parent: refData.parent, children: [] });
        return newObject;
    }

    prependChild(parent, newObject) {
        this._ensureNotInTree(newObject);
        const parentData = nodeDataMap.get(parent);
        parentData.children.unshift(newObject);
        nodeDataMap.set(newObject, { parent, children: [] });
        return newObject;
    }

    appendChild(parent, newObject) {
        this._ensureNotInTree(newObject);
        const parentData = nodeDataMap.get(parent);
        parentData.children.push(newObject);
        nodeDataMap.set(newObject, { parent, children: [] });
        return newObject;
    }

    remove(object) {
        const data = nodeDataMap.get(object);
        if (data && data.parent !== null) {
            const parentData = nodeDataMap.get(data.parent);
            const index = parentData.children.indexOf(object);
            parentData.children.splice(index, 1);
            nodeDataMap.set(object, { parent: null, children: [] });
        }
        return object;
    }

    hasChildren(object) {
        const data = nodeDataMap.get(object);
        return data && data.children.length > 0;
    }

    firstChild(object) {
        const data = nodeDataMap.get(object);
        return data ? data.children[0] : undefined;
    }

    lastChild(object) {
        const data = nodeDataMap.get(object);
        return data ? data.children[data.children.length - 1] : undefined;
    }

    previousSibling(object) {
        const data = nodeDataMap.get(object);
        if (data && data.parent !== null) {
            const parentData = nodeDataMap.get(data.parent);
            const index = parentData.children.indexOf(object);
            return index > 0 ? parentData.children[index - 1] : null;
        }
        return null;
    }

    nextSibling(object) {
        const data = nodeDataMap.get(object);
        if (data && data.parent !== null) {
            const parentData = nodeDataMap.get(data.parent);
            const index = parentData.children.indexOf(object);
            return index < parentData.children.length - 1 ? parentData.children[index + 1] : null;
        }
        return null;
    }

    parent(object) {
        const data = nodeDataMap.get(object);
        return data ? data.parent : null;
    }

    _ensureNotInTree(object) {
        if (nodeDataMap.has(object) && nodeDataMap.get(object).parent !== null) {
            throw new Error('Object is already in a SymbolTree');
        }
    }
}

module.exports = SymbolTree;
