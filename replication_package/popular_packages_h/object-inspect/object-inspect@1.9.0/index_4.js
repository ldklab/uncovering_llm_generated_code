const { custom } = require('./util.inspect');

const inspect = (object, options = {}, depth = 0, seen = []) => {
    const {
        quoteStyle = 'single',
        maxStringLength = null,
        customInspect = true,
        indent = '\t',
        depth: maxDepth = 5
    } = options;

    if (!['single', 'double'].includes(quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }

    if (typeof maxStringLength !== 'number' && maxStringLength !== null) {
        throw new TypeError('option "maxStringLength" must be a positive integer, Infinity, or `null`');
    }

    if (typeof customInspect !== 'boolean') {
        throw new TypeError('option "customInspect", if provided, must be `true` or `false`');
    }

    if (indent !== '\t' && !Number.isInteger(indent)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }

    const builtinTypes = {
        '[object Undefined]': () => 'undefined',
        '[object Null]': () => 'null',
        '[object Boolean]': obj => obj ? 'true' : 'false',
        '[object String]': obj => quoteString(obj, quoteStyle),
        '[object Number]': obj => obj === 0 ? (1 / obj > 0 ? '0' : '-0') : String(obj),
        '[object BigInt]': obj => `${obj}n`,
        '[object Function]': obj => `[Function${obj.name ? ': ' + obj.name : ''}]`,
        '[object Array]': obj => depth >= maxDepth ? '[Array]' : `[${inspectArray(obj, options, depth, seen)}]`,
        '[object Map]': obj => `Map(${obj.size}) {${inspectMap(obj, options, depth, seen)}}`,
        '[object Set]': obj => `Set(${obj.size}) {${inspectSet(obj, options, depth, seen)}}`,
        '[object WeakMap]': () => 'WeakMap { ? }',
        '[object WeakSet]': () => 'WeakSet { ? }',
        '[object Symbol]': obj => obj.toString(),
        '[object Error]': obj => inspectError(obj, options, depth, seen),
        '[object Object]': obj => inspectObject(obj, options, depth, seen)
    };

    const typeTag = Object.prototype.toString.call(object);
    if (builtinTypes[typeTag]) {
        return builtinTypes[typeTag](object);
    }
    return String(object);
};

const quoteString = (str, quoteStyle) => {
    const escapeMap = { '"': '&quot;', "'": "&apos;" };
    const quoteChar = quoteStyle === 'double' ? '"' : "'";
    return `${quoteChar}${str.replace(/['"]/g, match => escapeMap[match])}${quoteChar}`;
};

const inspectArray = (arr, options, depth, seen) => {
    const content = arr.map(item => inspect(item, options, depth + 1, seen)).join(', ');
    return content.length > 0 ? ` ${content} ` : '';
};

const inspectMap = (map, options, depth, seen) => {
    const entries = [];
    map.forEach((value, key) => {
        entries.push(`${inspect(key, options, depth + 1, seen)} => ${inspect(value, options, depth + 1, seen)}`);
    });
    return entries.join(', ');
};

const inspectSet = (set, options, depth, seen) => {
    const values = [...set].map(value => inspect(value, options, depth + 1, seen)).join(', ');
    return values;
};

const inspectError = (error, options, depth, seen) => {
    const props = Object.getOwnPropertyNames(error).map(key => `${key}: ${inspect(error[key], options, depth + 1, seen)}`);
    return `{ [${error.name}: ${error.message}] ${props.join(', ')} }`;
};

const inspectObject = (obj, options, depth, seen) => {
    if (seen.includes(obj)) {
        return '[Circular]';
    }
    seen.push(obj);

    const props = Object.keys(obj).map(key => `${key}: ${inspect(obj[key], options, depth + 1, seen)}`);
    return `{ ${props.join(', ')} }`;
};

module.exports = inspect;
