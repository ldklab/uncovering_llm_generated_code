module.exports = function (obj, opts = {}) {
    const { space = '', cycles = false, replacer = (key, value) => value } = opts;
    const cmp = opts.cmp ? createComparator(opts.cmp) : null;
    let seen = [];
    
    return (function stringify(parent, key, node, level) {
        const indent = space ? `\n${' '.repeat(level * space)}` : '';
        const colonSeparator = space ? ': ' : ':';

        if (node?.toJSON) node = node.toJSON();
        node = replacer.call(parent, key, node);
        if (node === undefined) return;

        if (typeof node !== 'object' || node === null) 
            return JSON.stringify(node);

        if (Array.isArray(node)) {
            const out = node.map((item, i) => (stringify(node, i, item, level + 1)) || JSON.stringify(null));
            return `[${out.map(item => indent + space + item).join(',')}${indent}]`;
        }

        if (seen.includes(node)) {
            if (cycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }
        seen.push(node);

        const keys = Object.keys(node).sort(cmp && cmp(node));
        const out = keys.map(key => {
            const value = stringify(node, key, node[key], level + 1);
            if (!value) return;
            return `${JSON.stringify(key)}${colonSeparator}${value}`;
        }).filter(Boolean);
        
        seen = seen.filter(seenNode => seenNode !== node);
        return `{${out.map(str => indent + space + str).join(',')}${indent}}`;
    })({ '': obj }, '', obj, 0);

    function createComparator(f) {
        return function (node) {
            return function (a, b) {
                const aobj = { key: a, value: node[a] };
                const bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    }
};
