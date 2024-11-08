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
exports.ReplaySubject = void 0;
var Subject_1 = require("./Subject");
var dateTimestampProvider_1 = require("./scheduler/dateTimestampProvider");
var ReplaySubject = (function (_super) {
    __extends(ReplaySubject, _super);
    function ReplaySubject(bufferSize, windowTime, timestampProvider) {
        if (bufferSize === void 0) { bufferSize = Infinity; }
        if (windowTime === void 0) { windowTime = Infinity; }
        if (timestampProvider === void 0) { timestampProvider = dateTimestampProvider_1.dateTimestampProvider; }
        var _this = _super.call(this) || this;
        _this.bufferSize = bufferSize;
        _this.windowTime = windowTime;
        _this.timestampProvider = timestampProvider;
        _this.buffer = [];
        _this.infiniteTimeWindow = true;
        _this.infiniteTimeWindow = windowTime === Infinity;
        _this.bufferSize = Math.max(1, bufferSize);
        _this.windowTime = Math.max(1, windowTime);
        return _this;
    }
    ReplaySubject.prototype.next = function (value) {
        var _a = this, isStopped = _a.isStopped, buffer = _a.buffer, infiniteTimeWindow = _a.infiniteTimeWindow, timestampProvider = _a.timestampProvider, windowTime = _a.windowTime;
        if (!isStopped) {
            buffer.push(value);
            !infiniteTimeWindow && buffer.push(timestampProvider.now() + windowTime);
        }
        this.trimBuffer();
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this.trimBuffer();
        var subscription = this._innerSubscribe(subscriber);
        var _a = this, infiniteTimeWindow = _a.infiniteTimeWindow, buffer = _a.buffer;
        var copy = buffer.slice();
        for (var i = 0; i < copy.length && !subscriber.closed; i += infiniteTimeWindow ? 1 : 2) {
            subscriber.next(copy[i]);
        }
        this._checkFinalizedStatuses(subscriber);
        return subscription;
    };
    ReplaySubject.prototype.trimBuffer = function () {
        var _a = this, bufferSize = _a.bufferSize, timestampProvider = _a.timestampProvider, buffer = _a.buffer, infiniteTimeWindow = _a.infiniteTimeWindow;
        var adjustedBufferSize = (infiniteTimeWindow ? 1 : 2) * bufferSize;
        bufferSize < Infinity && adjustedBufferSize < buffer.length && buffer.splice(0, buffer.length - adjustedBufferSize);
        if (!infiniteTimeWindow) {
            var now = timestampProvider.now();
            var last = 0;
            for (var i = 1; i < buffer.length && buffer[i] <= now; i += 2) {
                last = i;
            }
            last && buffer.splice(0, last + 1);
        }
    };
    return ReplaySubject;
}(Subject_1.Subject));
exports.ReplaySubject = ReplaySubject;
//# sourceMappingURL=ReplaySubject.js.map