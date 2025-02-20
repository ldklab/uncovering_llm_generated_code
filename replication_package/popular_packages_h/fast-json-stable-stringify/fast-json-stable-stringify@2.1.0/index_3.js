'use strict';

module.exports = function (data, opts) {
    // Default opts to an empty object if not provided
    if (!opts) opts = {};

    // If opts is a function, assume it's a comparator and wrap it in an object
    if (typeof opts === 'function') opts = { cmp: opts };

    // Determine if cycles handling is requested; default is false
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;

    // If a comparator function is provided, wrap it to compare key-value pairs
    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (aKey, bKey) {
                var aobj = { key: aKey, value: node[aKey] };
                var bobj = { key: bKey, value: node[bKey] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    // Array to keep track of previously seen nodes to detect cycles
    var seen = [];

    // Recursive stringify function
    return (function stringify(node) {
        // Handle custom toJSON method
        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        // Various type checks and conversions
        if (node === undefined) return;
        if (typeof node === 'number') return isFinite(node) ? '' + node : 'null';
        if (typeof node !== 'object') return JSON.stringify(node);
        if (node === null) return 'null';

        // Handle arrays
        if (Array.isArray(node)) {
            let out = '[';
            for (let i = 0; i < node.length; i++) {
                if (i) out += ',';
                out += stringify(node[i]) || 'null';
            }
            return out + ']';
        }

        // Handle circular references
        if (seen.indexOf(node) !== -1) {
            if (cycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }

        // Record this node in the stack to identify cycles
        var seenIndex = seen.push(node) - 1;

        // Sort the keys if a comparator is provided
        var keys = Object.keys(node).sort(cmp && cmp(node));
        let out = '';

        // Process each key-value pair
        for (let i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = stringify(node[key]);

            // Skip undefined values
            if (!value) continue;

            // Append the key-value pair to the output object
            if (out) out += ',';
            out += JSON.stringify(key) + ':' + value;
        }

        // Remove the node from the seen stack
        seen.splice(seenIndex, 1);
        return '{' + out + '}';
    })(data);
};
