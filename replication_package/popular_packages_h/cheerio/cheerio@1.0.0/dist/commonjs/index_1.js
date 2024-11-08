"use strict";
/**
 * Extended Cheerio module with additional document loading methods.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = exports.contains = void 0;

const htmlparser2 = require("htmlparser2");
const parse5 = require("parse5");
const undici = require("undici");
const { DecodeStream, decodeBuffer } = require("encoding-sniffer");
const MimeType = require("whatwg-mimetype");
const { Writable, finished } = require("stream");
const { flattenOptions } = require("./options.js");
const { load } = require("./load-parse.js");
const { contains, merge } = require("./static.js");

exports.contains = contains;
exports.merge = merge;

const defaultRequestOptions = {
    method: 'GET',
    maxRedirections: 5,
    throwOnError: true,
    headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
};

function loadBuffer(buffer, options = {}) {
    const opts = flattenOptions(options);
    const defaultEncoding = opts.xmlMode ? 'utf8' : 'windows-1252';
    const str = decodeBuffer(buffer, { defaultEncoding, ...options.encoding });
    return load(str, opts);
}

function _stringStream(options, cb) {
    const opts = flattenOptions(options);
    const writeStream = new Writable({
        decodeStrings: false,
        write(chunk, _encoding, callback) {
            if (typeof chunk !== 'string') {
                return callback(new Error('Expected a string'));
            }
            parser.write(chunk);
            callback();
        },
        final(callback) {
            parser.end();
            callback();
        },
    });

    const parser = htmlparser2.createDocumentStream((err, doc) => cb(err, load(doc)), opts);
    return opts._useHtmlParser2 ? writeStream : createParse5Stream(opts, cb);
}

function stringStream(options, cb) {
    return _stringStream(flattenOptions(options), cb);
}

function decodeStream(options, cb) {
    const { encoding = {}, ...restOpts } = options;
    const opts = flattenOptions(restOpts);
    const defaultEncoding = opts.xmlMode ? 'utf8' : 'windows-1252';
    const decodeStream = new DecodeStream({ defaultEncoding, ...encoding });
    const loadStream = _stringStream(opts, cb);
    decodeStream.pipe(loadStream);
    return decodeStream;
}

async function fromURL(url, options = {}) {
    const { requestOptions = defaultRequestOptions, encoding = {}, ...cheerioOpts } = options;
    const reqOpts = { ...requestOptions, headers: { ...defaultRequestOptions.headers, ...requestOptions.headers } };

    return new Promise((resolve, reject) => {
        undici.stream(url, reqOpts, (res) => {
            const contentType = res.headers['content-type'] || 'text/html';
            const mimeType = new MimeType(contentType);
            if (!mimeType.isHTML() && !mimeType.isXML()) {
                return reject(new Error(`Unsupported content-type: ${contentType}`));
            }
            const transportLayerEncoding = mimeType.parameters.get('charset');
            const baseURL = res.context?.history?.slice(-1)[0] || url;
            const opts = { encoding, xmlMode: mimeType.isXML(), baseURL, ...cheerioOpts };

            decodeStream(opts, (err, $) => (err ? reject(err) : resolve($)));
        });
    });
}
