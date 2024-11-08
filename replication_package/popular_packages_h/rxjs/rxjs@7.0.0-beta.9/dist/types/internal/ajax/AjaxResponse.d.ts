/** @prettier */
import { AjaxRequest } from './types';
/**
 * A normalized response from an AJAX request. To get the data from the response,
 * you will want to read the `response` property.
 *
 * - DO NOT create instances of this class directly.
 * - DO NOT subclass this class.
 *
 * @see {@link ajax}
 */
export declare class AjaxResponse<T> {
    readonly originalEvent: Event;
    readonly xhr: XMLHttpRequest;
    readonly request: AjaxRequest;
    /** The HTTP status code */
    readonly status: number;
    /** The response data */
    readonly response: T;
    /**  The responseType from the response. (For example: `""`, "arraybuffer"`, "blob"`, "document"`, "json"`, or `"text"`) */
    readonly responseType: XMLHttpRequestResponseType;
    /**
     * A normalized response from an AJAX request. To get the data from the response,
     * you will want to read the `response` property.
     *
     * - DO NOT create instances of this class directly.
     * - DO NOT subclass this class.
     *
     * @param originalEvent The original event object from the XHR `onload` event.
     * @param xhr The `XMLHttpRequest` object used to make the request. This is useful for examining status code, etc.
     * @param request The request settings used to make the HTTP request.
     */
    constructor(originalEvent: Event, xhr: XMLHttpRequest, request: AjaxRequest);
}
//# sourceMappingURL=AjaxResponse.d.ts.map