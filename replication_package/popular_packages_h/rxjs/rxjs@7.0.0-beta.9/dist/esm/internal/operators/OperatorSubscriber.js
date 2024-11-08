import { Subscriber } from '../Subscriber';
export class OperatorSubscriber extends Subscriber {
    constructor(destination, onNext, onError, onComplete, onUnsubscribe) {
        super(destination);
        this.onUnsubscribe = onUnsubscribe;
        if (onNext) {
            this._next = function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    this.destination.error(err);
                }
            };
        }
        if (onError) {
            this._error = function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    this.destination.error(err);
                }
                this.unsubscribe();
            };
        }
        if (onComplete) {
            this._complete = function () {
                try {
                    onComplete();
                }
                catch (err) {
                    this.destination.error(err);
                }
                this.unsubscribe();
            };
        }
    }
    unsubscribe() {
        var _a;
        !this.closed && ((_a = this.onUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(this));
        super.unsubscribe();
    }
}
//# sourceMappingURL=OperatorSubscriber.js.map