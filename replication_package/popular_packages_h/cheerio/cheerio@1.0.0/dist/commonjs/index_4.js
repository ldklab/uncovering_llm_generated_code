"use strict";
/**
 * @file Batteries-included version of Cheerio. This module includes several
 *   convenience methods for loading documents from various sources.
 */

// Utility functions to wrap and manage imports
var __createBinding = (this && this.__createBinding) || ((Object.create ? function(o, m, k, k2 = k) {
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || (desc.get ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : function(o, m, k, k2 = k) {
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var key in mod) if (key !== "default" && Object.prototype.hasOwnProperty.call(mod, key)) __createBinding(result, mod, key);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

// Module exports
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBuffer = loadBuffer;
exports.stringStream = stringStream;
exports.decodeStream = decodeStream;
exports.fromURL = fromURL;
exports.merge = exports.contains = void 0;

// Export utilities from other modules
__exportStar(require("./load-parse.js"), exports);
var static_js_1 = require("./static.js");
Object.defineProperty(exports, "contains", { enumerable: true, get: function() { return static_js_1.contains; } });
Object.defineProperty(exports, "merge", { enumerable: true, get: function() { return static_js_1.merge; } });

// Import necessary modules
const parse5_htmlparser2_tree_adapter_1 = require("parse5-htmlparser2-tree-adapter");
const htmlparser2 = __importStar(require("htmlparser2"));
const parse5_parser_stream_1 = require("parse5-parser-stream");
const encoding_sniffer_1 = require("encoding-sniffer");
const undici = __importStar(require("undici"));
const whatwg_mimetype_1 = __importDefault(require("whatwg-mimetype"));
const node_stream_1 = require("node:stream");
const options_js_1 = require("./options.js");
const load_parse_js_1 = require("./load-parse.js");

// Load a document from a buffer
function loadBuffer(buffer, options = {}) {
    const opts = (0, options_js_1.flattenOptions)(options);
    const str = (0, encoding_sniffer_1.decodeBuffer)(buffer, {
        defaultEncoding: opts?.xmlMode ? 'utf8' : 'windows-1252',
        ...options.encoding,
    });
    return (0, load_parse_js_1.load)(str, opts);
}

function _stringStream(options, cb) {
    var _a;
    if (options?._useHtmlParser2) {
        const parser = htmlparser2.createDocumentStream((err, document) => cb(err, (0, load_parse_js_1.load)(document)), options);
        return new node_stream_1.Writable({
            decodeStrings: false,
            write(chunk, _encoding, callback) {
                if (typeof chunk !== 'string') {
                    throw new TypeError('Expected a string');
                }
                parser.write(chunk);
                callback();
            },
            final(callback) {
                parser.end();
                callback();
            },
        });
    }
    options ??= {};
    (_a = options.treeAdapter) ??= parse5_htmlparser2_tree_adapter_1.adapter;
    options.scriptingEnabled = options.scriptingEnabled !== false;
    const stream = new parse5_parser_stream_1.ParserStream(options);
    (0, node_stream_1.finished)(stream, (err) => cb(err, (0, load_parse_js_1.load)(stream.document)));
    return stream;
}

// Create a stream to parse strings into a document
function stringStream(options, cb) {
    return _stringStream((0, options_js_1.flattenOptions)(options), cb);
}

// Parse a stream of buffers into a document
function decodeStream(options, cb) {
    var _a;
    const { encoding = {}, ...cheerioOptions } = options;
    const opts = (0, options_js_1.flattenOptions)(cheerioOptions);
    (_a = encoding.defaultEncoding) ??= opts?.xmlMode ? 'utf8' : 'windows-1252';
    const decodeStream = new encoding_sniffer_1.DecodeStream(encoding);
    const loadStream = _stringStream(opts, cb);
    decodeStream.pipe(loadStream);
    return decodeStream;
}

const defaultRequestOptions = {
    method: 'GET',
    maxRedirections: 5,
    throwOnError: true,
    headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
};

// Load a document from a URL
async function fromURL(url, options = {}) {
    var _a;
    const { requestOptions = defaultRequestOptions, encoding = {}, ...cheerioOptions } = options;
    let undiciStream;
    (_a = requestOptions.headers) ??= defaultRequestOptions.headers;
    const promise = new Promise((resolve, reject) => {
        undiciStream = undici.stream(url, requestOptions, (res) => {
            var _a, _b;
            const contentType = (_a = res.headers['content-type']) ?? 'text/html';
            const mimeType = new whatwg_mimetype_1.default(Array.isArray(contentType) ? contentType[0] : contentType);
            if (!mimeType.isHTML() && !mimeType.isXML()) {
                throw new RangeError(`The content-type "${contentType}" is neither HTML nor XML.`);
            }
            encoding.transportLayerEncodingLabel = mimeType.parameters.get('charset');
            const history = (_b = res.context)?.history;
            const opts = {
                encoding,
                xmlMode: mimeType.isXML(),
                baseURL: history ? history[history.length - 1] : url,
                ...cheerioOptions,
            };
            return decodeStream(opts, (err, $) => (err ? reject(err) : resolve($)));
        });
    });
    await undiciStream;
    return promise;
}
//# sourceMappingURL=index.js.map
