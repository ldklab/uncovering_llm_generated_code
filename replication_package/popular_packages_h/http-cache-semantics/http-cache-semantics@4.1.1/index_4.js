'use strict';

// Set of HTTP status codes considered cacheable by default according to RFC 7231
const defaultCacheableStatusCodes = new Set([
    200, 203, 204, 206, 300, 301, 308, 404, 405, 410, 414, 501,
]);

// Status codes understood by this implementation (no partial response support)
const supportedStatusCodes = new Set([
    200, 203, 204, 300, 301, 302, 303, 307, 308, 404, 405, 410, 414, 501,
]);

// Set of error status codes
const errorStatusCodes = new Set([500, 502, 503, 504]);

// List of hop-by-hop headers that should not be transferred between requests and responses
const hopByHopHeaders = {
    date: true,
    connection: true,
    'keep-alive': true,
    'proxy-authenticate': true,
    'proxy-authorization': true,
    te: true,
    trailer: true,
    'transfer-encoding': true,
    upgrade: true,
};

// Headers not to be updated during revalidation
const revalidationExclusions = {
    'content-length': true,
    'content-encoding': true,
    'transfer-encoding': true,
    'content-range': true,
};

// Utility to convert a string to a number or zero
function toNumberOrZero(s) {
    const n = parseInt(s, 10);
    return isFinite(n) ? n : 0;
}

// Checks if the response is an error
function isErrorResponse(response) {
    return !response || errorStatusCodes.has(response.status);
}

// Parses Cache-Control headers
function parseCacheControl(header) {
    const cc = {};
    if (!header) return cc;

    const parts = header.trim().split(/,/);
    parts.forEach(part => {
        const [k, v] = part.split(/=/, 2);
        cc[k.trim()] = v === undefined ? true : v.trim().replace(/^"|"$/g, '');
    });

    return cc;
}

// Formats Cache-Control object back into a header string
function formatCacheControl(cc) {
    const parts = Object.entries(cc).map(([k, v]) => (v === true ? k : `${k}=${v}`));
    return parts.length ? parts.join(', ') : undefined;
}

// Definition of the CachePolicy class
module.exports = class CachePolicy {
    constructor(req, res, options = {}) {
        if (options._fromObject) {
            this._fromObject(options._fromObject);
            return;
        }

        if (!res || !res.headers) throw Error('Response headers missing');
        this._assertRequestHasHeaders(req);

        this._initializePolicy(req, res, options);
    }

    _initializePolicy(req, res, options) {
        this._responseTime = this.now();
        this._isShared = options.shared !== false;
        this._cacheHeuristic = options.cacheHeuristic !== undefined ? options.cacheHeuristic : 0.1;
        this._immutableMinTtl = options.immutableMinTimeToLive !== undefined ? options.immutableMinTimeToLive : 24 * 3600 * 1000;

        this._status = 'status' in res ? res.status : 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers['cache-control']);
        this._method = 'method' in req ? req.method : 'GET';
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null;
        this._reqcc = parseCacheControl(req.headers['cache-control']);

        this._handleCacheControlDirectives(options);
    }

    _handleCacheControlDirectives(options) {
        if (options.ignoreCargoCult && 'pre-check' in this._rescc && 'post-check' in this._rescc) {
            ['pre-check', 'post-check', 'no-cache', 'no-store', 'must-revalidate'].forEach(key => delete this._rescc[key]);
            this._resHeaders = { ...this._resHeaders, 'cache-control': formatCacheControl(this._rescc) };
            delete this._resHeaders.expires;
            delete this._resHeaders.pragma;
        }

        if (!this._resHeaders['cache-control'] && /no-cache/.test(this._resHeaders.pragma)) {
            this._rescc['no-cache'] = true;
        }
    }

    now() {
        return Date.now();
    }

    storable() {
        const { 'no-store': noStoreReq } = this._reqcc;
        const { 'no-store': noStoreRes, private, public: isPublic, 's-maxage': sMaxage } = this._rescc;

        return !!(
            !noStoreReq &&
            (this._method === 'GET' || this._method === 'HEAD' || (this._method === 'POST' && this._hasExplicitExpiration())) &&
            supportedStatusCodes.has(this._status) &&
            !noStoreRes &&
            (!this._isShared || !private) &&
            (!this._isShared || this._noAuthorization || this._allowsStoringAuthenticated()) &&
            (this._resHeaders.expires || this._rescc['max-age'] || (this._isShared && sMaxage) || isPublic || defaultCacheableStatusCodes.has(this._status))
        );
    }

    _hasExplicitExpiration() {
        return this._rescc['s-maxage'] || this._rescc['max-age'] || this._resHeaders.expires;
    }

    _assertRequestHasHeaders(req) {
        if (!req || !req.headers) throw Error('Request headers missing');
    }

    satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);
        const requestCC = parseCacheControl(req.headers['cache-control']);

        if (requestCC['no-cache'] || /no-cache/.test(req.headers.pragma)) return false;
        if (requestCC['max-age'] && this.age() > requestCC['max-age']) return false;
        if (requestCC['min-fresh'] && this.timeToLive() < 1000 * requestCC['min-fresh']) return false;

        if (this.stale() && !(requestCC['max-stale'] && !this._rescc['must-revalidate'] && (true === requestCC['max-stale'] || requestCC['max-stale'] > this.age() - this.maxAge())))
            return false;

        return this._requestMatches(req, false);
    }

    _requestMatches(req, allowHeadMethod) {
        return (
            (!this._url || this._url === req.url) &&
            this._host === req.headers.host &&
            (!req.method || this._method === req.method || (allowHeadMethod && req.method === 'HEAD')) &&
            this._varyMatches(req)
        );
    }

    _allowsStoringAuthenticated() {
        const { 'must-revalidate': mustRevalidate, public: isPublic, 's-maxage': sMaxage } = this._rescc;
        return mustRevalidate || isPublic || sMaxage;
    }

    _varyMatches(req) {
        if (!this._resHeaders.vary) return true;
        if (this._resHeaders.vary === '*') return false;

        return this._resHeaders.vary
            .trim()
            .toLowerCase()
            .split(/\s*,\s*/)
            .every(name => req.headers[name] === this._reqHeaders[name]);
    }

    _copyWithoutHopByHopHeaders(inHeaders) {
        const headers = Object.entries(inHeaders).reduce((acc, [name, value]) => {
            if (!hopByHopHeaders[name]) acc[name] = value;
            return acc;
        }, {});

        if (inHeaders.connection) {
            inHeaders.connection.trim().split(/\s*,\s*/).forEach(name => delete headers[name]);
        }

        if (headers.warning) {
            const warnings = headers.warning.split(/,/).filter(warning => !/^\s*1[0-9][0-9]/.test(warning));
            headers.warning = warnings.length ? warnings.join(',').trim() : null;
        }

        return headers;
    }

    responseHeaders() {
        const headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        const age = this.age();

        if (age > 3600 * 24 && !this._hasExplicitExpiration() && this.maxAge() > 3600 * 24) {
            headers.warning = (headers.warning ? `${headers.warning}, ` : '') + '113 - "rfc7234 5.5.4"';
        }
        headers.age = `${Math.round(age)}`;
        headers.date = new Date(this.now()).toUTCString();
        return headers;
    }

    date() {
        const serverDate = Date.parse(this._resHeaders.date);
        return isFinite(serverDate) ? serverDate : this._responseTime;
    }

    age() {
        return this._ageValue() + (this.now() - this._responseTime) / 1000;
    }

    _ageValue() {
        return toNumberOrZero(this._resHeaders.age);
    }

    maxAge() {
        const { 'no-cache': noCache, immutable } = this._rescc;
        if (!this.storable() || noCache) return 0;

        if (this._isShared && this._resHeaders['set-cookie'] && !this._rescc.public && !immutable) return 0;

        if (this._resHeaders.vary === '*') return 0;

        if (this._isShared) {
            if (this._rescc['proxy-revalidate']) return 0;
            if (this._rescc['s-maxage']) return toNumberOrZero(this._rescc['s-maxage']);
        }

        if (this._rescc['max-age']) return toNumberOrZero(this._rescc['max-age']);

        const defaultMinTtl = immutable ? this._immutableMinTtl : 0;

        if (this._resHeaders.expires) {
            const expires = Date.parse(this._resHeaders.expires);
            return Number.isNaN(expires) || expires < this.date() ? 0 : Math.max(defaultMinTtl, (expires - this.date()) / 1000);
        }

        if (this._resHeaders['last-modified']) {
            const lastModified = Date.parse(this._resHeaders['last-modified']);
            return isFinite(lastModified) && this.date() > lastModified
                ? Math.max(defaultMinTtl, ((this.date() - lastModified) / 1000) * this._cacheHeuristic) 
                : 0;
        }

        return defaultMinTtl;
    }

    timeToLive() {
        const age = this.maxAge() - this.age();
        const staleIfErrorAge = age + toNumberOrZero(this._rescc['stale-if-error']);
        const staleWhileRevalidateAge = age + toNumberOrZero(this._rescc['stale-while-revalidate']);
        return Math.max(0, age, staleIfErrorAge, staleWhileRevalidateAge) * 1000;
    }

    stale() {
        return this.maxAge() <= this.age();
    }

    _useStaleIfError() {
        return this.maxAge() + toNumberOrZero(this._rescc['stale-if-error']) > this.age();
    }

    useStaleWhileRevalidate() {
        return this.maxAge() + toNumberOrZero(this._rescc['stale-while-revalidate']) > this.age();
    }

    static fromObject(obj) {
        return new this(undefined, undefined, { _fromObject: obj });
    }

    _fromObject(obj) {
        if (this._responseTime) throw Error('Reinitialized');
        if (!obj || obj.v !== 1) throw Error('Invalid serialization');

        this._responseTime = obj.t;
        this._isShared = obj.sh;
        this._cacheHeuristic = obj.ch;
        this._immutableMinTtl = obj.imm !== undefined ? obj.imm : 24 * 3600 * 1000;
        this._status = obj.st;
        this._resHeaders = obj.resh;
        this._rescc = obj.rescc;
        this._method = obj.m;
        this._url = obj.u;
        this._host = obj.h;
        this._noAuthorization = obj.a;
        this._reqHeaders = obj.reqh;
        this._reqcc = obj.reqcc;
    }

    toObject() {
        return {
            v: 1,
            t: this._responseTime,
            sh: this._isShared,
            ch: this._cacheHeuristic,
            imm: this._immutableMinTtl,
            st: this._status,
            resh: this._resHeaders,
            rescc: this._rescc,
            m: this._method,
            u: this._url,
            h: this._host,
            a: this._noAuthorization,
            reqh: this._reqHeaders,
            reqcc: this._reqcc,
        };
    }

    revalidationHeaders(req) {
        this._assertRequestHasHeaders(req);
        const headers = this._copyWithoutHopByHopHeaders(req.headers);

        delete headers['if-range'];

        if (!this._requestMatches(req, true) || !this.storable()) {
            delete headers['if-none-match'];
            delete headers['if-modified-since'];
            return headers;
        }

        if (this._resHeaders.etag) {
            headers['if-none-match'] = headers['if-none-match']
                ? `${headers['if-none-match']}, ${this._resHeaders.etag}`
                : this._resHeaders.etag;
        }

        const forbidsWeakValidators = headers['accept-ranges'] || headers['if-match'] || headers['if-unmodified-since'] || (this._method && this._method !== 'GET');

        if (forbidsWeakValidators) {
            delete headers['if-modified-since'];
            if (headers['if-none-match']) {
                const etags = headers['if-none-match'].split(/,/).filter(etag => !/^\s*W\//.test(etag));
                headers['if-none-match'] = etags.length ? etags.join(',').trim() : null;
            }
        } else if (this._resHeaders['last-modified'] && !headers['if-modified-since']) {
            headers['if-modified-since'] = this._resHeaders['last-modified'];
        }

        return headers;
    }

    revalidatedPolicy(req, response) {
        this._assertRequestHasHeaders(req);

        if (this._useStaleIfError() && isErrorResponse(response)) {
            return { modified: false, matches: false, policy: this };
        }

        if (!response || !response.headers) throw Error('Response headers missing');

        const matches = this._determineIfMatches(response);
        if (!matches) {
            return {
                policy: new this.constructor(req, response),
                modified: response.status !== 304,
                matches: false,
            };
        }

        const newResponse = this._createUpdatedResponse(response);
        return {
            policy: new this.constructor(req, newResponse, { shared: this._isShared, cacheHeuristic: this._cacheHeuristic, immutableMinTimeToLive: this._immutableMinTtl }),
            modified: false,
            matches: true,
        };
    }

    _determineIfMatches(response) {
        if (response.status !== undefined && response.status != 304) return false;

        if (response.headers.etag && !/^\s*W\//.test(response.headers.etag)) {
            return this._resHeaders.etag && this._resHeaders.etag.replace(/^\s*W\//, '') === response.headers.etag;
        }

        if (this._resHeaders.etag && response.headers.etag) {
            return this._resHeaders.etag.replace(/^\s*W\//, '') === response.headers.etag.replace(/^\s*W\//, '');
        }

        if (this._resHeaders['last-modified']) {
            return this._resHeaders['last-modified'] === response.headers['last-modified'];
        }

        return !this._resHeaders.etag && !this._resHeaders['last-modified'] && !response.headers.etag && !response.headers['last-modified'];
    }

    _createUpdatedResponse(response) {
        const headers = { ...this._resHeaders };

        for (const key in response.headers) {
            if (!revalidationExclusions[key]) {
                headers[key] = response.headers[key];
            }
        }

        return { ...response, status: this._status, method: this._method, headers };
    }
};
