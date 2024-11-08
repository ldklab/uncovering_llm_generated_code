import { getXHRResponse } from './getXHRResponse';
export class AjaxResponse {
    constructor(originalEvent, xhr, request) {
        this.originalEvent = originalEvent;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
        this.responseType = xhr.responseType;
        this.response = getXHRResponse(xhr);
    }
}
//# sourceMappingURL=AjaxResponse.js.map