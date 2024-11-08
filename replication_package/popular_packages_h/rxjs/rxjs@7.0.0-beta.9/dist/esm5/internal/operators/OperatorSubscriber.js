import { __extends } from "tslib";
import { Subscriber } from '../Subscriber';
var OperatorSubscriber = (function (_super) {
    __extends(OperatorSubscriber, _super);
    function OperatorSubscriber(destination, onNext, onError, onComplete, onUnsubscribe) {
        var _this = _super.call(this, destination) || this;
        _this.onUnsubscribe = onUnsubscribe;
        if (onNext) {
            _this._next = function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    this.destination.error(err);
                }
            };
        }
        if (onError) {
            _this._error = function (err) {
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
            _this._complete = function () {
                try {
                    onComplete();
                }
                catch (err) {
                    this.destination.error(err);
                }
                this.unsubscribe();
            };
        }
        return _this;
    }
    OperatorSubscriber.prototype.unsubscribe = function () {
        var _a;
        !this.closed && ((_a = this.onUnsubscribe) === null || _a === void 0 ? void 0 : _a.call(this));
        _super.prototype.unsubscribe.call(this);
    };
    return OperatorSubscriber;
}(Subscriber));
export { OperatorSubscriber };
//# sourceMappingURL=OperatorSubscriber.js.map