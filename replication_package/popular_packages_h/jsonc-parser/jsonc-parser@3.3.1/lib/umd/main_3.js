(function (globalFactory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // Node.js and CommonJS-like environments that support module.exports
        module.exports = globalFactory(require, exports);
    } else if (typeof define === "function" && define.amd) {
        // AMD (Asynchronous Module Definition)
        define(["require", "exports", "./impl/format", "./impl/edit", "./impl/scanner", "./impl/parser"], globalFactory);
    }
})(function (require, exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", { value: true });

    const formatter = require("./impl/format");
    const edit = require("./impl/edit");
    const scanner = require("./impl/scanner");
    const parser = require("./impl/parser");

    // Exported functions
    exports.createScanner = scanner.createScanner;

    exports.getLocation = parser.getLocation;
    exports.parse = parser.parse;
    exports.parseTree = parser.parseTree;
    exports.findNodeAtLocation = parser.findNodeAtLocation;
    exports.findNodeAtOffset = parser.findNodeAtOffset;
    exports.getNodePath = parser.getNodePath;
    exports.getNodeValue = parser.getNodeValue;
    exports.visit = parser.visit;
    exports.stripComments = parser.stripComments;

    exports.format = function format(documentText, range, options) {
        return formatter.format(documentText, range, options);
    };

    exports.modify = function modify(text, path, value, options) {
        return edit.setProperty(text, path, value, options);
    };

    exports.applyEdits = function applyEdits(text, edits) {
        let sortedEdits = edits.slice().sort((a, b) => a.offset - b.offset || a.length - b.length);
        for (let i = sortedEdits.length - 1; i >= 0; i--) {
            if (sortedEdits[i].offset + sortedEdits[i].length <= text.length) {
                text = edit.applyEdit(text, sortedEdits[i]);
            } else {
                throw new Error('Overlapping edit');
            }
        }
        return text;
    };

    // Enumeration for scanning errors
    exports.ScanError = {
        None: 0,
        UnexpectedEndOfComment: 1,
        UnexpectedEndOfString: 2,
        UnexpectedEndOfNumber: 3,
        InvalidUnicode: 4,
        InvalidEscapeCharacter: 5,
        InvalidCharacter: 6
    };

    // Enumeration for syntax kinds
    exports.SyntaxKind = {
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

    // Errors related to parsing
    exports.ParseErrorCode = {
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

    exports.printParseErrorCode = function printParseErrorCode(code) {
        switch (code) {
            case 1: return 'InvalidSymbol';
            case 2: return 'InvalidNumberFormat';
            case 3: return 'PropertyNameExpected';
            case 4: return 'ValueExpected';
            case 5: return 'ColonExpected';
            case 6: return 'CommaExpected';
            case 7: return 'CloseBraceExpected';
            case 8: return 'CloseBracketExpected';
            case 9: return 'EndOfFileExpected';
            case 10: return 'InvalidCommentToken';
            case 11: return 'UnexpectedEndOfComment';
            case 12: return 'UnexpectedEndOfString';
            case 13: return 'UnexpectedEndOfNumber';
            case 14: return 'InvalidUnicode';
            case 15: return 'InvalidEscapeCharacter';
            case 16: return 'InvalidCharacter';
            default: return '<unknown ParseErrorCode>';
        }
    };
});
