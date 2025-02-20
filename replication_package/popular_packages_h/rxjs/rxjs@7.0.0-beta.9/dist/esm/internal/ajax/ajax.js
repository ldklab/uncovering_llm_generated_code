import { map } from '../operators/map';
import { Observable } from '../Observable';
import { AjaxResponse } from './AjaxResponse';
import { AjaxTimeoutError, AjaxError } from './errors';
function ajaxGet(url, headers) {
    return ajax({ method: 'GET', url, headers });
}
function ajaxPost(url, body, headers) {
    return ajax({ method: 'POST', url, body, headers });
}
function ajaxDelete(url, headers) {
    return ajax({ method: 'DELETE', url, headers });
}
function ajaxPut(url, body, headers) {
    return ajax({ method: 'PUT', url, body, headers });
}
function ajaxPatch(url, body, headers) {
    return ajax({ method: 'PATCH', url, body, headers });
}
const mapResponse = map((x) => x.response);
function ajaxGetJSON(url, headers) {
    return mapResponse(ajax({
        method: 'GET',
        url,
        headers,
    }));
}
export const ajax = (() => {
    const create = (urlOrRequest) => {
        const request = typeof urlOrRequest === 'string'
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
export function fromAjax(config) {
    return new Observable((destination) => {
        var _a, _b;
        const headers = {};
        const requestHeaders = config.headers;
        if (requestHeaders) {
            for (const key in requestHeaders) {
                if (requestHeaders.hasOwnProperty(key)) {
                    headers[key.toLowerCase()] = requestHeaders[key];
                }
            }
        }
        if (!config.crossDomain && !('x-requested-with' in headers)) {
            headers['x-requested-with'] = 'XMLHttpRequest';
        }
        const { withCredentials, xsrfCookieName, xsrfHeaderName } = config;
        if ((withCredentials || !config.crossDomain) && xsrfCookieName && xsrfHeaderName) {
            const xsrfCookie = (_b = (_a = document === null || document === void 0 ? void 0 : document.cookie.match(new RegExp(`(^|;\\s*)(${xsrfCookieName})=([^;]*)`))) === null || _a === void 0 ? void 0 : _a.pop()) !== null && _b !== void 0 ? _b : '';
            if (xsrfCookie) {
                headers[xsrfHeaderName] = xsrfCookie;
            }
        }
        const body = extractContentTypeAndMaybeSerializeBody(config.body, headers);
        const _request = Object.assign(Object.assign({ async: true, crossDomain: true, withCredentials: false, method: 'GET', timeout: 0, responseType: 'json' }, config), { headers,
            body });
        let xhr;
        const { url } = _request;
        if (!url) {
            throw new TypeError('url is required');
        }
        xhr = config.createXHR ? config.createXHR() : new XMLHttpRequest();
        {
            const progressSubscriber = config.progressSubscriber;
            xhr.ontimeout = () => {
                var _a;
                const timeoutError = new AjaxTimeoutError(xhr, _request);
                (_a = progressSubscriber === null || progressSubscriber === void 0 ? void 0 : progressSubscriber.error) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber, timeoutError);
                destination.error(timeoutError);
            };
            if (progressSubscriber) {
                xhr.upload.onprogress = (e) => {
                    var _a;
                    (_a = progressSubscriber.next) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber, e);
                };
            }
            xhr.onerror = (e) => {
                var _a;
                (_a = progressSubscriber === null || progressSubscriber === void 0 ? void 0 : progressSubscriber.error) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber, e);
                destination.error(new AjaxError('ajax error', xhr, _request));
            };
            xhr.onload = (e) => {
                var _a, _b;
                if (xhr.status < 400) {
                    (_a = progressSubscriber === null || progressSubscriber === void 0 ? void 0 : progressSubscriber.complete) === null || _a === void 0 ? void 0 : _a.call(progressSubscriber);
                    let response;
                    try {
                        response = new AjaxResponse(e, xhr, _request);
                    }
                    catch (err) {
                        destination.error(err);
                        return;
                    }
                    destination.next(response);
                    destination.complete();
                }
                else {
                    (_b = progressSubscriber === null || progressSubscriber === void 0 ? void 0 : progressSubscriber.error) === null || _b === void 0 ? void 0 : _b.call(progressSubscriber, e);
                    destination.error(new AjaxError('ajax error ' + xhr.status, xhr, _request));
                }
            };
        }
        const { user, method, async } = _request;
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
        for (const key in headers) {
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
        return () => {
            if (xhr && xhr.readyState !== 4) {
                xhr.abort();
            }
        };
    });
}
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
const _toString = Object.prototype.toString;
function toStringCheck(obj, name) {
    return _toString.call(obj) === `[object ${name}]`;
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