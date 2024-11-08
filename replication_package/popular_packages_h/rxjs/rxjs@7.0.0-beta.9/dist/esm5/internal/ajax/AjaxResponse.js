import { getXHRResponse } from './getXHRResponse';
var AjaxResponse = (function () {
    function AjaxResponse(originalEvent, xhr, request) {
        this.originalEvent = originalEvent;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
        this.responseType = xhr.responseType;
        this.response = getXHRResponse(xhr);
    }
    return AjaxResponse;
}());
export { AjaxResponse };
//# sourceMappingURL=AjaxResponse.js.map