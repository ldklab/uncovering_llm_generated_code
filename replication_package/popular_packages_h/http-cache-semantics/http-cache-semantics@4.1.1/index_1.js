'use strict';

const statusCodeCacheableByDefault = new Set([200, 203, 204, 206, 300, 301, 308, 404, 405, 410, 414, 501]);
const understoodStatuses = new Set([200, 203, 204, 300, 301, 302, 303, 307, 308, 404, 405, 410, 414, 501]);
const errorStatusCodes = new Set([500, 502, 503, 504]);

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

const excludedFromRevalidationUpdate = {
    'content-length': true,
    'content-encoding': true,
    'transfer-encoding': true,
    'content-range': true,
};

function toNumberOrZero(s) {
    const n = parseInt(s, 10);
    return isFinite(n) ? n : 0;
}

function isErrorResponse(response) {
    return !response || errorStatusCodes.has(response.status);
}

function parseCacheControl(header) {
    const cc = {};
    if (!header) return cc;
    
    const parts = header.trim().split(/,/);
    for (const part of parts) {
        const [k, v] = part.split(/=/, 2);
        cc[k.trim()] = v === undefined ? true : v.trim().replace(/^"|"$/g, '');
    }
    return cc;
}

function formatCacheControl(cc) {
    const parts = [];
    for (const k in cc) {
        const v = cc[k];
        parts.push(v === true ? k : `${k}=${v}`);
    }
    return parts.length ? parts.join(', ') : undefined;
}

module.exports = class CachePolicy {
    constructor(req, res, options = {}) {
        const {
            shared,
            cacheHeuristic = 0.1,
            immutableMinTimeToLive = 24 * 3600 * 1000,
            ignoreCargoCult,
            _fromObject,
        } = options;

        if (_fromObject) {
            this._fromObject(_fromObject);
            return;
        }

        if (!res || !res.headers) {
            throw Error('Response headers missing');
        }

        this._assertRequestHasHeaders(req);
        this._responseTime = this.now();
        this._isShared = shared !== false;
        this._cacheHeuristic = cacheHeuristic;
        this._immutableMinTtl = immutableMinTimeToLive;
        this._status = res.status || 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers['cache-control']);
        this._method = req.method || 'GET';
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null;
        this._reqcc = parseCacheControl(req.headers['cache-control']);

        if (ignoreCargoCult && this._rescc['pre-check'] && this._rescc['post-check']) {
            delete this._rescc['pre-check'];
            delete this._rescc['post-check'];
            delete this._rescc['no-cache'];
            delete this._rescc['no-store'];
            delete this._rescc['must-revalidate'];
            this._resHeaders = { ...this._resHeaders, 'cache-control': formatCacheControl(this._rescc) };
            delete this._resHeaders.expires;
            delete this._resHeaders.pragma;
        }

        if (!res.headers['cache-control'] && /no-cache/.test(res.headers.pragma)) {
            this._rescc['no-cache'] = true;
        }
    }

    now() {
        return Date.now();
    }

    storable() {
        return !this._reqcc['no-store'] &&
            (['GET', 'HEAD'].includes(this._method) || ('POST' === this._method && this._hasExplicitExpiration())) &&
            understoodStatuses.has(this._status) &&
            !this._rescc['no-store'] &&
            (!this._isShared || !this._rescc.private) &&
            (!this._isShared || this._noAuthorization || this._allowsStoringAuthenticated()) &&
            (this._resHeaders.expires || this._rescc['max-age'] || (this._isShared && this._rescc['s-maxage']) || this._rescc.public || statusCodeCacheableByDefault.has(this._status));
    }

    _hasExplicitExpiration() {
        return (this._isShared && this._rescc['s-maxage']) || this._rescc['max-age'] || this._resHeaders.expires;
    }

    _assertRequestHasHeaders(req) {
        if (!req || !req.headers) {
            throw Error('Request headers missing');
        }
    }

    satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);
        const requestCC = parseCacheControl(req.headers['cache-control']);

        if (requestCC['no-cache'] || /no-cache/.test(req.headers.pragma)) {
            return false;
        }

        if (requestCC['max-age'] && this.age() > requestCC['max-age']) {
            return false;
        }

        if (requestCC['min-fresh'] && this.timeToLive() < 1000 * requestCC['min-fresh']) {
            return false;
        }

        if (this.stale()) {
            const allowsStale = requestCC['max-stale'] && !this._rescc['must-revalidate'] && (true === requestCC['max-stale'] || requestCC['max-stale'] > this.age() - this.maxAge());
            if (!allowsStale) {
                return false;
            }
        }

        return this._requestMatches(req, false);
    }

    _requestMatches(req, allowHeadMethod) {
        return (!this._url || this._url === req.url) &&
            this._host === req.headers.host &&
            (!req.method || this._method === req.method || (allowHeadMethod && 'HEAD' === req.method)) &&
            this._varyMatches(req);
    }

    _allowsStoringAuthenticated() {
        return this._rescc['must-revalidate'] || this._rescc.public || this._rescc['s-maxage'];
    }

    _varyMatches(req) {
        if (!this._resHeaders.vary) {
            return true;
        }

        if (this._resHeaders.vary === '*') {
            return false;
        }

        const fields = this._resHeaders.vary.trim().toLowerCase().split(/\s*,\s*/);
        for (const name of fields) {
            if (req.headers[name] !== this._reqHeaders[name]) return false;
        }
        return true;
    }

    _copyWithoutHopByHopHeaders(inHeaders) {
        const headers = {};
        for (const name in inHeaders) {
            if (hopByHopHeaders[name]) continue;
            headers[name] = inHeaders[name];
        }

        if (inHeaders.connection) {
            const tokens = inHeaders.connection.trim().split(/\s*,\s*/);
            for (const name of tokens) {
                delete headers[name];
            }
        }
        if (headers.warning) {
            const warnings = headers.warning.split(/,/).filter(warning => !/^\s*1[0-9][0-9]/.test(warning));
            headers.warning = warnings.length ? warnings.join(',').trim() : undefined;
        }
        return headers;
    }

    responseHeaders() {
        const headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        const age = this.age();

        if (age > 3600 * 24 && !this._hasExplicitExpiration() && this.maxAge() > 3600 * 24) {
            headers.warning = `${headers.warning || ''}, 113 - "rfc7234 5.5.4"`.trim();
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
        if (!this.storable() || this._rescc['no-cache']) {
            return 0;
        }

        if (this._isShared && this._resHeaders['set-cookie'] && !this._rescc.public && !this._rescc.immutable) {
            return 0;
        }

        if (this._resHeaders.vary === '*') {
            return 0;
        }

        if (this._isShared && this._rescc['proxy-revalidate']) {
            return 0;
        }

        if (this._isShared && this._rescc['s-maxage']) {
            return toNumberOrZero(this._rescc['s-maxage']);
        }

        if (this._rescc['max-age']) {
            return toNumberOrZero(this._rescc['max-age']);
        }

        const defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;
        const serverDate = this.date();

        if (this._resHeaders.expires) {
            const expires = Date.parse(this._resHeaders.expires);
            if (Number.isNaN(expires) || expires < serverDate) {
                return 0;
            }
            return Math.max(defaultMinTtl, (expires - serverDate) / 1000);
        }

        if (this._resHeaders['last-modified']) {
            const lastModified = Date.parse(this._resHeaders['last-modified']);
            if (isFinite(lastModified) && serverDate > lastModified) {
                return Math.max(defaultMinTtl, ((serverDate - lastModified) / 1000) * this._cacheHeuristic);
            }
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

    revalidationHeaders(incomingReq) {
        this._assertRequestHasHeaders(incomingReq);
        const headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);

        delete headers['if-range'];

        if (!this._requestMatches(incomingReq, true) || !this.storable()) {
            delete headers['if-none-match'];
            delete headers['if-modified-since'];
            return headers;
        }

        if (this._resHeaders.etag) {
            headers['if-none-match'] = headers['if-none-match']
                ? `${headers['if-none-match']}, ${this._resHeaders.etag}`
                : this._resHeaders.etag;
        }

        const forbidsWeakValidators = headers['accept-ranges'] ||
            headers['if-match'] ||
            headers['if-unmodified-since'] ||
            (this._method && this._method !== 'GET');

        if (forbidsWeakValidators) {
            delete headers['if-modified-since'];

            if (headers['if-none-match']) {
                const etags = headers['if-none-match'].split(/,/).filter(etag => !/^\s*W\//.test(etag));
                headers['if-none-match'] = etags.length ? etags.join(',').trim() : undefined;
            }
        } else if (this._resHeaders['last-modified'] && !headers['if-modified-since']) {
            headers['if-modified-since'] = this._resHeaders['last-modified'];
        }

        return headers;
    }

    revalidatedPolicy(request, response) {
        this._assertRequestHasHeaders(request);
        if (this._useStaleIfError() && isErrorResponse(response)) {
            return {
                modified: false,
                matches: false,
                policy: this,
            };
        }

        if (!response || !response.headers) {
            throw Error('Response headers missing');
        }

        let matches = false;
        if (response.status !== undefined && response.status != 304) {
            matches = false;
        } else if (response.headers.etag && !/^\s*W\//.test(response.headers.etag)) {
            matches = this._resHeaders.etag && this._resHeaders.etag.replace(/^\s*W\//, '') === response.headers.etag;
        } else if (this._resHeaders.etag && response.headers.etag) {
            matches = this._resHeaders.etag.replace(/^\s*W\//, '') === response.headers.etag.replace(/^\s*W\//, '');
        } else if (this._resHeaders['last-modified']) {
            matches = this._resHeaders['last-modified'] === response.headers['last-modified'];
        } else if (!this._resHeaders.etag && !this._resHeaders['last-modified'] && !response.headers.etag && !response.headers['last-modified']) {
            matches = true;
        }

        if (!matches) {
            return {
                policy: new this.constructor(request, response),
                modified: response.status != 304,
                matches: false,
            };
        }

        const updatedHeaders = {};
        for (const k in this._resHeaders) {
            updatedHeaders[k] = k in response.headers && !excludedFromRevalidationUpdate[k] ? response.headers[k] : this._resHeaders[k];
        }

        const newResponse = { ...response, status: this._status, method: this._method, headers: updatedHeaders };
        return {
            policy: new this.constructor(request, newResponse, {
                shared: this._isShared,
                cacheHeuristic: this._cacheHeuristic,
                immutableMinTimeToLive: this._immutableMinTtl,
            }),
            modified: false,
            matches: true,
        };
    }
};
