"use strict";

/**
 * @file A complete version of Cheerio with added convenience methods for loading documents from different sources.
 */

Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = exports.contains = void 0;

const { adapter } = require("parse5-htmlparser2-tree-adapter");
const htmlparser2 = require("htmlparser2");
const { ParserStream } = require("parse5-parser-stream");
const { decodeBuffer, DecodeStream } = require("encoding-sniffer");
const undici = require("undici");
const MimeType = require("whatwg-mimetype");
const { Writable, finished } = require("node:stream");
const { flattenOptions } = require("./options.js");
const { load } = require("./load-parse.js");

Object.defineProperty(exports, "contains", { enumerable: true, get: function() { return require("./static.js").contains; } });
Object.defineProperty(exports, "merge", { enumerable: true, get: function() { return require("./static.js").merge; } });

exports.loadBuffer = loadBuffer;
exports.stringStream = stringStream;
exports.decodeStream = decodeStream;
exports.fromURL = fromURL;

function loadBuffer(buffer, options = {}) {
  const opts = flattenOptions(options);
  const str = decodeBuffer(buffer, {
    defaultEncoding: opts?.xmlMode ? 'utf8' : 'windows-1252',
    ...options.encoding,
  });
  return load(str, opts);
}

function _stringStream(options, cb) {
  if (options?._useHtmlParser2) {
    const parser = htmlparser2.createDocumentStream((err, doc) => cb(err, load(doc)), options);
    return new Writable({
      decodeStrings: false,
      write(chunk, _encoding, callback) {
        if (typeof chunk !== 'string') throw new TypeError('Expected a string');
        parser.write(chunk);
        callback();
      },
      final(callback) {
        parser.end();
        callback();
      },
    });
  }

  options = options || {};
  options.treeAdapter = options.treeAdapter || adapter;
  if (options.scriptingEnabled !== false) options.scriptingEnabled = true;
  
  const stream = new ParserStream(options);
  finished(stream, (err) => cb(err, load(stream.document)));
  return stream;
}

function stringStream(options, cb) {
  return _stringStream(flattenOptions(options), cb);
}

function decodeStream(options, cb) {
  const { encoding = {}, ...cheerioOptions } = options;
  const opts = flattenOptions(cheerioOptions);
  encoding.defaultEncoding = encoding.defaultEncoding || (opts?.xmlMode ? 'utf8' : 'windows-1252');
  const decodeStream = new DecodeStream(encoding);
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

async function fromURL(url, options = {}) {
  const { requestOptions = defaultRequestOptions, encoding = {}, ...cheerioOptions } = options;
  let undiciStream;
  
  requestOptions.headers = requestOptions.headers || defaultRequestOptions.headers;
  
  const promise = new Promise((resolve, reject) => {
    undiciStream = undici.stream(url, requestOptions, (res) => {
      const contentType = res.headers['content-type'] || 'text/html';
      const mimeType = new MimeType(Array.isArray(contentType) ? contentType[0] : contentType);
      if (!mimeType.isHTML() && !mimeType.isXML()) {
        throw new RangeError(`The content-type "${contentType}" is neither HTML nor XML.`);
      }
      
      encoding.transportLayerEncodingLabel = mimeType.parameters.get('charset');
      const history = res.context?.history;
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
