'use strict';

/**
 * Get the default options for the parser.
 */
function getDefaultOptions() {
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

exports.defaultOptions = getDefaultOptions();

function updateDefaultOptions(newOptions) {
    exports.defaultOptions = newOptions;
}

/**
 * Helpers for handling escape sequences in HTML.
 */
const escapePatterns = {
    specialChars: /[&<>"']/,
    regexEscapeReplace: new RegExp(/[&<>"']/.source, 'g'),
    noEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
    regexEscapeReplaceNoEncode: new RegExp(/[<>"']|&(?!#[\d;]{1,7}|#[Xx][A-Fa-f0-9]{1,6}|[\w]+;)/.source, 'g'),
};

const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const escapeReplacement = (character) => replacements[character];

function escape(html, encode = false) {
    if (encode && escapePatterns.specialChars.test(html)) {
        return html.replace(escapePatterns.regexEscapeReplace, escapeReplacement);
    }
    if (!encode && escapePatterns.noEncode.test(html)) {
        return html.replace(escapePatterns.regexEscapeReplaceNoEncode, escapeReplacement);
    }
    return html;
}

const caretPattern = /(^|[^\[])\^/g;

function modifyRegex(regex, opt = '') {
    let source = typeof regex === 'string' ? regex : regex.source;
    const modifiedRegex = {
        replace: (name, val) => {
            let valueSource = typeof val === 'string' ? val : val.source;
            valueSource = valueSource.replace(caretPattern, '$1');
            source = source.replace(name, valueSource);
            return modifiedRegex;
        },
        getRegex: () => new RegExp(source, opt),
    };
    return modifiedRegex;
}

function sanitizeUrl(href) {
    try {
        return encodeURI(href).replace(/%25/g, '%');
    } catch {
        return null;
    }
}

const noopTestObject = { exec: () => null };

function splitTableCells(row, numberOfCells) {
    const formattedRow = row.replace(/\|/g, (match, offset, str) => {
        let isEscaped = false;
        let curr = offset;
        while (--curr >= 0 && str[curr] === '\\') {
            isEscaped = !isEscaped;
        }
        return isEscaped ? '|' : ' |';
    });
    const cells = formattedRow.split(/ \|/);

    if (!cells[0].trim()) cells.shift();
    if (cells.length && !cells[cells.length - 1].trim()) cells.pop();

    if (numberOfCells) {
        if (cells.length > numberOfCells) {
            cells.splice(numberOfCells);
        } else {
            while (cells.length < numberOfCells) cells.push('');
        }
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }
    return cells;
}

function trimSuffix(str, char, invert = false) {
    let suffixLength = 0;
    const totalLength = str.length;
    while (suffixLength < totalLength) {
        const currChar = str.charAt(totalLength - suffixLength - 1);
        if (currChar === char && !invert) suffixLength++;
        else if (currChar !== char && invert) suffixLength++;
        else break;
    }
    return str.slice(0, totalLength - suffixLength);
}

function findClosingBracketIndex(str, brackets) {
    if (!str.includes(brackets[1])) return -1;

    let level = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '\\') {
            i++;
        } else if (str[i] === brackets[0]) {
            level++;
        } else if (str[i] === brackets[1]) {
            level--;
            if (level < 0) return i;
        }
    }
    return -1;
}

function createLinkOutput(match, link, raw, lexer) {
    const href = link.href;
    const title = link.title ? escape(link.title) : null;
    const text = match[1].replace(/\\([\[\]])/g, '$1');
    if (match[0].charAt(0) !== '!') {
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

function adjustCodeIndentation(raw, text) {
    const indentMatch = raw.match(/^(\s+)(?: