"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var ZodOptional = (function (_super) {
    __extends(ZodOptional, _super);
    function ZodOptional() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.toJSON = function () { return ({
            t: _this._def.t,
            innerType: _this._def.innerType.toJSON(),
        }); };
        return _this;
    }
    ZodOptional.create = function (type) {
        if (type instanceof ZodOptional)
            return type;
        return new ZodOptional({
            t: base_1.ZodTypes.optional,
            innerType: type,
        });
    };
    return ZodOptional;
}(base_1.ZodType));
exports.ZodOptional = ZodOptional;
//# sourceMappingURL=optional.js.map