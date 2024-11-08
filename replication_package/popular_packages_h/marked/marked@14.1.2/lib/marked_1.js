'use strict';

function getDefaults() {
    return {
        async: false,
        breaks: false,
        extensions: null,
        gfm: true,
        hooks: null,
        pedantic: false,
        renderer: null,
        silent: false,
        tokenizer: null,
        walkTokens: null,
    };
}

exports.defaults = getDefaults();

function changeDefaults(newDefaults) {
    exports.defaults = newDefaults;
}

const escapeTest = /[&<>"']/;
const escapeReplace = new RegExp(escapeTest.source, 'g');
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const getEscapeReplacement = (ch) => escapeReplacements[ch];

function escape(html, encode) {
    if (encode) {
        if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
        }
    } else {
        if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
        }
    }
    return html;
}

const caret = /(^|[^\[])\^/g;

function edit(regex, opt) {
    let source = typeof regex === 'string' ? regex : regex.source;
    opt = opt || '';
    const obj = {
        replace: (name, val) => {
            let valSource = typeof val === 'string' ? val : val.source;
            valSource = valSource.replace(caret, '$1');
            source = source.replace(name, valSource);
            return obj;
        },
        getRegex: () => new RegExp(source, opt),
    };
    return obj;
}

function cleanUrl(href) {
    try {
        href = encodeURI(href).replace(/%25/g, '%');
    } catch {
        return null;
    }
    return href;
}

function noopTest() {
    return { exec: () => null };
}

function splitCells(tableRow, count) {
    const row = tableRow.replace(/\|/g, (match, offset, str) => {
        let escaped = false;
        let curr = offset;
        while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
        return escaped ? '|' : ' |';
    });
    
    const cells = row.split(/ \|/);
    if (!cells[0].trim()) cells.shift();
    if (cells.length > 0 && !cells[cells.length - 1].trim()) cells.pop();

    if (count) {
        if (cells.length > count) {
            cells.splice(count);
        } else {
            while (cells.length < count) cells.push('');
        }
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }
    return cells;
}

function rtrim(str, c, invert) {
    const l = str.length;
    if (l === 0) return '';
    let suffLen = 0;
    while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
            suffLen++;
        } else if (currChar !== c && invert) {
            suffLen++;
        } else break;
    }
    return str.slice(0, l - suffLen);
}

function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) return -1;
    let level = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '\\') {
            i++;
        } else if (str[i] === b[0]) {
            level++;
        } else if (str[i] === b[1]) {
            level--;
            if (level < 0) return i;
        }
    }
    return -1;
}

function outputLink(cap, link, raw, lexer) {
    const href = link.href;
    const title = link.title ? escape(link.title) : null;
    const text = cap[1].replace(/\\([\[\]])/g, '$1');
    if (cap[0].charAt(0) !== '!') {
        lexer.state.inLink = true;
        const token = {
            type: 'link',
            raw,
            href,
            title,
            text,
            tokens: lexer.inlineTokens(text),
        };
        lexer.state.inLink = false;
        return token;
    }
    return {
        type: 'image',
        raw,
        href,
        title,
        text: escape(text),
    };
}

function indentCodeCompensation(raw, text) {
    const matchIndentToCode = raw.match(/^(\s+)(?: