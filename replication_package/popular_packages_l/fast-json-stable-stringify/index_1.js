// The `stringify` function implements a JSON stringifier that provides stable key ordering in objects.
// It can handle cycles in the object graph and provides options to customize key ordering using a comparator.

function stringify(obj, opts = {}) {
    const seen = [];
    const cycles = opts.cycles || false;
    const cmp = opts.cmp ? createComparator(opts.cmp) : null;

    // Prepares a comparator function if specified in opts
    function createComparator(f) {
        return function(node) {
            return function(a, b) {
                const aobj = { key: a, value: node[a] };
                const bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    }
    
    // Recursive function for converting node to string representation
    function stringifyNode(node) {
        if (node && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }
        
        if (node === null || node === undefined) {
            return String(node);
        }
        
        if (typeof node === 'number') {
            return isFinite(node) ? String(node) : 'null';
        }
        
        if (typeof node !== 'object') {
            return JSON.stringify(node);
        }
        
        if (Array.isArray(node)) {
            const out = node.map(item => stringifyNode(item) || 'null');
            return '[' + out.join(',') + ']';
        } else {
            if (seen.includes(node)) {
                if (cycles) {
                    return JSON.stringify('__cycle__');
                }
                throw new TypeError('Converting circular structure to JSON');
            } else {
                seen.push(node);
            }

            const keys = Object.keys(node).sort(cmp ? cmp(node) : undefined);
            const out = keys.map(key => {
                const value = stringifyNode(node[key]);
                return value ? JSON.stringify(key) + ':' + value : null;
            }).filter(x => x !== null);

            seen.pop();
            return '{' + out.join(',') + '}';
        }
    }
    
    return stringifyNode(obj);
}

module.exports = stringify;

// Usage example
// const stringify = require('./index');
// const obj = { c: 8, b: [{z:6,y:5,x:4},7], a: 3 };
// console.log(stringify(obj));

// const sortedStringified = stringify(obj, { cmp: (a, b) => a.key < b.key ? 1 : -1 });
// console.log(sortedStringified);
