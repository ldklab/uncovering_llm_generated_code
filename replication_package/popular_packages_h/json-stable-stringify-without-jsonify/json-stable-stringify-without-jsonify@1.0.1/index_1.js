module.exports = function (obj, opts = {}) {
    if (typeof opts === 'function') opts = { cmp: opts };
    let space = typeof opts.space === 'number' ? ' '.repeat(opts.space) : (opts.space || '');
    let cycles = typeof opts.cycles === 'boolean' ? opts.cycles : false;
    let replacer = opts.replacer || ((key, value) => value);

    let cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                return f({ key: a, value: node[a] }, { key: b, value: node[b] });
            };
        };
    })(opts.cmp);

    let seen = [];
    return (function stringify(parent, key, node, level) {
        let indent = space ? (`\n${space.repeat(level)}`) : '';
        let colonSeparator = space ? ': ' : ':';

        if (node && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        node = replacer.call(parent, key, node);

        if (node === undefined) return;
        if (typeof node !== 'object' || node === null) return JSON.stringify(node);

        if (Array.isArray(node)) {
            let out = node.map((item, i) => {
                let value = stringify(node, i, item, level + 1);
                return (indent + space + (value || JSON.stringify(null)));
            });
            return `[${out.join(',')}${indent}]`;
        } else {
            if (seen.includes(node)) {
                if (cycles) return JSON.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            } else seen.push(node);

            let keys = Object.keys(node).sort(cmp && cmp(node));
            let out = keys.reduce((acc, key) => {
                let value = stringify(node, key, node[key], level + 1);
                if (value) {
                    acc.push(indent + space + JSON.stringify(key) + colonSeparator + value);
                }
                return acc;
            }, []);

            seen.splice(seen.indexOf(node), 1);
            return `{${out.join(',')}${indent}}`;
        }
    })({ '': obj }, '', obj, 0);
};
