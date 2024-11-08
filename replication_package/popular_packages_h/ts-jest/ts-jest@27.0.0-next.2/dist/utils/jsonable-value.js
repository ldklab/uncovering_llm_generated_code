"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonableValue = void 0;
var json_1 = require("./json");
var JsonableValue = (function () {
    function JsonableValue(value) {
        this.value = value;
    }
    Object.defineProperty(JsonableValue.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            this._serialized = json_1.stringify(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(JsonableValue.prototype, "serialized", {
        get: function () {
            return this._serialized;
        },
        enumerable: false,
        configurable: true
    });
    JsonableValue.prototype.valueOf = function () {
        return this._value;
    };
    JsonableValue.prototype.toString = function () {
        return this._serialized;
    };
    return JsonableValue;
}());
exports.JsonableValue = JsonableValue;
