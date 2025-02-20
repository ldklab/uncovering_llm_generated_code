(function () {
    'use strict';

    const esutils = require('esutils');
    const typed = require('./typed');
    const utility = require('./utility');

    const sliceSource = (source, index, last) => source.slice(index, last);

    const hasOwnProperty = (() => {
        const func = Object.prototype.hasOwnProperty;
        return (obj, name) => func.call(obj, name);
    })();

    const shallowCopy = (obj) => {
        const ret = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    };

    const isASCIIAlphanumeric = (ch) => (ch >= 0x61 && ch <= 0x7A) || (ch >= 0x41 && ch <= 0x5A) || (ch >= 0x30 && ch <= 0x39);

    const isParamTitle = (title) => ['param', 'argument', 'arg'].includes(title);
    const isReturnTitle = (title) => ['return', 'returns'].includes(title);
    const isProperty = (title) => ['property', 'prop'].includes(title);

    const isNameParameterRequired = (title) => isParamTitle(title) || isProperty(title) ||
        ['alias', 'this', 'mixes', 'requires'].includes(title);

    const isAllowedName = (title) => isNameParameterRequired(title) || ['const', 'constant'].includes(title);
    const isAllowedNested = (title) => isProperty(title) || isParamTitle(title);
    const isAllowedOptional = (title) => isProperty(title) || isParamTitle(title);

    const isTypeParameterRequired = (title) => isParamTitle(title) || isReturnTitle(title) ||
        ['define', 'enum', 'implements', 'this', 'type', 'typedef'].includes(title) || isProperty(title);

    const isAllowedType = (title) => isTypeParameterRequired(title) || ['throws', 'const', 'constant', 'namespace', 'member', 'var', 'module', 
        'constructor', 'class', 'extends', 'augments', 'public', 'private', 'protected'].includes(title);

    const WHITESPACE = '[ \\f\\t\\v\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000\\ufeff]';
    const STAR_MATCHER = `(${WHITESPACE}*(?:\\*${WHITESPACE}?)?)(.+|[\r\n\u2028\u2029])`;

    const unwrapComment = (doc) => doc.replace(/^\/\*\*?/, '')
                                      .replace(/\*\/$/, '')
                                      .replace(new RegExp(STAR_MATCHER, 'g'), '$2')
                                      .replace(/\s*$/, '');

    const convertUnwrappedCommentIndex = (originalSource, unwrappedIndex) => {
        let replacedSource = originalSource.replace(/^\/\*\*?/, '');
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

    (function (exports) {
        let index, lineNumber, length, source, originalSource, recoverable, sloppy, strict;

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
            advance();  // waste '@'
            while (index < length && isASCIIAlphanumeric(source.charCodeAt(index))) {
                title += advance();
            }
            return title;
        };

        const seekContent = () => {
            let ch, waiting = false, last = index;
            while (last < length) {
                ch = source.charCodeAt(last);
                if (esutils.code.isLineTerminator(ch) && !(ch === 0x0D && source.charCodeAt(last + 1) === 0x0A)) {
                    waiting = true;
                } else if (waiting) {
                    if (ch === 0x40) break;
                    if (!esutils.code.isWhiteSpace(ch)) waiting = false;
                }
                last += 1;
            }
            return last;
        };

        const parseType = (title, last, addRange) => {
            let ch, brace, type, startIndex, direct = false;

            while (index < last) {
                ch = source.charCodeAt(index);
                if (esutils.code.isWhiteSpace(ch)) {
                    advance();
                } else if (ch === 0x7B) {
                    advance();
                    break;
                } else {
                    direct = true;
                    break;
                }
            }

            if (direct) return null;

            brace = 1;
            type = '';
            while (index < last) {
                ch = source.charCodeAt(index);
                if (esutils.code.isLineTerminator(ch)) {
                    advance();
                } else {
                    if (ch === 0x7D) {
                        brace -= 1;
                        if (brace === 0) {
                            advance();
                            break;
                        }
                    } else if (ch === 0x7B) {
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
                return typed.parseParamType(type, {startIndex: convertIndex(startIndex), range: addRange});
            }

            return typed.parseType(type, {startIndex: convertIndex(startIndex), range: addRange});
        };

        const scanIdentifier = (last) => {
            let identifier;
            if (!esutils.code.isIdentifierStartES5(source.charCodeAt(index)) && !source[index].match(/[0-9]/)) {
                return null;
            }
            identifier = advance();
            while (index < last && esutils.code.isIdentifierPartES5(source.charCodeAt(index))) {
                identifier += advance();
            }
            return identifier;
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

            if (source.charCodeAt(index) === 0x5B) {
                if (allowBrackets) {
                    useBrackets = true;
                    name = advance();
                } else {
                    return null;
                }
            }

            name += scanIdentifier(last);

            if (allowNestedParams) {
                if (source.charCodeAt(index) === 0x3A && (['module', 'external', 'event'].includes(name))) {
                    name += advance();
                    name += scanIdentifier(last);
                }
                if(source.charCodeAt(index) === 0x5B && source.charCodeAt(index + 1) === 0x5D){
                    name += advance();
                    name += advance();
                }
                while ([0x2E, 0x2F, 0x23, 0x2D, 0x7E].includes(source.charCodeAt(index))) {
                    name += advance();
                    name += scanIdentifier(last);
                }
            }

            if (useBrackets) {
                skipWhiteSpace(last);
                if (source.charCodeAt(index) === 0x3D) {
                    name += advance();
                    skipWhiteSpace(last);

                    let ch;
                    let bracketDepth = 1;

                    while (index < last) {
                        ch = source.charCodeAt(index);

                        if (esutils.code.isWhiteSpace(ch) && !insideString) {
                            skipWhiteSpace(last);
                            ch = source.charCodeAt(index);
                        }

                        if (ch === 0x27) {
                            insideString = insideString === '\'' ? '' : '\'';
                        }

                        if (ch === 0x22) {
                            insideString = insideString === '"' ? '' : '"';
                        }

                        if (ch === 0x5B) {
                            bracketDepth++;
                        } else if (ch === 0x5D && --bracketDepth === 0) {
                            break;
                        }

                        name += advance();
                    }
                }

                skipWhiteSpace(last);

                if (index >= last || source.charCodeAt(index) !== 0x5D) {
                    return null;
                }

                name += advance();
            }

            return name;
        };

        const skipToTag = () => {
            while (index < length && source.charCodeAt(index) !== 0x40) {
                advance();
            }
            if (index >= length) return false;
            utility.assert(source.charCodeAt(index) === 0x40);
            return true;
        };

        const convertIndex = (rangeIndex) => {
            if (source === originalSource) return rangeIndex;
            return convertUnwrappedCommentIndex(originalSource, rangeIndex);
        };

        function TagParser(options, title) {
            this._options = options;
            this._title = title.toLowerCase();
            this._tag = { title: title, description: null };
            if (this._options.lineNumbers) {
                this._tag.lineNumber = lineNumber;
            }
            this._first = index - title.length - 1;
            this._last = 0;
            this._extra = {};
        }

        TagParser.prototype.addError = function (errorText) {
            const args = Array.prototype.slice.call(arguments, 1);
            const msg = errorText.replace(/%(\d)/g, (whole, index) => {
                utility.assert(index < args.length, 'Message reference must be in range');
                return args[index];
            });

            if (!this._tag.errors) {
                this._tag.errors = [];
            }
            if (strict) {
                utility.throwError(msg);
            }
            this._tag.errors.push(msg);
            return recoverable;
        };

        TagParser.prototype.parseType = function () {
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
        };

        TagParser.prototype._parseNamePath = function (optional) {
            const name = parseName(this._last, sloppy && isAllowedOptional(this._title), true);
            if (!name && !optional) {
                if (!this.addError('Missing or invalid tag name')) return false;
            }
            this._tag.name = name;
            return true;
        };

        TagParser.prototype.parseNamePath = function () {
            return this._parseNamePath(false);
        };

        TagParser.prototype.parseNamePathOptional = function () {
            return this._parseNamePath(true);
        };

        TagParser.prototype.parseName = function () {
            let assign, name;

            if (isAllowedName(this._title)) {
                this._tag.name = parseName(this._last, sloppy && isAllowedOptional(this._title), isAllowedNested(this._title));
                if (!this._tag.name) {
                    if (!isNameParameterRequired(this._title)) return true;

                    if (isParamTitle(this._title) && this._tag.type && this._tag.type.name) {
                        this._extra.name = this._tag.type;
                        this._tag.name = this._tag.type.name;
                        this._tag.type = null;
                    } else if (!this.addError('Missing or invalid tag name')) {
                        return false;
                    }
                } else {
                    name = this._tag.name;
                    if (name.startsWith('[') && name.endsWith(']')) {
                        assign = name.slice(1, -1).split('=');
                        if (assign.length > 1) {
                            this._tag['default'] = assign.slice(1).join('=');
                        }
                        this._tag.name = assign[0];

                        if (this._tag.type && this._tag.type.type !== 'OptionalType') {
                            this._tag.type = {
                                type: 'OptionalType',
                                expression: this._tag.type
                            };
                        }
                    }
                }
            }

            return true;
        };

        TagParser.prototype.parseDescription = function () {
            let description = sliceSource(source, index, this._last).trim();
            if (description) {
                if ((/^-\s+/).test(description)) {
                    description = description.substring(2);
                }
                this._tag.description = description;
            }
            return true;
        };

        TagParser.prototype.parseCaption = function () {
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
        };

        TagParser.prototype.parseKind = function () {
            const kind = sliceSource(source, index, this._last).trim();
            this._tag.kind = kind;
            const kinds = {
                'class': true, 'constant': true, 'event': true, 'external': true, 'file': true, 'function': true, 
                'member': true, 'mixin': true, 'module': true, 'namespace': true, 'typedef': true
            };
            if (!hasOwnProperty(kinds, kind)) {
                if (!this.addError('Invalid kind name \'%0\'', kind)) return false;
            }
            return true;
        };

        TagParser.prototype.parseAccess = function () {
            const access = sliceSource(source, index, this._last).trim();
            this._tag.access = access;
            if (!['private', 'protected', 'public'].includes(access)) {
                if (!this.addError('Invalid access name \'%0\'', access)) return false;
            }
            return true;
        };

        TagParser.prototype.parseThis = function () {
            const value = sliceSource(source, index, this._last).trim();
            if (value && value.charAt(0) === '{') {
                const gotType = this.parseType();
                if (gotType && ['NameExpression', 'UnionType'].includes(this._tag.type.type)) {
                    this._tag.name = this._tag.type.name;
                    return true;
                } else {
                    return this.addError('Invalid name for this');
                }
            } else {
                return this.parseNamePath();
            }
        };

        TagParser.prototype.parseVariation = function () {
            const text = sliceSource(source, index, this._last).trim();
            const variation = parseFloat(text, 10);
            this._tag.variation = variation;
            if (isNaN(variation)) {
                if (!this.addError('Invalid variation \'%0\'', text)) return false;
            }
            return true;
        };

        TagParser.prototype.ensureEnd = function () {
            const shouldBeEmpty = sliceSource(source, index, this._last).trim();
            if (shouldBeEmpty) {
                if (!this.addError('Unknown content \'%0\'', shouldBeEmpty)) return false;
            }
            return true;
        };

        TagParser.prototype.epilogue = function () {
            const description = this._tag.description;
            if (isAllowedOptional(this._title) && !this._tag.type && description && description.charAt(0) === '[') {
                this._tag.type = this._extra.name;
                if (!this._tag.name) this._tag.name = undefined;
                if (!sloppy && !this.addError('Missing or invalid tag name')) return false;
            }
            return true;
        };

        const Rules = {
            'access': ['parseAccess'], 'alias': ['parseNamePath', 'ensureEnd'], 'augments': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'constructor': ['parseType', 'parseNamePathOptional', 'ensureEnd'], 'class': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'extends': ['parseType', 'parseNamePathOptional', 'ensureEnd'], 'example': ['parseCaption'], 'deprecated': ['parseDescription'],
            'global': ['ensureEnd'], 'inner': ['ensureEnd'], 'instance': ['ensureEnd'], 'kind': ['parseKind'],
            'mixes': ['parseNamePath', 'ensureEnd'], 'mixin': ['parseNamePathOptional', 'ensureEnd'],
            'member': ['parseType', 'parseNamePathOptional', 'ensureEnd'], 'method': ['parseNamePathOptional', 'ensureEnd'],
            'module': ['parseType', 'parseNamePathOptional', 'ensureEnd'], 'func': ['parseNamePathOptional', 'ensureEnd'],
            'function': ['parseNamePathOptional', 'ensureEnd'], 'var': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'name': ['parseNamePath', 'ensureEnd'], 'namespace': ['parseType', 'parseNamePathOptional', 'ensureEnd'],
            'private': ['parseType', 'parseDescription'], 'protected': ['parseType', 'parseDescription'], 'public': ['parseType', 'parseDescription'],
            'readonly': ['ensureEnd'], 'requires': ['parseNamePath', 'ensureEnd'], 'since': ['parseDescription'], 'static': ['ensureEnd'],
            'summary': ['parseDescription'], 'this': ['parseThis', 'ensureEnd'], 'todo': ['parseDescription'],
            'typedef': ['parseType', 'parseNamePathOptional'], 'variation': ['parseVariation'], 'version': ['parseDescription']
        };

        TagParser.prototype.parse = function () {
            const sequences = hasOwnProperty(Rules, this._title) ? Rules[this._title] : ['parseType', 'parseName', 'parseDescription', 'epilogue'];

            for (let i = 0; i < sequences.length; ++i) {
                if (!this[sequences[i]]()) return null;
            }
            return this._tag;
        };

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
            let description = '', ch, atAllowed = true;
            while (index < length) {
                ch = source.charCodeAt(index);
                if (atAllowed && ch === 0x40) break;

                if (esutils.code.isLineTerminator(ch)) {
                    atAllowed = true;
                } else if (atAllowed && !esutils.code.isWhiteSpace(ch)) {
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

            const interestingTags = options.tags && Array.isArray(options.tags) ? Object.fromEntries(options.tags.map(t => [t, true])) : null;
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
                if (!interestingTags || interestingTags.hasOwnProperty(tag.title)) {
                    tags.push(tag);
                }
            }

            return { description, tags };
        };
        exports.parse = parse;
    })(jsdoc = {});

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
        stringify: typed.stringify
    };
})();
