"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjaxResponse = void 0;
var getXHRResponse_1 = require("./getXHRResponse");
var AjaxResponse = (function () {
    function AjaxResponse(originalEvent, xhr, request) {
        this.originalEvent = originalEvent;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
        this.responseType = xhr.responseType;
        this.response = getXHRResponse_1.getXHRResponse(xhr);
    }
    return AjaxResponse;
}());
exports.AjaxResponse = AjaxResponse;
//# sourceMappingURL=AjaxResponse.js.map