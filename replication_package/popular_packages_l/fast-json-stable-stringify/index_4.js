// fast-json-stable-stringify/index.js

function stringify(obj, opts = {}) {
    const seen = [];
    const cycles = opts.cycles || false;
    const cmp = opts.cmp && ((f) => (node) => (a, b) => {
        const aObj = { key: a, value: node[a] },
              bObj = { key: b, value: node[b] };
        return f(aObj, bObj);
    })(opts.cmp);
    
    function stringifyNode(node) {
        if (node && typeof node.toJSON === 'function') node = node.toJSON();

        switch (typeof node) {
            case 'undefined':
                return String(node);
            case 'number':
                return isFinite(node) ? String(node) : 'null';
            case 'string':
            case 'boolean':
                return JSON.stringify(node);
            case 'object':
                if (node === null) return 'null';
                
                if (Array.isArray(node)) {
                    return '[' + node.map(n => stringifyNode(n) || 'null').join(',') + ']';
                }
                
                if (seen.includes(node)) {
                    if (cycles) return JSON.stringify('__cycle__');
                    throw new TypeError('Converting circular structure to JSON');
                }

                seen.push(node);
                const keys = Object.keys(node).sort(cmp && cmp(node));
                const result = keys.map(key => {
                    const value = stringifyNode(node[key]);
                    return value ? JSON.stringify(key) + ':' + value : '';
                }).filter(Boolean);

                seen.pop();
                return '{' + result.join(',') + '}';
        }
    }
    
    return stringifyNode(obj);
}

module.exports = stringify;

// Usage example
// const stringify = require('./index');
// const obj = { c: 8, b: [{z:6,y:5,x:4},7], a: 3 };
// console.log(stringify(obj));

// const s = stringify(obj, { cmp: (a, b) => (a.key < b.key ? 1 : -1) });
// console.log(s);
