"use strict";
/**
 * Character classes for XML.
 *
 * @deprecated since 1.3.0. Import from the ``xml`` and ``xmlns`` hierarchies
 * instead.
 *
 * @author Louis-Dominique Dubeau
 * @license MIT
 * @copyright Louis-Dominique Dubeau
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ed4 = require("./xml/1.0/ed4");
const ed5 = require("./xml/1.0/ed5");
const nsed3 = require("./xmlns/1.0/ed3");

console.warn("DEPRECATION WARNING: the xmlchar *module* is deprecated: please replace e.g. require('xmlchars') with require('xmlchars/xml/...')");

exports.XML_1_0 = {
    /**
     * Fifth edition utilities for XML 1.0
     */
    ED5: {
        fragments: {
            CHAR: ed5.CHAR,
            S: ed5.S,
            NAME_START_CHAR: ed5.NAME_START_CHAR,
            NAME_CHAR: ed5.NAME_CHAR,
        },
        regexes: {
            CHAR: ed5.CHAR_RE,
            S: ed5.S_RE,
            NAME_START_CHAR: ed5.NAME_START_CHAR_RE,
            NAME_CHAR: ed5.NAME_CHAR_RE,
            NAME: ed5.NAME_RE,
            NMTOKEN: ed5.NMTOKEN_RE,
        },
        lists: {
            S: ed5.S_LIST,
        },
        isChar: ed5.isChar,
        isS: ed5.isS,
        isNameStartChar: ed5.isNameStartChar,
        isNameChar: ed5.isNameChar,
    },
    /**
     * Fourth edition utilities for XML 1.0
     */
    ED4: {
        fragments: {
            CHAR: ed4.CHAR,
            S: ed4.S,
            BASE_CHAR: ed4.BASE_CHAR,
            IDEOGRAPHIC: ed4.IDEOGRAPHIC,
            COMBINING_CHAR: ed4.COMBINING_CHAR,
            DIGIT: ed4.DIGIT,
            EXTENDER: ed4.EXTENDER,
            LETTER: ed4.LETTER,
            NAME_CHAR: ed4.NAME_CHAR,
        },
        regexes: {
            CHAR: ed4.CHAR_RE,
            S: ed4.S_RE,
            BASE_CHAR: ed4.BASE_CHAR_RE,
            IDEOGRAPHIC: ed4.IDEOGRAPHIC_RE,
            COMBINING_CHAR: ed4.COMBINING_CHAR_RE,
            DIGIT: ed4.DIGIT_RE,
            EXTENDER: ed4.EXTENDER_RE,
            LETTER: ed4.LETTER_RE,
            NAME_CHAR: ed4.NAME_CHAR_RE,
            NAME: ed4.NAME_RE,
            NMTOKEN: ed4.NMTOKEN_RE,
        }
    }
};

exports.XMLNS_1_0 = {
    /**
     * Third edition utilities for XML NS 1.0
     */
    ED3: {
        fragments: {
            NC_NAME_START_CHAR: nsed3.NC_NAME_START_CHAR,
            NC_NAME_CHAR: nsed3.NC_NAME_CHAR,
        },
        regexes: {
            NC_NAME_START_CHAR: nsed3.NC_NAME_START_CHAR_RE,
            NC_NAME_CHAR: nsed3.NC_NAME_CHAR_RE,
            NC_NAME: nsed3.NC_NAME_RE,
        },
        isNCNameStartChar: nsed3.isNCNameStartChar,
        isNCNameChar: nsed3.isNCNameChar,
    }
};
