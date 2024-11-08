(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        const v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    } else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./impl/format", "./impl/edit", "./impl/scanner", "./impl/parser"], factory);
    }
})(function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });

    const formatter = require("./impl/format");
    const edit = require("./impl/edit");
    const scanner = require("./impl/scanner");
    const parser = require("./impl/parser");

    exports.createScanner = scanner.createScanner;

    const ScanError = {
        None: 0,
        UnexpectedEndOfComment: 1,
        UnexpectedEndOfString: 2,
        UnexpectedEndOfNumber: 3,
        InvalidUnicode: 4,
        InvalidEscapeCharacter: 5,
        InvalidCharacter: 6
    };
    exports.ScanError = ScanError;

    const SyntaxKind = {
        OpenBraceToken: 1,
        CloseBraceToken: 2,
        OpenBracketToken: 3,
        CloseBracketToken: 4,
        CommaToken: 5,
        ColonToken: 6,
        NullKeyword: 7,
        TrueKeyword: 8,
        FalseKeyword: 9,
        StringLiteral: 10,
        NumericLiteral: 11,
        LineCommentTrivia: 12,
        BlockCommentTrivia: 13,
        LineBreakTrivia: 14,
        Trivia: 15,
        Unknown: 16,
        EOF: 17
    };
    exports.SyntaxKind = SyntaxKind;

    exports.getLocation = parser.getLocation;
    exports.parse = parser.parse;
    exports.parseTree = parser.parseTree;
    exports.findNodeAtLocation = parser.findNodeAtLocation;
    exports.findNodeAtOffset = parser.findNodeAtOffset;
    exports.getNodePath = parser.getNodePath;
    exports.getNodeValue = parser.getNodeValue;
    exports.visit = parser.visit;
    exports.stripComments = parser.stripComments;

    const ParseErrorCode = {
        InvalidSymbol: 1,
        InvalidNumberFormat: 2,
        PropertyNameExpected: 3,
        ValueExpected: 4,
        ColonExpected: 5,
        CommaExpected: 6,
        CloseBraceExpected: 7,
        CloseBracketExpected: 8,
        EndOfFileExpected: 9,
        InvalidCommentToken: 10,
        UnexpectedEndOfComment: 11,
        UnexpectedEndOfString: 12,
        UnexpectedEndOfNumber: 13,
        InvalidUnicode: 14,
        InvalidEscapeCharacter: 15,
        InvalidCharacter: 16
    };
    exports.ParseErrorCode = ParseErrorCode;

    exports.printParseErrorCode = function printParseErrorCode(code) {
        const errorMessages = {
            1: 'InvalidSymbol',
            2: 'InvalidNumberFormat',
            3: 'PropertyNameExpected',
            4: 'ValueExpected',
            5: 'ColonExpected',
            6: 'CommaExpected',
            7: 'CloseBraceExpected',
            8: 'CloseBracketExpected',
            9: 'EndOfFileExpected',
            10: 'InvalidCommentToken',
            11: 'UnexpectedEndOfComment',
            12: 'UnexpectedEndOfString',
            13: 'UnexpectedEndOfNumber',
            14: 'InvalidUnicode',
            15: 'InvalidEscapeCharacter',
            16: 'InvalidCharacter'
        };
        return errorMessages[code] || '<unknown ParseErrorCode>';
    };

    exports.format = function format(documentText, range, options) {
        return formatter.format(documentText, range, options);
    };

    exports.modify = function modify(text, path, value, options) {
        return edit.setProperty(text, path, value, options);
    };

    exports.applyEdits = function applyEdits(text, edits) {
        const sortedEdits = edits.slice().sort((a, b) => a.offset - b.offset || a.length - b.length);
        let lastModifiedOffset = text.length;
        for (let i = sortedEdits.length - 1; i >= 0; i--) {
            const e = sortedEdits[i];
            if (e.offset + e.length <= lastModifiedOffset) {
                text = edit.applyEdit(text, e);
            } else {
                throw new Error('Overlapping edit');
            }
            lastModifiedOffset = e.offset;
        }
        return text;
    };
});
