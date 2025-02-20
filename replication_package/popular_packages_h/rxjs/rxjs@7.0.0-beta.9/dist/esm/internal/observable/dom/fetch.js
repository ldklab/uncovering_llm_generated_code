import { __rest } from "tslib";
import { OperatorSubscriber } from '../../operators/OperatorSubscriber';
import { Observable } from '../../Observable';
import { innerFrom } from '../../observable/from';
export function fromFetch(input, initWithSelector = {}) {
    const { selector } = initWithSelector, init = __rest(initWithSelector, ["selector"]);
    return new Observable((subscriber) => {
        const controller = new AbortController();
        const { signal } = controller;
        let abortable = true;
        let perSubscriberInit;
        if (init) {
            const { signal: outerSignal } = init;
            if (outerSignal) {
                if (outerSignal.aborted) {
                    controller.abort();
                }
                else {
                    const outerSignalHandler = () => {
                        if (!signal.aborted) {
                            controller.abort();
                        }
                    };
                    outerSignal.addEventListener('abort', outerSignalHandler);
                    subscriber.add(() => outerSignal.removeEventListener('abort', outerSignalHandler));
                }
            }
            perSubscriberInit = Object.assign(Object.assign({}, init), { signal });
        }
        else {
            perSubscriberInit = { signal };
        }
        const handleError = (err) => {
            abortable = false;
            subscriber.error(err);
        };
        fetch(input, perSubscriberInit)
            .then((response) => {
            if (selector) {
                innerFrom(selector(response)).subscribe(new OperatorSubscriber(subscriber, undefined, handleError, () => {
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
        return () => {
            if (abortable) {
                controller.abort();
            }
        };
    });
}
//# sourceMappingURL=fetch.js.map