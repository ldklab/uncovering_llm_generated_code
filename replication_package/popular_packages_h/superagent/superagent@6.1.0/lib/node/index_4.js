"use strict";

const { parse, format, resolve } = require('url');
const Stream = require('stream');
const https = require('https');
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const util = require('util');
const qs = require('qs');
const mime = require('mime');
let methods = require('methods');
const FormData = require('form-data');
const formidable = require('formidable');
const debug = require('debug')('superagent');
const CookieJar = require('cookiejar');
const semver = require('semver');
const safeStringify = require('fast-safe-stringify');

const utils = require('../utils');
const RequestBase = require('../request-base');
const { unzip } = require('./unzip');
const Response = require('./response');

let http2;
if (semver.gte(process.version, 'v10.10.0')) http2 = require('./http2wrapper');

function request(method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

module.exports = request;
exports = module.exports;

/**
 * Expose `Request`.
 */
exports.Request = Request;

/**
 * Expose the agent function
 */
exports.agent = require('./agent');

/**
 * Noop.
 */
function noop() {}

/**
 * Expose `Response`.
 */
exports.Response = Response;

/**
 * Define "form" mime type.
 */
mime.define({
  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
}, true);

/**
 * Protocol map.
 */
exports.protocols = {
  'http:': http,
  'https:': https,
  'http2:': http2
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */
exports.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
};

/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(res, fn){
 *       fn(null, res);
 *     };
 *
 */
exports.parse = require('./parsers');

/**
 * Default buffering map. Can be used to set certain
 * response types to buffer/not buffer.
 *
 *     superagent.buffer['application/xml'] = true;
 */
exports.buffer = {};

/**
 * Initialize internal header tracking properties on a request instance.
 *
 * @param {Object} req the instance
 * @api private
 */
function _initHeaders(req) {
  req._header = {
    // coerces header names to lowercase
  };
  req.header = {
    // preserves header name case
  };
}

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String|Object} url
 * @api public
 */
function Request(method, url) {
  Stream.call(this);
  if (typeof url !== 'string') url = format(url);
  this._enableHttp2 = Boolean(process.env.HTTP2_TEST); // internal only
  this._agent = false;
  this._formData = null;
  this.method = method;
  this.url = url;

  _initHeaders(this);

  this.writable = true;
  this._redirects = 0;
  this.redirects(method === 'HEAD' ? 0 : 5);
  this.cookies = '';
  this.qs = {};
  this._query = [];
  this.qsRaw = this._query; // Unused, for backwards compatibility only
  this._redirectList = [];
  this._streamRequest = false;
  this.once('end', this.clearTimeout.bind(this));
}

/**
 * Inherit from `Stream` (which inherits from `EventEmitter`).
 * Mixin `RequestBase`.
 */
util.inherits(Request, Stream); // eslint-disable-next-line new-cap
RequestBase(Request.prototype);

/**
 * Enable or Disable http2.
 *
 * Enable http2.
 *
 * 