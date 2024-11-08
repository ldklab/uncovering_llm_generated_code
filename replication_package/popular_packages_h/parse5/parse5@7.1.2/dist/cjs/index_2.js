"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFragment = exports.parse = exports.TokenizerMode = exports.Tokenizer = exports.Token = exports.html = exports.foreignContent = exports.ErrorCodes = exports.serializeOuter = exports.serialize = exports.Parser = exports.defaultTreeAdapter = void 0;

const { Parser } = require("./parser/index.js");
const { defaultTreeAdapter } = require("./tree-adapters/default.js");

const { serialize, serializeOuter } = require("./serializer/index.js");

const { ERR: ErrorCodes } = require("./common/error-codes.js");
exports.ErrorCodes = ErrorCodes;

/** @internal */
exports.foreignContent = require("./common/foreign-content.js");
/** @internal */
exports.html = require("./common/html.js");
/** @internal */
exports.Token = require("./common/token.js");

const { Tokenizer, TokenizerMode } = require("./tokenizer/index.js");

// Reexport modules
exports.defaultTreeAdapter = defaultTreeAdapter;
exports.Parser = Parser;
exports.serialize = serialize;
exports.serializeOuter = serializeOuter;
exports.Tokenizer = Tokenizer;
exports.TokenizerMode = TokenizerMode;

/**
 * Parses an HTML string.
 *
 * @param html Input HTML string.
 * @param options Parsing options.
 * @returns Document
 *
 * @example
 *
 * 