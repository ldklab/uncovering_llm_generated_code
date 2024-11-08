// fast-json-stable-stringify/index.js

function stringify(obj, opts) {
    var seen = [];
    opts = opts || {};
    var cycles = opts.cycles || false;
    var cmp = opts.cmp && (function(f) {
        return function(node) {
            return function(a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);
    
    function stringifyNode(node) {
        if (node && typeof node.toJSON === 'function') node = node.toJSON();
        
        if (node === null || node === undefined) return String(node);
        if (typeof node === 'number') return isFinite(node) ? String(node) : 'null';
        if (typeof node !== 'object') return JSON.stringify(node);
        
        if (Array.isArray(node)) {
            var out = [];
            for (var i = 0; i < node.length; i++) {
                out.push(stringifyNode(node[i]) || 'null');
            }
            return '[' + out.join(',') + ']';
        } else {
            if (seen.indexOf(node) !== -1) {
                if (cycles) return JSON.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            } else {
                seen.push(node);
            }

            var keys = Object.keys(node).sort(cmp && cmp(node));
            var out = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = stringifyNode(node[key]);

                if (value) out.push(JSON.stringify(key) + ':' + value);
            }
            seen.pop();
            return '{' + out.join(',') + '}';
        }
    }
    
    return stringifyNode(obj);
}

module.exports = stringify;

// Usage example
// var stringify = require('./index');
// var obj = { c: 8, b: [{z:6,y:5,x:4},7], a: 3 };
// console.log(stringify(obj));

// var s = stringify(obj, { cmp: function(a, b) { return a.key < b.key ? 1 : -1; } });
// console.log(s);
