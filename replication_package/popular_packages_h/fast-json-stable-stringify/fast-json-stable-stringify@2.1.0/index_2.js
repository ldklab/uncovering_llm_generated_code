'use strict';

module.exports = function (data, options = {}) {
    // Normalize options
    if (typeof options === 'function') options = { cmp: options };
    const handleCycles = typeof options.cycles === 'boolean' ? options.cycles : false;

    const comparator = options.cmp && createComparator(options.cmp);

    const visitedNodes = [];
    
    return stringify(data);

    function createComparator(compareFunction) {
        return function (node) {
            return function (keyA, keyB) {
                const objectA = { key: keyA, value: node[keyA] };
                const objectB = { key: keyB, value: node[keyB] };
                return compareFunction(objectA, objectB);
            };
        };
    }

    function stringify(node) {
        // Handle toJSON method if present
        if (node && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        // Handle different data types
        if (node === undefined) return;
        if (typeof node === 'number') return isFinite(node) ? String(node) : 'null';
        if (typeof node !== 'object') return JSON.stringify(node);

        // Handle arrays
        if (Array.isArray(node)) {
            let result = '[';
            for (let i = 0; i < node.length; i++) {
                if (i) result += ',';
                result += stringify(node[i]) || 'null';
            }
            return result + ']';
        }

        // Handle null objects
        if (node === null) return 'null';

        // Handle circular references
        if (visitedNodes.includes(node)) {
            if (handleCycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }

        const currentNodeIndex = visitedNodes.push(node) - 1;
        const keys = Object.keys(node).sort(comparator && comparator(node));
        let stringifiedObject = '';
        
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = stringify(node[key]);
            if (!value) continue;
            if (stringifiedObject) stringifiedObject += ',';
            stringifiedObject += JSON.stringify(key) + ':' + value;
        }
        
        visitedNodes.splice(currentNodeIndex, 1);
        return '{' + stringifiedObject + '}';
    }
};
