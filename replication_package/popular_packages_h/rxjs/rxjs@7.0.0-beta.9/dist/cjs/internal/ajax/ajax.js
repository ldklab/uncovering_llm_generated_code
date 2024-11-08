"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromAjax = exports.ajax = void 0;
var map_1 = require("../operators/map");
var Observable_1 = require("../Observable");
var AjaxResponse_1 = require("./AjaxResponse");
var errors_1 = require("./errors");
function ajaxGet(url, headers) {
    return exports.ajax({ method: 'GET', url: url, headers: headers });
}
function ajaxPost(url, body, headers) {
    return exports.ajax({ method: 'POST', url: url, body: body, headers: headers });
}
function ajaxDelete(url, headers) {
    return exports.ajax({ method: 'DELETE', url: url, headers: headers });
}
function ajaxPut(url, body, headers) {
    return exports.ajax({ method: 'PUT', url: url, body: body, headers: headers });
}
function ajaxPatch(url, body, headers) {
    return exports.ajax({ method: 'PATCH', url: url, body: body, headers: headers });
}
var mapResponse = map_1.map(function (x) { return x.response; });
function ajaxGetJSON(url, headers) {
    return mapResponse(exports.ajax({
        method: 'GET',
        url: url,
        headers: headers,
    }));
}
exports.ajax = (function () {
    var create = function (urlOrRequest) {
        var request = typeof urlOrRequest === 'string'
            ? {
                url: urlOrRequest,
            }
            : urlOrRequest;
        return fromAjax(request);
    };
    create.get = ajaxGet;
    create.post = ajaxPost;
    create.delete = ajaxDelete;
    create.put = ajaxPut;
    create.patch = ajaxPatch;
    create.getJSON = ajaxGetJSON;
    return create;
})();
function fromAjax(config) {
    return new Observable_1.Observable(function (destination) {
        var _a, _b;
        var headers = {};
        var requestHeaders = config.headers;
        if (requestHeaders) {
            for (var key in requestHeaders) {
                if (requestHeaders.hasOwnProperty(key)) {
                    headers[key.toLowerCase()] = requestHeaders[key];
                }
            }
        }
        if (!config.crossDomain && !('x-requested-with' in headers)) {
            headers['x-requested-with'] = 'XMLHttpRequest';
        }
        var withCredentials = config.withCredentials, xsrfCookieName = config.xsrfCookieName, xsrfHeaderName = config.xsrfHeaderName;
        if ((withCredentials || !config.crossDomain) && xsrfCookieName && xsrfHeaderName) {
            var xsrfCookie = (_b = (_a = document === null || document === void 0 ? void 0 : document.cookie.match(new RegExp("(^|;\\s*)(" + xsrfCookieName + ")=([^;]*)"))) === null || _a === void 0 ? void 0 : _a.pop()) !== null && _b !== void 0 ? _b : '';
            if (xsrfCookie) {
                headers[xsrfHeaderName] = xsrfCookie;
            }
        }
        var body = extractContentTypeAndMaybeSerializeBody(config.body, headers);
        var _request = __assign(__assign({ async: true, crossDomain: true, withCredentials: false, method: 'GET', timeout: 0, responseType: 'json' }, config), { headers: headers,
            body: body });
        var xhr;
        var url = _request.url;
        if (!url) {
            throw new TypeError('url is required');
        }
        xhr = config.createXHR ? config.createXHR() : new XMLHttpRequest();
        {
            var progressSubscriber_1 = config.progressSubscriber;
            xhr.ontimeout = function () {
                var _a;
                var timeoutError = new errors_1.AjaxTimeoutError(xhr, _request);
                (_a = progressSubscriber_1 === null || progressSubscriber_1 === void 0 ? void 0 : progressSubscriber_1.error) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber_1, timeoutError);
                destination.error(timeoutError);
            };
            if (progressSubscriber_1) {
                xhr.upload.onprogress = function (e) {
                    var _a;
                    (_a = progressSubscriber_1.next) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber_1, e);
                };
            }
            xhr.onerror = function (e) {
                var _a;
                (_a = progressSubscriber_1 === null || progressSubscriber_1 === void 0 ? void 0 : progressSubscriber_1.error) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber_1, e);
                destination.error(new errors_1.AjaxError('ajax error', xhr, _request));
            };
            xhr.onload = function (e) {
                var _a, _b;
                if (xhr.status < 400) {
                    (_a = progressSubscriber_1 === null || progressSubscriber_1 === void 0 ? void 0 : progressSubscriber_1.complete) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber_1);
                    var response = void 0;
                    try {
                        response = new AjaxResponse_1.AjaxResponse(e, xhr, _request);
                    }
                    catch (err) {
                        destination.error(err);
                        return;
                    }
                    destination.next(response);
                    destination.complete();
                }
                else {
                    (_b = progressSubscriber_1 === null || progressSubscriber_1 === void 0 ? void 0 : progressSubscriber_1.error) === null || _b === void 0 ? void 0 : _b.call(progressSubscriber_1, e);
                    destination.error(new errors_1.AjaxError('ajax error ' + xhr.status, xhr, _request));
                }
            };
        }
        var user = _request.user, method = _request.method, async = _request.async;
        if (user) {
            xhr.open(method, url, async, user, _request.password);
        }
        else {
            xhr.open(method, url, async);
        }
        if (async) {
            xhr.timeout = _request.timeout;
            xhr.responseType = _request.responseType;
        }
        if ('withCredentials' in xhr) {
            xhr.withCredentials = _request.withCredentials;
        }
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
        if (body) {
            xhr.send(body);
        }
        else {
            xhr.send();
        }
        return function () {
            if (xhr && xhr.readyState !== 4) {
                xhr.abort();
            }
        };
    });
}
exports.fromAjax = fromAjax;
function extractContentTypeAndMaybeSerializeBody(body, headers) {
    var _a;
    if (!body ||
        typeof body === 'string' ||
        isFormData(body) ||
        isURLSearchParams(body) ||
        isArrayBuffer(body) ||
        isFile(body) ||
        isBlob(body) ||
        isReadableStream(body)) {
        return body;
    }
    if (isArrayBufferView(body)) {
        return body.buffer;
    }
    if (typeof body === 'object') {
        headers['content-type'] = (_a = headers['content-type']) !== null && _a !== void 0 ? _a : 'application/json;charset=utf-8';
        return JSON.stringify(body);
    }
    throw new TypeError('Unknown body type');
}
var _toString = Object.prototype.toString;
function toStringCheck(obj, name) {
    return _toString.call(obj) === "[object " + name + "]";
}
function isArrayBuffer(body) {
    return toStringCheck(body, 'ArrayBuffer');
}
function isFile(body) {
    return toStringCheck(body, 'File');
}
function isBlob(body) {
    return toStringCheck(body, 'Blob');
}
function isArrayBufferView(body) {
    return typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body);
}
function isFormData(body) {
    return typeof FormData !== 'undefined' && body instanceof FormData;
}
function isURLSearchParams(body) {
    return typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
}
function isReadableStream(body) {
    return typeof ReadableStream !== 'undefined' && body instanceof ReadableStream;
}
//# sourceMappingURL=ajax.js.map