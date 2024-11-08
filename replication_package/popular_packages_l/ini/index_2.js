// ini.js

export function parse(iniText) {
    const result = {};
    let currentSection = result;

    iniText.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith(';')) return; // Ignore comments and empty lines

        const sectionMatch = line.match(/^\[(.*)\]$/);
        if (sectionMatch) {
            const path = sectionMatch[1].split('.');
            currentSection = path.reduce((acc, part) => acc[part] = acc[part] || {}, result);
            return;
        }

        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        const arrMatch = key.match(/(\w+)\[\]$/);

        if (arrMatch) {
            const arrKey = arrMatch[1];
            currentSection[arrKey] = currentSection[arrKey] || [];
            currentSection[arrKey].push(value);
        } else {
            currentSection[key.trim()] = value;
        }
    });

    return result;
}

export function stringify(obj, options = {}) {
    const opts = {
        whitespace: false,
        align: false,
        sort: false,
        newline: false,
        platform: process.platform,
        bracketedArray: true,
        section: '',
        ...options
    };

    let result = '';
    const eol = opts.platform === 'win32' ? '\r\n' : '\n';
    const whitespace = opts.whitespace ? ' ' : '';

    function serializeSection(section, prefix = '') {
        let keys = Object.keys(section);
        if (opts.sort) keys.sort();

        keys.forEach(key => {
            let value = section[key];
            if (typeof value === 'object' && !Array.isArray(value)) {
                const newPrefix = prefix ? `${prefix}.${key}` : key;
                if (opts.newline && newPrefix) result += eol;
                result += `[${opts.section}${newPrefix}]${eol}`;
                serializeSection(value, newPrefix);
            } else {
                if (Array.isArray(value) && opts.bracketedArray) {
                    value.forEach(item => result += `${key}[]${whitespace}=${whitespace}${item}${eol}`);
                } else {
                    result += `${key}${whitespace}=${whitespace}${value}${eol}`;
                }
            }
        });
    }

    serializeSection(obj);
    return result;
}

export function safe(string) {
    return string.replace(/["\\]/g, '\\$&');  // Escape " and \
}

export function unsafe(string) {
    return string.replace(/\\(["\\])/g, '$1');  // Unescape \" and \\
}

export { parse as decode, stringify as encode };
