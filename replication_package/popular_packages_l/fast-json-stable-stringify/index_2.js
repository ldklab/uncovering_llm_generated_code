function stringify(obj, options = {}) {
    const seen = [];
    const { cycles = false, cmp } = options;

    const sortKeys = cmp && function(compareFunc) {
        return node => (a, b) => compareFunc({ key: a, value: node[a] }, { key: b, value: node[b] });
    };

    const recursiveStringify = node => {
        if (node && typeof node.toJSON === 'function') node = node.toJSON();

        switch (typeof node) {
            case 'number':
                return isFinite(node) ? String(node) : 'null';
            case 'object':
                if (node === null) return 'null';
                if (seen.includes(node)) {
                    if (cycles) return JSON.stringify('__cycle__');
                    throw new TypeError('Converting circular structure to JSON');
                }
                seen.push(node);
                if (Array.isArray(node)) {
                    const arrayContent = node.map(item => recursiveStringify(item) || 'null');
                    seen.pop();
                    return `[${arrayContent.join(',')}]`;
                } else {
                    const keys = Object.keys(node).sort(sortKeys && sortKeys(cmp)(node));
                    const objectContent = keys.map(key => {
                        const value = recursiveStringify(node[key]);
                        return value ? `${JSON.stringify(key)}:${value}` : null;
                    }).filter(Boolean);
                    seen.pop();
                    return `{${objectContent.join(',')}}`;
                }
            default:
                return JSON.stringify(node);
        }
    };

    return recursiveStringify(obj);
}

module.exports = stringify;

// Usage example
// const stringify = require('./index');
// const obj = { c: 8, b: [{z:6,y:5,x:4},7], a: 3 };
// console.log(stringify(obj));

// const s = stringify(obj, { cmp: (a, b) => (a.key < b.key ? 1 : -1) });
// console.log(s);
