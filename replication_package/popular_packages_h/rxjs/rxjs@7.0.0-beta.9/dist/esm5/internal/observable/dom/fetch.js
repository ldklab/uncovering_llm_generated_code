import { __assign, __rest } from "tslib";
import { OperatorSubscriber } from '../../operators/OperatorSubscriber';
import { Observable } from '../../Observable';
import { innerFrom } from '../../observable/from';
export function fromFetch(input, initWithSelector) {
    if (initWithSelector === void 0) { initWithSelector = {}; }
    var selector = initWithSelector.selector, init = __rest(initWithSelector, ["selector"]);
    return new Observable(function (subscriber) {
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
                innerFrom(selector(response)).subscribe(new OperatorSubscriber(subscriber, undefined, handleError, function () {
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
//# sourceMappingURL=fetch.js.map