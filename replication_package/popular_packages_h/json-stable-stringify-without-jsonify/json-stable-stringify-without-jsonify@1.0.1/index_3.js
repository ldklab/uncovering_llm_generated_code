module.exports = function (obj, opts = {}) {
    if (typeof opts === 'function') opts = { cmp: opts };
    
    let space = opts.space || '';
    if (typeof space === 'number') space = ' '.repeat(space);
    
    const cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;
    const replacer = opts.replacer || ((key, value) => value);
    
    const cmp = opts.cmp ? (node => (a, b) => opts.cmp({ key: a, value: node[a] }, { key: b, value: node[b] })) : null;
    
    const seen = [];
    
    function stringify(parent, key, node, level) {
        const indent = space ? `\n${space.repeat(level)}` : '';
        const colonSeparator = space ? ': ' : ':';
        
        if (node && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }
        
        node = replacer.call(parent, key, node);
        
        if (node === undefined) return;
        if (typeof node !== 'object' || node === null) {
            return JSON.stringify(node);
        }
        if (Array.isArray(node)) {
            const out = node.map((el, i) => (stringify(node, i, el, level + 1) || JSON.stringify(null))).map(item => indent + space + item);
            return `[${out.join(',')}${indent}]`;
        } else {
            if (seen.includes(node)) {
                if (cycles) return JSON.stringify('__cycle__');
                throw new TypeError('Converting circular structure to JSON');
            }
            seen.push(node);
            
            const keys = Object.keys(node).sort(cmp && cmp(node));
            const out = keys.map(k => {
                const value = stringify(node, k, node[k], level + 1);
                if (!value) return '';
                return indent + space + JSON.stringify(k) + colonSeparator + value;
            }).filter(Boolean);
            
            seen.pop();
            return `{${out.join(',')}${indent}}`;
        }
    }
    
    return stringify({ '': obj }, '', obj, 0);
};
