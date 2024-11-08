/*
 * @fileoverview Main Doctrine object
 * @description This module provides functionality to parse JSDoc comments. The main function `parse` parses JSDoc-style comments, extracting tags and descriptions.
 */

(() => {
    'use strict';

    const esutils = require('esutils');
    const typed = require('./typed');
    const utility = require('./utility');
    let jsdoc = {};

    const sliceSource = (source, index, last) => source.slice(index, last);

    const hasOwnProperty = (() => {
        const func = Object.prototype.hasOwnProperty;
        return (obj, name) => func.call(obj, name);
    })();

    const shallowCopy = (obj) => {
        let clone = {};
        for (let key in obj) {
            if (hasOwnProperty(obj, key)) {
                clone[key] = obj[key];
            }
        }
        return clone;
    };

    const isASCIIAlphanumeric = (ch) => (
        (ch >= 0x61 && ch <= 0x7A) || // 'a' to 'z'
        (ch >= 0x41 && ch <= 0x5A) || // 'A' to 'Z'
        (ch >= 0x30 && ch <= 0x39) // '0' to '9'
    );

    const isParamTitle = (title) => ['param', 'argument', 'arg'].includes(title);
    const isReturnTitle = (title) => ['return', 'returns'].includes(title);
    const isProperty = (title) => ['property', 'prop'].includes(title);

    const isNameParameterRequired = (title) => (
        isParamTitle(title) || isProperty(title) ||
        ['alias', 'this', 'mixes', 'requires'].includes(title)
    );

    const isAllowedName = (title) => (
        isNameParameterRequired(title) || ['const', 'constant'].includes(title)
    );

    const isAllowedNested = (title) => isProperty(title) || isParamTitle(title);
    const isAllowedOptional = isAllowedNested;

    const isTypeParameterRequired = (title) => (
        isParamTitle(title) || isReturnTitle(title) ||
        ['define', 'enum', 'implements', 'this', 'type', 'typedef'].includes(title) || isProperty(title)
    );

    const isAllowedType = (title) => (
        isTypeParameterRequired(title) ||
        ['throws', 'const', 'constant', 'namespace', 'member', 'var', 'module', 'constructor', 'class', 'extends', 'augments', 'public', 'private', 'protected'].includes(title)
    );

    const WHITESPACE = '[ \\f\\t\\v\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000\\ufeff]';
    const STAR_MATCHER = `(${WHITESPACE}*(?:\\*${WHITESPACE}?)?)(.+|[\r\n\u2028\u2029])`;

    const unwrapComment = (doc) => (
        doc
            .replace(/^\/\*\*?/, '')
            .replace(/\*\/$/, '')
            .replace(new RegExp(STAR_MATCHER, 'g'), '$2')
            .replace(/\s*$/, '')
    );

    const convertUnwrappedCommentIndex = (originalSource, unwrappedIndex) => {
        const replacedSource = originalSource.replace(/^\/\*\*?/, '');
        let numSkippedChars = 0;
        const matcher = new RegExp(STAR_MATCHER, 'g');
        let match;

        while ((match = matcher.exec(replacedSource))) {
            numSkippedChars += match[1].length;

            if (match.index + match[0].length > unwrappedIndex + numSkippedChars) {
                return unwrappedIndex + numSkippedChars + originalSource.length - replacedSource.length;
            }
        }

        return originalSource.replace(/\*\/$/, '').replace(/\s*$/, '').length;
    };

    // JSDoc Tag Parsing Logic encapsulated within an IIFE
    (() => {
        const Rules = {
            'access': ['parseAccess'],
            'alias': ['parseNamePath', 'ensureEnd'],
            'augments': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'constructor': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'class': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'extends': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'example': ['parseCaption'],
            'deprecated': ['parseDescription'],
            'global': ['ensureEnd'],
            'inner': ['ensureEnd'],
            'instance': ['ensureEnd'],
            'kind': ['parseKind'],
            'mixes': ['parseNamePath', 'ensureEnd'],
            'mixin': ['parseNamePathOptional', 'ensureEnd'],
            'member': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'method': ['parseNamePathOptional', 'ensureEnd'],
            'module': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'func': ['parseNamePathOptional', 'ensureEnd'],
            'function': ['parseNamePathOptional', 'ensureEnd'],
            'var': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'name': ['parseNamePath', 'ensureEnd'],
            'namespace': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'private': ['parseType', 'parseDescription'],
            'protected': ['parseType', 'parseDescription'],
            'public': ['parseType', 'parseDescription'],
            'readonly': ['ensureEnd'],
            'requires': ['parseNamePath', 'ensureEnd'],
            'since': ['parseDescription'],
            'static': ['ensureEnd'],
            'summary': ['parseDescription'],
            'this': ['parseThis', 'ensureEnd'],
            'todo': ['parseDescription'],
            'typedef': ['parseType', 'parseNamePathOptional'],
            'variation': ['parseVariation'],
            'version': ['parseDescription']
        };

        let index, lineNumber, length, source, originalSource;
        let recoverable, sloppy, strict;

        const advance = () => {
            const ch = source.charCodeAt(index);
            index += 1;
            if (esutils.code.isLineTerminator(ch) && !(ch === 0x0D && source.charCodeAt(index) === 0x0A)) {
                lineNumber += 1;
            }
            return String.fromCharCode(ch);
        };

        const scanTitle = () => {
            let title = '';
            advance(); // consume '@'

            while (index < length && isASCIIAlphanumeric(source.charCodeAt(index))) {
                title += advance();
            }
            return title;
        };

        const seekContent = () => {
            let ch, waiting = false;
            let last = index;

            while (last < length) {
                ch = source.charCodeAt(last);
                if (esutils.code.isLineTerminator(ch) && !(ch === 0x0D && source.charCodeAt(last + 1) === 0x0A)) {
                    waiting = true;
                } else if (waiting) {
                    if (ch === 0x40 /* '@' */) break;
                    if (!esutils.code.isWhiteSpace(ch)) {
                        waiting = false;
                    }
                }
                last += 1;
            }
            return last;
        };

        const parseType = (title, last, addRange) => {
            let ch, brace, type = '';
            let startIndex, direct = false;

            while (index < last) {
                ch = source.charCodeAt(index);
                if (esutils.code.isWhiteSpace(ch)) {
                    advance();
                } else if (ch === 0x7B /* '{' */) {
                    advance();
                    break;
                } else {
                    direct = true;
                    break;
                }
            }

            if (direct) return null;

            brace = 1;
            while (index < last) {
                ch = source.charCodeAt(index);
                if (esutils.code.isLineTerminator(ch)) {
                    advance();
                } else {
                    if (ch === 0x7D /* '}' */) {
                        brace -= 1;
                        if (brace === 0) {
                            advance();
                            break;
                        }
                    } else if (ch === 0x7B /* '{' */) {
                        brace += 1;
                    }
                    if (type === '') {
                        startIndex = index;
                    }
                    type += advance();
                }
            }

            if (brace !== 0) {
                return utility.throwError('Braces are not balanced');
            }

            if (isAllowedOptional(title)) {
                return typed.parseParamType(type, { startIndex: convertIndex(startIndex), range: addRange });
            }

            return typed.parseType(type, { startIndex: convertIndex(startIndex), range: addRange });
        };

        const skipWhiteSpace = (last) => {
            while (index < last && (esutils.code.isWhiteSpace(source.charCodeAt(index)) || esutils.code.isLineTerminator(source.charCodeAt(index)))) {
                advance();
            }
        };

        const parseName = (last, allowBrackets, allowNestedParams) => {
            let name = '', useBrackets, insideString;

            skipWhiteSpace(last);
            if (index >= last) return null;

            if (source.charCodeAt(index) === 0x5B /* '[' */) {
                if (allowBrackets) {
                    useBrackets = true;
                    name = advance();
                } else {
                    return null;
                }
            }

            name += scanIdentifier(last);

            if (allowNestedParams) {
                if (source.charCodeAt(index) === 0x3A /* ':' */ && ['module', 'external', 'event'].includes(name)) {
                    name += advance();
                    name += scanIdentifier(last);
                }
                while ([0x2E, 0x2F, 0x23, 0x2D, 0x7E].includes(source.charCodeAt(index))) { // '.', '/', '#', '-', '~'
                    name += advance();
                    name += scanIdentifier(last);
                }
            }

            if (useBrackets) {
                skipWhiteSpace(last);

                if (source.charCodeAt(index) === 0x3D /* '=' */) {
                    name += advance();
                    skipWhiteSpace(last);

                    let ch, bracketDepth = 1;
                    while (index < last) {
                        ch = source.charCodeAt(index);

                        if (esutils.code.isWhiteSpace(ch) && !insideString) {
                            skipWhiteSpace(last);
                            ch = source.charCodeAt(index);
                        }

                        if (ch === 0x27 /* ''' */) {
                            insideString = !insideString ? '\'' : '';
                        }

                        if (ch === 0x22 /* '"' */) {
                            insideString = !insideString ? '"' : '';
                        }

                        if (ch === 0x5B /* '[' */) {
                            bracketDepth++;
                        } else if (ch === 0x5D /* ']' */ && --bracketDepth === 0) {
                            break;
                        }

                        name += advance();
                    }
                }

                skipWhiteSpace(last);

                if (source.charCodeAt(index) !== 0x5D /* ']' */) return null;

                name += advance();
            }

            return name;
        };

        const skipToTag = () => {
            while (index < length && source.charCodeAt(index) !== 0x40 /* '@' */) {
                advance();
            }
            return index < length && source.charCodeAt(index) === 0x40 /* '@' */;
        };

        const convertIndex = (rangeIndex) => {
            return source === originalSource ? rangeIndex : convertUnwrappedCommentIndex(originalSource, rangeIndex);
        };

        class TagParser {
            constructor(options, title) {
                this._options = options;
                this._title = title.toLowerCase();
                this._tag = { title, description: null };
                if (options.lineNumbers) {
                    this._tag.lineNumber = lineNumber;
                }
                this._first = index - title.length - 1;
                this._last = 0;
                this._extra = {};
            }

            addError(errorText, ...args) {
                let msg = errorText.replace(/%(\d)/g, (_, i) => { 
                    utility.assert(i < args.length, 'Message reference must be in range');
                    return args[i];
                });

                if (!this._tag.errors) this._tag.errors = [];
                if (strict) utility.throwError(msg);
                this._tag.errors.push(msg);
                return recoverable;
            }

            parseType() {
                if (isTypeParameterRequired(this._title)) {
                    try {
                        this._tag.type = parseType(this._title, this._last, this._options.range);
                        if (!this._tag.type && !isParamTitle(this._title) && !isReturnTitle(this._title)) {
                            if (!this.addError('Missing or invalid tag type')) return false;
                        }
                    } catch (error) {
                        this._tag.type = null;
                        if (!this.addError(error.message)) return false;
                    }
                } else if (isAllowedType(this._title)) {
                    try {
                        this._tag.type = parseType(this._title, this._last, this._options.range);
                    } catch (e) {}
                }
                return true;
            }

            _parseNamePath(optional) {
                const name = parseName(this._last, sloppy && isAllowedOptional(this._title), true);
                if (!name && !optional) {
                    if (!this.addError('Missing or invalid tag name')) return false;
                }
                this._tag.name = name;
                return true;
            }

            parseNamePath() {
                return this._parseNamePath(false);
            }

            parseNamePathOptional() {
                return this._parseNamePath(true);
            }

            parseName() {
                if (isAllowedName(this._title)) {
                    this._tag.name = parseName(this._last, sloppy && isAllowedOptional(this._title), isAllowedNested(this._title));
                    if (!this._tag.name) {
                        if (!isNameParameterRequired(this._title)) return true;

                        if (isParamTitle(this._title) && this._tag.type && this._tag.type.name) {
                            this._extra.name = this._tag.type;
                            this._tag.name = this._tag.type.name;
                            this._tag.type = null;
                        } else {
                            if (!this.addError('Missing or invalid tag name')) return false;
                        }
                    } else {
                        let name = this._tag.name;
                        if (name.startsWith('[') && name.endsWith(']')) { // optional parameter
                            const assign = name.slice(1, -1).split('=');
                            if (assign.length > 1) {
                                this._tag['default'] = assign.slice(1).join('=');
                            }
                            this._tag.name = assign[0];

                            if (this._tag.type && this._tag.type.type !== 'OptionalType') {
                                this._tag.type = { type: 'OptionalType', expression: this._tag.type };
                            }
                        }
                    }
                }
                return true;
            }

            parseDescription() {
                const description = sliceSource(source, index, this._last).trim();
                if (description) {
                    if (/^- /.test(description)) {
                        this._tag.description = description.substring(2);
                    } else {
                        this._tag.description = description;
                    }
                }
                return true;
            }

            parseCaption() {
                const description = sliceSource(source, index, this._last).trim();
                const captionStartTag = '<caption>';
                const captionEndTag = '</caption>';
                const captionStart = description.indexOf(captionStartTag);
                const captionEnd = description.indexOf(captionEndTag);
                if (captionStart >= 0 && captionEnd >= 0) {
                    this._tag.caption = description.slice(captionStart + captionStartTag.length, captionEnd).trim();
                    this._tag.description = description.slice(captionEnd + captionEndTag.length).trim();
                } else {
                    this._tag.description = description;
                }
                return true;
            }

            parseKind() {
                const kind = sliceSource(source, index, this._last).trim();
                const validKinds = ['class', 'constant', 'event', 'external', 'file', 'function', 'member', 'mixin', 'module', 'namespace', 'typedef'];
                this._tag.kind = kind;
                if (!validKinds.includes(kind)) {
                    if (!this.addError('Invalid kind name \'%0\'', kind)) return false;
                }
                return true;
            }

            parseAccess() {
                const access = sliceSource(source, index, this._last).trim();
                this._tag.access = access;
                if (!['private', 'protected', 'public'].includes(access)) {
                    if (!this.addError('Invalid access name \'%0\'', access)) return false;
                }
                return true;
            }

            parseThis() {
                const value = sliceSource(source, index, this._last).trim();
                if (value && value.startsWith('{')) {
                    const gotType = this.parseType();
                    if (gotType && (this._tag.type.type === 'NameExpression' || this._tag.type.type === 'UnionType')) {
                        this._tag.name = this._tag.type.name;
                        return true;
                    } else {
                        return this.addError('Invalid name for this');
                    }
                } else {
                    return this.parseNamePath();
                }
            }

            parseVariation() {
                const text = sliceSource(source, index, this._last).trim();
                const variation = parseFloat(text);
                this._tag.variation = variation;
                if (isNaN(variation)) {
                    if (!this.addError('Invalid variation \'%0\'', text)) return false;
                }
                return true;
            }

            ensureEnd() {
                const shouldBeEmpty = sliceSource(source, index, this._last).trim();
                if (shouldBeEmpty) {
                    if (!this.addError('Unknown content \'%0\'', shouldBeEmpty)) return false;
                }
                return true;
            }

            epilogue() {
                const description = this._tag.description;
                if (isAllowedOptional(this._title) && !this._tag.type && description && description.startsWith('[')) {
                    this._tag.type = this._extra.name;
                    if (!this._tag.name) {
                        this._tag.name = undefined;
                    }

                    if (!sloppy && !this.addError('Missing or invalid tag name')) return false;
                }
                return true;
            }

            parse() {
                if (!this._title) {
                    if (!this.addError('Missing or invalid title')) return null;
                }
                this._last = seekContent(this._title);

                if (this._options.range) {
                    this._tag.range = [this._first, sliceSource(source, 0, this._last).trimRight().length].map(convertIndex);
                }

                const sequences = hasOwnProperty(Rules, this._title) ? Rules[this._title] : ['parseType', 'parseName', 'parseDescription', 'epilogue'];

                for (let i = 0, iz = sequences.length; i < iz; ++i) {
                    if (!this[sequences[i]]()) return null;
                }
                return this._tag;
            }
        }

        const parseTag = (options) => {
            if (!skipToTag()) return null;
            const title = scanTitle();
            const parser = new TagParser(options, title);
            const tag = parser.parse();

            while (index < parser._last) {
                advance();
            }
            return tag;
        };

        const scanJSDocDescription = (preserveWhitespace) => {
            let description = '';
            let atAllowed = true;

            while (index < length) {
                const ch = source.charCodeAt(index);

                if (atAllowed && ch === 0x40) { // '@'
                    break;
                }

                if (esutils.code.isLineTerminator(ch)) {
                    atAllowed = true;
                } else if (!atAllowed && !esutils.code.isWhiteSpace(ch)) {
                    atAllowed = false;
                }

                description += advance();
            }

            return preserveWhitespace ? description : description.trim();
        };

        const parse = (comment, options = {}) => {
            const tags = [];
            let description;

            if (options.unwrap) {
                source = unwrapComment(comment);
            } else {
                source = comment;
            }

            originalSource = comment;

            let interestingTags;

            if (options.tags) {
                if (Array.isArray(options.tags)) {
                    interestingTags = Object.fromEntries(options.tags.map(tag => [tag, true]));
                } else {
                    utility.throwError('Invalid "tags" parameter: ' + options.tags);
                }
            }

            length = source.length;
            index = 0;
            lineNumber = 0;
            recoverable = options.recoverable;
            sloppy = options.sloppy;
            strict = options.strict;

            description = scanJSDocDescription(options.preserveWhitespace);

            while (true) {
                const tag = parseTag(options);
                if (!tag) break;
                if (!interestingTags || hasOwnProperty(interestingTags, tag.title)) {
                    tags.push(tag);
                }
            }

            return {
                description,
                tags
            };
        };

        jsdoc.parse = parse;
    })();

    exports.version = utility.VERSION;
    exports.parse = jsdoc.parse;
    exports.parseType = typed.parseType;
    exports.parseParamType = typed.parseParamType;
    exports.unwrapComment = unwrapComment;
    exports.Syntax = shallowCopy(typed.Syntax);
    exports.Error = utility.DoctrineError;
    exports.type = {
        Syntax: exports.Syntax,
        parseType: typed.parseType,
        parseParamType: typed.parseParamType,
        stringify: typed.stringify,
    };
})();
