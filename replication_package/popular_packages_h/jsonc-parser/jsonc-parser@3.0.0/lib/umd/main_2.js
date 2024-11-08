(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
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
    exports.getLocation = parser.getLocation;
    exports.parse = parser.parse;
    exports.parseTree = parser.parseTree;
    exports.findNodeAtLocation = parser.findNodeAtLocation;
    exports.findNodeAtOffset = parser.findNodeAtOffset;
    exports.getNodePath = parser.getNodePath;
    exports.getNodeValue = parser.getNodeValue;
    exports.visit = parser.visit;
    exports.stripComments = parser.stripComments;

    function printParseErrorCode(code) {
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
        for (var i = edits.length - 1; i >= 0; i--) {
            text = edit.applyEdit(text, edits[i]);
        }
        return text;
    }
    exports.applyEdits = applyEdits;
});
