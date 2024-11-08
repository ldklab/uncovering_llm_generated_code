'use strict';

module.exports = function (data, options = {}) {
    // Set options for comparison if options is a function
    if (typeof options === 'function') {
        options = { cmp: options };
    }

    const allowCycles = typeof options.cycles === 'boolean' ? options.cycles : false;

    let comparator = options.cmp && ((cmpFunction) => {
        return (node) => (a, b) => {
            const objA = { key: a, value: node[a] };
            const objB = { key: b, value: node[b] };
            return cmpFunction(objA, objB);
        };
    })(options.cmp);

    const seenNodes = [];

    function stringify(node) {
        // Use toJSON method if it exists
        if (node && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        // Handle different data types
        if (node === undefined) return;
        if (typeof node === 'number') return isFinite(node) ? String(node) : 'null';
        if (typeof node !== 'object') return JSON.stringify(node);

        // Handle arrays
        if (Array.isArray(node)) {
            let arrayResult = node.map(item => stringify(item) || 'null');
            return `[${arrayResult.join(',')}]`;
        }

        if (node === null) return 'null';

        // Check for cycles
        if (seenNodes.includes(node)) {
            if (allowCycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }

        seenNodes.push(node);
        const keys = Object.keys(node).sort(comparator && comparator(node));
        let objectResult = keys.reduce((result, key) => {
            const value = stringify(node[key]);
            if (value) {
                return result ? `${result},${JSON.stringify(key)}:${value}` : `${JSON.stringify(key)}:${value}`;
            }
            return result;
        }, '');

        seenNodes.pop();
        return `{${objectResult}}`;
    }

    return stringify(data);
};
