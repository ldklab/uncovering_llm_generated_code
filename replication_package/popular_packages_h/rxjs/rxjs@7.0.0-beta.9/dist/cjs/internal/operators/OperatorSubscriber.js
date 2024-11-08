"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorSubscriber = void 0;
var Subscriber_1 = require("../Subscriber");
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
}(Subscriber_1.Subscriber));
exports.OperatorSubscriber = OperatorSubscriber;
//# sourceMappingURL=OperatorSubscriber.js.map