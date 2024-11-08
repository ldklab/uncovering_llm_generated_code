'use strict';

const nodeMetadata = new WeakMap();

class Tree {
    constructor(description = 'Tree data') {
        this.symbol = Symbol(description);
    }

    setupNode(object) {
        if (!nodeMetadata.has(object)) {
            nodeMetadata.set(object, { parent: null, offspring: [] });
        }
        return object;
    }

    placeBefore(refObj, newObj) {
        this.verifyAbsence(newObj);
        const refMeta = nodeMetadata.get(refObj);
        const parentMeta = nodeMetadata.get(refMeta.parent);
        const position = parentMeta.offspring.indexOf(refObj);
        parentMeta.offspring.splice(position, 0, newObj);
        nodeMetadata.set(newObj, { parent: refMeta.parent, offspring: [] });
        return newObj;
    }

    placeAfter(refObj, newObj) {
        this.verifyAbsence(newObj);
        const refMeta = nodeMetadata.get(refObj);
        const parentMeta = nodeMetadata.get(refMeta.parent);
        const position = parentMeta.offspring.indexOf(refObj);
        parentMeta.offspring.splice(position + 1, 0, newObj);
        nodeMetadata.set(newObj, { parent: refMeta.parent, offspring: [] });
        return newObj;
    }

    addAsFirstChild(parent, newObj) {
        this.verifyAbsence(newObj);
        const parentMeta = nodeMetadata.get(parent);
        parentMeta.offspring.unshift(newObj);
        nodeMetadata.set(newObj, { parent, offspring: [] });
        return newObj;
    }

    addAsLastChild(parent, newObj) {
        this.verifyAbsence(newObj);
        const parentMeta = nodeMetadata.get(parent);
        parentMeta.offspring.push(newObj);
        nodeMetadata.set(newObj, { parent, offspring: [] });
        return newObj;
    }

    detach(object) {
        const meta = nodeMetadata.get(object);
        if (meta && meta.parent !== null) {
            const parentMeta = nodeMetadata.get(meta.parent);
            const position = parentMeta.offspring.indexOf(object);
            parentMeta.offspring.splice(position, 1);
            nodeMetadata.set(object, { parent: null, offspring: [] });
        }
        return object;
    }

    doesHaveChildren(object) {
        const meta = nodeMetadata.get(object);
        return meta && meta.offspring.length > 0;
    }

    getFirstChild(object) {
        const meta = nodeMetadata.get(object);
        return meta && meta.offspring[0];
    }

    getLastChild(object) {
        const meta = nodeMetadata.get(object);
        return meta && meta.offspring[meta.offspring.length - 1];
    }

    getPreviousSibling(object) {
        const meta = nodeMetadata.get(object);
        if (meta && meta.parent !== null) {
            const parentMeta = nodeMetadata.get(meta.parent);
            const position = parentMeta.offspring.indexOf(object);
            return parentMeta.offspring[position - 1] || null;
        }
        return null;
    }

    getNextSibling(object) {
        const meta = nodeMetadata.get(object);
        if (meta && meta.parent !== null) {
            const parentMeta = nodeMetadata.get(meta.parent);
            const position = parentMeta.offspring.indexOf(object);
            return parentMeta.offspring[position + 1] || null;
        }
        return null;
    }

    getParent(object) {
        const meta = nodeMetadata.get(object);
        return meta && meta.parent;
    }

    verifyAbsence(object) {
        if (nodeMetadata.has(object) && nodeMetadata.get(object).parent !== null) {
            throw new Error('Object is already part of a Tree');
        }
    }
}

module.exports = Tree;
