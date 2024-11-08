(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(require, exports);
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

    var ScanError = {};
    (function (ScanError) {
        ScanError[ScanError["None"] = 0] = "None";
        ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
        ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
        ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
        ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
        ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
        ScanError[ScanError["InvalidCharacter"] = 6] = "InvalidCharacter";
    })(ScanError || (exports.ScanError = ScanError = {}));

    var SyntaxKind = {};
    (function (SyntaxKind) {
        SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
        SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
        SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
        SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
        SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
        SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
        SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
        SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
        SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
        SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
        SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
        SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
        SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
        SyntaxKind[SyntaxKind["LineBreakTrivia"] = 14] = "LineBreakTrivia";
        SyntaxKind[SyntaxKind["Trivia"] = 15] = "Trivia";
        SyntaxKind[SyntaxKind["Unknown"] = 16] = "Unknown";
        SyntaxKind[SyntaxKind["EOF"] = 17] = "EOF";
    })(SyntaxKind || (exports.SyntaxKind = SyntaxKind = {}));

    exports.getLocation = parser.getLocation;
    exports.parse = parser.parse;
    exports.parseTree = parser.parseTree;
    exports.findNodeAtLocation = parser.findNodeAtLocation;
    exports.findNodeAtOffset = parser.findNodeAtOffset;
    exports.getNodePath = parser.getNodePath;
    exports.getNodeValue = parser.getNodeValue;
    exports.visit = parser.visit;
    exports.stripComments = parser.stripComments;

    var ParseErrorCode = {};
    (function (ParseErrorCode) {
        ParseErrorCode[ParseErrorCode["InvalidSymbol"] = 1] = "InvalidSymbol";
        ParseErrorCode[ParseErrorCode["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
        ParseErrorCode[ParseErrorCode["PropertyNameExpected"] = 3] = "PropertyNameExpected";
        ParseErrorCode[ParseErrorCode["ValueExpected"] = 4] = "ValueExpected";
        ParseErrorCode[ParseErrorCode["ColonExpected"] = 5] = "ColonExpected";
        ParseErrorCode[ParseErrorCode["CommaExpected"] = 6] = "CommaExpected";
        ParseErrorCode[ParseErrorCode["CloseBraceExpected"] = 7] = "CloseBraceExpected";
        ParseErrorCode[ParseErrorCode["CloseBracketExpected"] = 8] = "CloseBracketExpected";
        ParseErrorCode[ParseErrorCode["EndOfFileExpected"] = 9] = "EndOfFileExpected";
        ParseErrorCode[ParseErrorCode["InvalidCommentToken"] = 10] = "InvalidCommentToken";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
        ParseErrorCode[ParseErrorCode["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
        ParseErrorCode[ParseErrorCode["InvalidUnicode"] = 14] = "InvalidUnicode";
        ParseErrorCode[ParseErrorCode["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
        ParseErrorCode[ParseErrorCode["InvalidCharacter"] = 16] = "InvalidCharacter";
    })(ParseErrorCode || (exports.ParseErrorCode = ParseErrorCode = {}));

    function printParseErrorCode(code) {
        switch (code) {
            case ParseErrorCode.InvalidSymbol: return 'InvalidSymbol';
            case ParseErrorCode.InvalidNumberFormat: return 'InvalidNumberFormat';
            case ParseErrorCode.PropertyNameExpected: return 'PropertyNameExpected';
            case ParseErrorCode.ValueExpected: return 'ValueExpected';
            case ParseErrorCode.ColonExpected: return 'ColonExpected';
            case ParseErrorCode.CommaExpected: return 'CommaExpected';
            case ParseErrorCode.CloseBraceExpected: return 'CloseBraceExpected';
            case ParseErrorCode.CloseBracketExpected: return 'CloseBracketExpected';
            case ParseErrorCode.EndOfFileExpected: return 'EndOfFileExpected';
            case ParseErrorCode.InvalidCommentToken: return 'InvalidCommentToken';
            case ParseErrorCode.UnexpectedEndOfComment: return 'UnexpectedEndOfComment';
            case ParseErrorCode.UnexpectedEndOfString: return 'UnexpectedEndOfString';
            case ParseErrorCode.UnexpectedEndOfNumber: return 'UnexpectedEndOfNumber';
            case ParseErrorCode.InvalidUnicode: return 'InvalidUnicode';
            case ParseErrorCode.InvalidEscapeCharacter: return 'InvalidEscapeCharacter';
            case ParseErrorCode.InvalidCharacter: return 'InvalidCharacter';
        }
        return '<unknown ParseErrorCode>';
    }
    exports.printParseErrorCode = printParseErrorCode;

    function format(documentText, range, options) {
        return formatter.format(documentText, range, options);
    }
    exports.format = format;

    function modify(text, path, value, options) {
        return edit.setProperty(text, path, value, options);
    }
    exports.modify = modify;

    function applyEdits(text, edits) {
        let sortedEdits = edits.slice().sort((a, b) => {
            let diff = a.offset - b.offset;
            return diff === 0 ? a.length - b.length : diff;
        });
        let lastModifiedOffset = text.length;
        for (let i = sortedEdits.length - 1; i >= 0; i--) {
            let e = sortedEdits[i];
            if (e.offset + e.length <= lastModifiedOffset) {
                text = edit.applyEdit(text, e);
            } else {
                throw new Error('Overlapping edit');
            }
            lastModifiedOffset = e.offset;
        }
        return text;
    }
    exports.applyEdits = applyEdits;
});
