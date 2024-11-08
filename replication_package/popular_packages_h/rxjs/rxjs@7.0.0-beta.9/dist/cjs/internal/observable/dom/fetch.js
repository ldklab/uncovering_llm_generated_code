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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromFetch = void 0;
var OperatorSubscriber_1 = require("../../operators/OperatorSubscriber");
var Observable_1 = require("../../Observable");
var from_1 = require("../../observable/from");
function fromFetch(input, initWithSelector) {
    if (initWithSelector === void 0) { initWithSelector = {}; }
    var selector = initWithSelector.selector, init = __rest(initWithSelector, ["selector"]);
    return new Observable_1.Observable(function (subscriber) {
        var controller = new AbortController();
        var signal = controller.signal;
        var abortable = true;
        var perSubscriberInit;
        if (init) {
            var outerSignal_1 = init.signal;
            if (outerSignal_1) {
                if (outerSignal_1.aborted) {
                    controller.abort();
                }
                else {
                    var outerSignalHandler_1 = function () {
                        if (!signal.aborted) {
                            controller.abort();
                        }
                    };
                    outerSignal_1.addEventListener('abort', outerSignalHandler_1);
                    subscriber.add(function () { return outerSignal_1.removeEventListener('abort', outerSignalHandler_1); });
                }
            }
            perSubscriberInit = __assign(__assign({}, init), { signal: signal });
        }
        else {
            perSubscriberInit = { signal: signal };
        }
        var handleError = function (err) {
            abortable = false;
            subscriber.error(err);
        };
        fetch(input, perSubscriberInit)
            .then(function (response) {
            if (selector) {
                from_1.innerFrom(selector(response)).subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, undefined, handleError, function () {
                    abortable = false;
                    subscriber.complete();
                }));
            }
            else {
                abortable = false;
                subscriber.next(response);
                subscriber.complete();
            }
        })
            .catch(handleError);
        return function () {
            if (abortable) {
                controller.abort();
            }
        };
    });
}
exports.fromFetch = fromFetch;
//# sourceMappingURL=fetch.js.map