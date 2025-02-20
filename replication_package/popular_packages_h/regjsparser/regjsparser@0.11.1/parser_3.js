"use strict";

(function() {

    var fromCodePoint = String.fromCodePoint || (function() {
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;

        return function() {
            var MAX_SIZE = 0x4000;
            var codeUnits = [];
            var highSurrogate, lowSurrogate, index = -1, length = arguments.length, result = '';
            
            if (!length) return '';

            while (++index < length) {
                var codePoint = Number(arguments[index]);
                
                if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) !== codePoint) {
                    throw RangeError('Invalid code point: ' + codePoint);
                }

                if (codePoint <= 0xFFFF) {
                    codeUnits.push(codePoint);
                } else {
                    codePoint -= 0x10000;
                    highSurrogate = (codePoint >> 10) + 0xD800;
                    lowSurrogate = (codePoint % 0x400) + 0xDC00;
                    codeUnits.push(highSurrogate, lowSurrogate);
                }

                if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                    result += stringFromCharCode.apply(null, codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        };
    }());

    function parse(str, flags, features) {
        features = features || {};

        function addRaw(node) {
            node.raw = str.substring(node.range[0], node.range[1]);
            return node;
        }

        function updateRawStart(node, start) {
            node.range[0] = start;
            return addRaw(node);
        }

        function createAnchor(kind, rawLength) {
            return addRaw({ type: 'anchor', kind: kind, range: [pos - rawLength, pos] });
        }

        function createValue(kind, codePoint, from, to) {
            return addRaw({ type: 'value', kind: kind, codePoint: codePoint, range: [from, to] });
        }

        function createEscaped(kind, codePoint, value, fromOffset) {
            fromOffset = fromOffset || 0;
            return createValue(kind, codePoint, pos - (value.length + fromOffset), pos);
        }

        function createCharacter(matches) {
            var _char = matches[0], first = _char.charCodeAt(0);
            
            if (isUnicodeMode) {
                if (_char.length === 1 && first >= 0xD800 && first <= 0xDBFF) {
                    var second = lookahead().charCodeAt(0);
                    if (second >= 0xDC00 && second <= 0xDFFF) {
                        pos++;
                        return createValue('symbol', (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000, pos - 2, pos);
                    }
                }
            }

            return createValue('symbol', first, pos - 1, pos);
        }

        function createDisjunction(alternatives, from, to) {
            return addRaw({ type: 'disjunction', body: alternatives, range: [from, to] });
        }

        function createDot() {
            return addRaw({ type: 'dot', range: [pos - 1, pos] });
        }

        function createCharacterClassEscape(value) {
            return addRaw({ type: 'characterClassEscape', value: value, range: [pos - 2, pos] });
        }

        function createReference(matchIndex) {
            return addRaw({ type: 'reference', matchIndex: parseInt(matchIndex, 10), range: [pos - 1 - matchIndex.length, pos] });
        }

        function createNamedReference(name) {
            return addRaw({ type: 'reference', name: name, range: [name.range[0] - 3, pos] });
        }

        function createGroup(behavior, disjunction, from, to) {
            return addRaw({ type: 'group', behavior: behavior, body: disjunction, range: [from, to] });
        }

        function createQuantifier(min, max, from, to, symbol) {
            if (to == null) {
                from = pos - 1; to = pos;
            }
            return addRaw({ type: 'quantifier', min: min, max: max, greedy: true, body: null, symbol: symbol, range: [from, to] });
        }

        function createAlternative(terms, from, to) {
            return addRaw({ type: 'alternative', body: terms, range: [from, to] });
        }

        function createCharacterClass(contents, negative, from, to) {
            return addRaw({ type: 'characterClass', kind: contents.kind, body: contents.body, negative: negative, range: [from, to] });
        }

        function createClassRange(min, max, from, to) {
            if (min.codePoint > max.codePoint) {
                bail('invalid range in character class', min.raw + '-' + max.raw, from, to);
            }
            return addRaw({ type: 'characterClassRange', min: min, max: max, range: [from, to] });
        }

        function createClassStrings(strings, from, to) {
            return addRaw({ type: 'classStrings', strings: strings, range: [from, to] });
        }

        function createClassString(characters, from, to) {
            return addRaw({ type: 'classString', characters: characters, range: [from, to] });
        }

        function flattenBody(body) {
            return body.type === 'alternative' ? body.body : [body];
        }

        function incr(amount) {
            amount = (amount || 1);
            var res = str.substring(pos, pos + amount);
            pos += amount;
            return res;
        }

        function skip(value) {
            if (!match(value)) {
                bail('character', value);
            }
        }

        function match(value) {
            if (str.indexOf(value, pos) === pos) {
                return incr(value.length);
            }
        }

        function lookahead() {
            return str[pos];
        }

        function current(value) {
            return str.indexOf(value, pos) === pos;
        }

        function next(value) {
            return str[pos + 1] === value;
        }

        function matchReg(regExp) {
            var subStr = str.substring(pos), res = subStr.match(regExp);
            if (res) {
                res.range = [pos, pos += res[0].length];
            }
            return res;
        }

        function parseDisjunction() {
            var res = [parseAlternative()], from = pos;
            while (match('|')) {
                res.push(parseAlternative());
            }
            return res.length === 1 ? res[0] : createDisjunction(res, from, pos);
        }

        function parseAlternative() {
            var res = [], from = pos, term;
            while ((term = parseTerm())) {
                res.push(term);
            }
            return res.length === 1 ? res[0] : createAlternative(res, from, pos);
        }

        function parseTerm() {
            if (pos >= str.length || current('|') || current(')')) {
                return null; 
            }

            var component = parseAnchor() || parseAtomAndExtendedAtom();
            if (!component) {
                bail('Expected atom');
            }

            var quantifier = parseQuantifier() || false;
            if (quantifier) {
                var type = component.type, behavior = component.behavior;
                if (['lookbehind', 'negativeLookbehind'].includes(behavior) || (isUnicodeMode && ['lookahead', 'negativeLookahead'].includes(behavior))) {
                    bail("Invalid quantifier", "", quantifier.range[0], quantifier.range[1]);
                }
                quantifier.body = flattenBody(component);
                updateRawStart(quantifier, component.range[0]);
                return quantifier;
            }

            return component;
        }

        function parseGroup(matchA, typeA, matchB, typeB) {
            var type, from = pos;
            if (match(matchA)) { type = typeA; }
            else if (match(matchB)) { type = typeB; }
            else { return false; }
            return finishGroup(type, from);
        }

        function finishGroup(type, from) {
            var body = parseDisjunction();
            if (!body) { bail('Expected disjunction'); }
            skip(')');
            var group = createGroup(type, flattenBody(body), from, pos);

            if (type === 'normal' && firstIteration) {
                closedCaptureCounter++;
            }

            return group;
        }

        function parseAnchor() {
            if (match('^')) {
                return createAnchor('start', 1);
            } else if (match('$')) {
                return createAnchor('end', 1);
            } else if (match('\\b')) {
                return createAnchor('boundary', 2);
            } else if (match('\\B')) {
                return createAnchor('not-boundary', 2);
            } else {
                return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
            }
        }

        function parseQuantifier() {
            var from = pos, min, max, quantifier, res;

            if (match('*')) {
                quantifier = createQuantifier(0, undefined, undefined, undefined, '*');
            } else if (match('+')) {
                quantifier = createQuantifier(1, undefined, undefined, undefined, "+");
            } else if (match('?')) {
                quantifier = createQuantifier(0, 1, undefined, undefined, "?");
            } else if (res = matchReg(/^\{(\d+)\}/)) {
                min = parseInt(res[1], 10);
                quantifier = createQuantifier(min, min, res.range[0], res.range[1]);
            } else if (res = matchReg(/^\{(\d+),\}/)) {
                min = parseInt(res[1], 10);
                quantifier = createQuantifier(min, undefined, res.range[0], res.range[1]);
            } else if (res = matchReg(/^\{(\d+),(\d+)\}/)) {
                min = parseInt(res[1], 10); max = parseInt(res[2], 10);
                if (min > max) { bail('numbers out of order in {} quantifier', '', from, pos); }
                quantifier = createQuantifier(min, max, res.range[0], res.range[1]);
            }

            if ((min && !Number.isSafeInteger(min)) || (max && !Number.isSafeInteger(max))) {
                bail("iterations outside JS safe integer range in quantifier", "", from, pos);
            }

            if (quantifier && match('?')) {
                quantifier.greedy = false;
                quantifier.range[1] += 1;
            }

            return quantifier;
        }

        function parseAtomAndExtendedAtom() {
            var res;
            if (res = matchReg(/^[^^$\\.*+?()[\]{}|]/)) {
                return createCharacter(res);
            } else if (!isUnicodeMode && (res = matchReg(/^(?:\]|\})/))) {
                return createCharacter(res);
            } else if (match('.')) {
                return createDot();
            } else if (match('\\')) {
                res = parseAtomEscape();
                if (!res) {
                    if (!isUnicodeMode && lookahead() === 'c') {
                        return createValue('symbol', 92, pos - 1, pos);
                    }
                    bail('atomEscape');
                }
                return res;
            } else if (res = parseCharacterClass()) {
                return res;
            } else if (features.lookbehind && (res = parseGroup('(?<=', 'lookbehind', '(?<!', 'negativeLookbehind'))) {
                return res;
            } else if (features.namedGroups && match("(?<")) {
                var name = parseIdentifier();
                skip(">");
                var group = finishGroup("normal", name.range[0] - 3);
                group.name = name;
                return group;
            } else if (features.modifiers && str.indexOf("(?", pos) === pos && str[pos + 2] !== ":") {
                return parseModifiersGroup();
            } else {
                return parseGroup('(?:', 'ignore', '(', 'normal');
            }
        }

        function parseModifiersGroup() {
            if (hasDupChar(str)) {
                bail('Invalid flags for modifiers group');
            }

            var from = pos;
            incr(2);

            var enabling_flags = matchReg(/^[sim]+/);
            var disabling_flags;
            if(match("-")){
                disabling_flags = matchReg(/^[sim]+/);
                if (!disabling_flags) {
                    bail('Invalid flags for modifiers group');
                }
            } else if(!enabling_flags){
                bail('Invalid flags for modifiers group');
            }

            enabling_flags = enabling_flags ? enabling_flags[0] : "";
            disabling_flags = disabling_flags ? disabling_flags[0] : "";

            var flags = enabling_flags + disabling_flags;
            if(flags.length > 3 || hasDupChar(flags)) {
                bail('flags cannot be duplicated for modifiers group');
            }

            if(!match(":")) {
                bail('Invalid flags for modifiers group');
            }

            var modifiersGroup = finishGroup("ignore", from);

            modifiersGroup.modifierFlags = {
                enabling: enabling_flags,
                disabling: disabling_flags
            };

            return modifiersGroup;
        }

        function parseUnicodeSurrogatePairEscape(firstEscape) {
            if (isUnicodeMode) {
                var first, second;
                if (firstEscape.kind === 'unicodeEscape' && (first = firstEscape.codePoint) >= 0xD800 && first <= 0xDBFF && current('\\') && next('u')) {
                    pos++;
                    var secondEscape = parseClassEscape();
                    if (secondEscape.kind === 'unicodeEscape' && (second = secondEscape.codePoint) >= 0xDC00 && second <= 0xDFFF) {
                        firstEscape.range[1] = secondEscape.range[1];
                        firstEscape.codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                        addRaw(firstEscape);
                    } else {
                        --pos;
                    }
                }
            }
            return firstEscape;
        }

        function parseClassEscape() {
            return parseAtomEscape(true);
        }

        function parseAtomEscape(insideCharacterClass) {
            var from = pos, res;

            res = parseDecimalEscape(insideCharacterClass) || parseNamedReference();
            if (res) { return res; }

            if (insideCharacterClass) {
                if (match('b')) {
                    return createEscaped('singleEscape', 0x0008, '\\b');
                } else if (match('B')) {
                    bail('\\B not possible inside of CharacterClass', '', from);
                } else if (!isUnicodeMode && (res = matchReg(/^c(\d)/))) {
                    return createEscaped('controlLetter', res[1] + 16, res[1], 2);
                } else if (!isUnicodeMode && (res = matchReg(/^c_/))) {
                    return createEscaped('controlLetter', 31, '_', 2);
                } else if (isUnicodeMode && match('-')) {
                    return createEscaped('singleEscape', 0x002d, '\\-');
                }
            }

            return parseCharacterClassEscape() || parseCharacterEscape();
        }

        function parseDecimalEscape(insideCharacterClass) {
            var res, match, from = pos;

            if (res = matchReg(/^(?!0)\d+/)) {
                match = res[0];
                var refIdx = parseInt(match, 10);
                if (refIdx <= closedCaptureCounter && !insideCharacterClass) {
                    return createReference(match);
                } else {
                    backrefDenied.push(refIdx);
                    if (firstIteration) { shouldReparse = true; }
                    else { bailOctalEscapeIfUnicode(from, pos); }
                    incr(-res[0].length);
                    if (res = matchReg(/^[0-7]{1,3}/)) {
                        return createEscaped('octal', parseInt(res[0], 8), res[0], 1);
                    } else {
                        res = createCharacter(matchReg(/^[89]/));
                        return updateRawStart(res, res.range[0] - 1);
                    }
                }
            } else if (res = matchReg(/^[0-7]{1,3}/)) {
                match = res[0];
                if (match !== '0') {
                    bailOctalEscapeIfUnicode(from, pos);
                }
                if (/^0{1,3}$/.test(match)) {
                    return createEscaped('null', 0x0000, '0', match.length);
                } else {
                    return createEscaped('octal', parseInt(match, 8), match, 1);
                }
            }
            return false;
        }

        function bailOctalEscapeIfUnicode(from, pos) {
            if (isUnicodeMode) {
                bail('Invalid decimal escape in unicode mode', null, from, pos);
            }
        }

        function parseCharacterClassEscape() {
            var res;
            if (res = matchReg(/^[dDsSwW]/)) {
                return createCharacterClassEscape(res[0]);
            } else if (features.unicodePropertyEscape && isUnicodeMode && (res = matchReg(/^([pP])\{([^}]+)\}/))) {
                return addRaw({ type: 'unicodePropertyEscape', negative: res[1] === 'P', value: res[2], range: [res.range[0] - 1, res.range[1]], raw: res[0] });
            } else if (features.unicodeSet && hasUnicodeSetFlag && match('q{')) {
                return parseClassStringDisjunction();
            }
            return false;
        }

        function parseNamedReference() {
            if (features.namedGroups && matchReg(/^k<(?=.*?>)/)) {
                var name = parseIdentifier();
                skip('>');
                return createNamedReference(name);
            }
        }

        function parseRegExpUnicodeEscapeSequence() {
            var res;
            if (res = matchReg(/^u([0-9a-fA-F]{4})/)) {
                return parseUnicodeSurrogatePairEscape(createEscaped('unicodeEscape', parseInt(res[1], 16), res[1], 2));
            } else if (isUnicodeMode && (res = matchReg(/^u\{([0-9a-fA-F]+)\}/))) {
                return createEscaped('unicodeCodePointEscape', parseInt(res[1], 16), res[1], 4);
            }
        }

        function parseCharacterEscape() {
            var res, from = pos;
            if (res = matchReg(/^[fnrtv]/)) {
                var codePoint = { t: 0x009, n: 0x00A, v: 0x00B, f: 0x00C, r: 0x00D }[res[0]];
                return createEscaped('singleEscape', codePoint, '\\' + res[0]);
            } else if (res = matchReg(/^c([a-zA-Z])/)) {
                return createEscaped('controlLetter', res[1].charCodeAt(0) % 32, res[1], 2);
            } else if (res = matchReg(/^x([0-9a-fA-F]{2})/)) {
                return createEscaped('hexadecimalEscape', parseInt(res[1], 16), res[1], 2);
            } else if (res = parseRegExpUnicodeEscapeSequence()) {
                if (!res || res.codePoint > 0x10FFFF) {
                    bail('Invalid escape sequence', null, from, pos);
                }
                return res;
            } else {
                return parseIdentityEscape();
            }
        }

        function parseIdentifierAtom(check) {
            var ch = lookahead(), from = pos;

            if (ch === '\\') {
                incr();
                var esc = parseRegExpUnicodeEscapeSequence();
                if (!esc || !check(esc.codePoint)) {
                    bail('Invalid escape sequence', null, from, pos);
                }
                return fromCodePoint(esc.codePoint);
            }

            var code = ch.charCodeAt(0);
            if (code >= 0xD800 && code <= 0xDBFF) {
                ch += str[pos + 1];
                var second = ch.charCodeAt(1);
                if (second >= 0xDC00 && second <= 0xDFFF) {
                    code = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                }
            }

            if (!check(code)) return;
            incr();
            if (code > 0xFFFF) incr();
            return ch;
        }

        function parseIdentifier() {
            var start = pos, res = parseIdentifierAtom(isIdentifierStart);
            if (!res) {
                bail('Invalid identifier');
            }

            var ch;
            while ((ch = parseIdentifierAtom(isIdentifierPart))) {
                res += ch;
            }

            return addRaw({ type: 'identifier', value: res, range: [start, pos] });
        }

        function isIdentifierStart(ch) {
            // ECMAScript - Defined range for identifier starts
            var NonAsciiIdentifierStart = /[\w]/; // Simplified regex for demonstration
            return (
                ch === 36 || ch === 95 ||   // $ and _
                (ch >= 65 && ch <= 90) ||   // A-Z
                (ch >= 97 && ch <= 122) ||  // a-z
                (ch >= 0x80 && NonAsciiIdentifierStart.test(fromCodePoint(ch)))
            );
        }

        function isIdentifierPart(ch) {
            // ECMAScript - Defined range for identifier parts
            var NonAsciiIdentifierPartOnly = /[\w]/; // Simplified regex for demonstration
            return (
                isIdentifierStart(ch) || 
                (ch >= 48 && ch <= 57) ||   // 0-9
                (ch >= 0x80 && NonAsciiIdentifierPartOnly.test(fromCodePoint(ch)))
            );
        }

        function parseIdentityEscape() {
            var l = lookahead();
            if (
                (isUnicodeMode && /[\^$.*+?()\\[\]{}|/]/.test(l)) ||
                (!isUnicodeMode && l !== "c")
            ) {
                if (l === "k" && features.lookbehind) {
                    return null;
                }
                var tmp = incr();
                return createEscaped('identifier', tmp.charCodeAt(0), tmp, 1);
            }

            return null;
        }

        function parseCharacterClass() {
            var res, from = pos;
            if (res = matchReg(/^\[\^/)) {
                res = parseClassContents();
                skip(']');
                return createCharacterClass(res, true, from, pos);
            } else if (match('[')) {
                res = parseClassContents();
                skip(']');
                return createCharacterClass(res, false, from, pos);
            }

            return null;
        }

        function parseClassContents() {
            var res;
            if (current(']')) {
                return { kind: 'union', body: [] };
            } else if (hasUnicodeSetFlag) {
                return parseClassSetExpression();
            } else {
                res = parseNonemptyClassRanges();
                if (!res) {
                    bail('nonEmptyClassRanges');
                }
                return { kind: 'union', body: res };
            }
        }

        function parseHelperClassContents(atom) {
            var from, to, res, atomTo, dash;
            if (current('-') && !next(']')) {
                from = atom.range[0];
                dash = createCharacter(match('-'));

                atomTo = parseClassAtom();
                if (!atomTo) {
                    bail('classAtom');
                }
                to = pos;

                var classContents = parseClassContents();
                if (!classContents) {
                    bail('classContents');
                }

                if (!('codePoint' in atom) || !('codePoint' in atomTo)) {
                    if (!isUnicodeMode) {
                        res = [atom, dash, atomTo];
                    } else {
                        bail('invalid character class');
                    }
                } else {
                    res = [createClassRange(atom, atomTo, from, to)];
                }

                if (classContents.type === 'empty') return res;
                return res.concat(classContents.body);
            }

            res = parseNonemptyClassRangesNoDash();
            if (!res) {
                bail('nonEmptyClassRangesNoDash');
            }

            return [atom].concat(res);
        }

        function parseNonemptyClassRanges() {
            var atom = parseClassAtom();
            if (!atom) {
                bail('classAtom');
            }

            if (current(']')) {
                return [atom];
            }

            return parseHelperClassContents(atom);
        }

        function parseNonemptyClassRangesNoDash() {
            var res = parseClassAtom();
            if (!res) {
                bail('classAtom');
            }
            if (current(']')) {
                return res;
            }

            return parseHelperClassContents(res);
        }

        function parseClassAtom() {
            if (match('-')) {
                return createCharacter('-');
            } else {
                return parseClassAtomNoDash();
            }
        }

        function parseClassAtomNoDash() {
            var res;
            if (res = matchReg(/^[^\\\]-]/)) {
                return createCharacter(res[0]);
            } else if (match('\\')) {
                res = parseClassEscape();
                if (!res) {
                    bail('classEscape');
                }

                return parseUnicodeSurrogatePairEscape(res);
            }
        }

        function parseClassSetExpression() {
            var body = [], kind, operand = parseClassSetOperand(true);
            body.push(operand);

            if (operand.type === 'classRange') {
                kind = 'union';
            } else if (current('&')) {
                kind = 'intersection';
            } else if (current('-')) {
                kind = 'subtraction';
            } else {
                kind = 'union';
            }

            while (!current(']')) {
                if (kind === 'intersection') {
                    skip('&'); skip('&');
                    if (current('&')) {
                        bail('&& cannot be followed by &. Wrap it in brackets: &&[&].');
                    }
                } else if (kind === 'subtraction') {
                    skip('-'); skip('-');
                }

                operand = parseClassSetOperand(kind === 'union');
                body.push(operand);
            }

            return { kind: kind, body: body };
        }

        function parseClassSetOperand(allowRanges) {
            var from = pos, start, res;

            if (match('\\')) {
                if (res = parseClassEscape()) {
                    start = res;
                } else if (res = parseClassSetCharacterEscapedHelper()) {
                    return res;
                } else {
                    bail('Invalid escape', '\\' + lookahead(), from);
                }
            } else if (res = parseClassSetCharacterUnescapedHelper()) {
                start = res;
            } else if (res = parseCharacterClass()) {
                return res;
            } else {
                bail('Invalid character', lookahead());
            }

            if (allowRanges && current('-') && !next('-')) {
                skip('-');

                if (res = parseClassSetCharacter()) {
                    return createClassRange(start, res, from, pos);
                }

                bail('Invalid range end', lookahead());
            }

            return start;
        }

        function parseClassSetCharacter() {
            if (match('\\')) {
                var res, from = pos;
                if (res = parseClassSetCharacterEscapedHelper()) {
                    return res;
                } else {
                    bail('Invalid escape', '\\' + lookahead(), from);
                }
            }

            return parseClassSetCharacterUnescapedHelper();
        }

        function parseClassSetCharacterUnescapedHelper() {
            var res;
            if (matchReg(/^(?:&&|!!|##|\$\$|%%|\*\*|\+\+|,,|\.\.|::|;;|<<|==|>>|\?\?|@@|\^\^|``|~~)/)) {
                bail('Invalid set operation in character class');
            }
            if (res = matchReg(/^[^()[\]{}/\-\\|]/)) {
                return createCharacter(res);
            }
        }

        function parseClassSetCharacterEscapedHelper() {
            var res;
            if (match('b')) {
                return createEscaped('singleEscape', 0x0008, '\\b');
            } else if (match('B')) {
                bail('\\B not possible inside of ClassContents', '', pos - 2);
            } else if (res = matchReg(/^[&\-!#%,:;<=>@`~]/)) {
                return createEscaped('identifier', res[0].codePointAt(0), res[0]);
            } else if (res = parseCharacterEscape()) {
                return res;
            } else {
                return null;
            }
        }

        function parseClassStringDisjunction() {
            var from = pos - 3, res = [];
            do {
                res.push(parseClassString());
            } while (match('|'));
            skip('}');
            return createClassStrings(res, from, pos);
        }

        function parseClassString() {
            var res = [], from = pos, char;
            while ((char = parseClassSetCharacter())) {
                res.push(char);
            }
            return createClassString(res, from, pos);
        }

        function bail(message, details, from, to) {
            from = from == null ? pos : from;
            to = to == null ? from : to;

            var contextStart = Math.max(0, from - 10);
            var contextEnd = Math.min(to + 10, str.length);

            var context = '    ' + str.substring(contextStart, contextEnd);
            var pointer = '    ' + new Array(from - contextStart + 1).join(' ') + '^';

            throw SyntaxError(message + ' at position ' + from + (details ? ': ' + details : '') + '\n' + context + '\n' + pointer);
        }

        var backrefDenied = [];
        var closedCaptureCounter = 0;
        var firstIteration = true;
        var shouldReparse = false;
        var hasUnicodeFlag = (flags || "").indexOf("u") !== -1;
        var hasUnicodeSetFlag = (flags || "").indexOf("v") !== -1;
        var isUnicodeMode = hasUnicodeFlag || hasUnicodeSetFlag;
        var pos = 0;

        if (hasUnicodeSetFlag && !features.unicodeSet) {
            throw new Error('The "v" flag is only supported when the .unicodeSet option is enabled.');
        }

        if (hasUnicodeFlag && hasUnicodeSetFlag) {
            throw new Error('The "u" and "v" flags are mutually exclusive.');
        }

        str = String(str);
        if (str === '') {
            str = '(?:)';
        }

        var result = parseDisjunction();

        if (result.range[1] !== str.length) {
            bail('Could not parse entire input - got stuck', '', result.range[1]);
        }

        shouldReparse = shouldReparse || backrefDenied.some(ref => ref <= closedCaptureCounter);
        if (shouldReparse) {
            pos = 0;
            firstIteration = false;
            return parseDisjunction();
        }

        return result;
    }

    var regjsparser = { parse: parse };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = regjsparser;
    } else {
        window.regjsparser = regjsparser;
    }

})();
