"use strict";
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpTraceContext = exports.parseTraceParent = exports.TRACE_STATE_HEADER = exports.TRACE_PARENT_HEADER = void 0;
const api_1 = require("@opentelemetry/api");
const TraceState_1 = require("../../trace/TraceState");
exports.TRACE_PARENT_HEADER = 'traceparent';
exports.TRACE_STATE_HEADER = 'tracestate';
const VERSION = '00';
const VERSION_PART_COUNT = 4; // Version 00 only allows the specific 4 fields.
const VERSION_REGEX = /^(?!ff)[\da-f]{2}$/;
const TRACE_ID_REGEX = /^(?![0]{32})[\da-f]{32}$/;
const PARENT_ID_REGEX = /^(?![0]{16})[\da-f]{16}$/;
const FLAGS_REGEX = /^[\da-f]{2}$/;
/**
 * Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
 * @param traceParent - A meta property that comes from server.
 *     It should be dynamically generated server side to have the server's request trace Id,
 *     a parent span Id that was set on the server's request span,
 *     and the trace flags to indicate the server's sampling decision
 *     (01 = sampled, 00 = not sampled).
 *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
 *     For more information see {@link https://www.w3.org/TR/trace-context/}
 */
function parseTraceParent(traceParent) {
    const trimmed = traceParent.trim();
    const traceParentParts = trimmed.split('-');
    // Current version must be structured correctly.
    // For future versions, we can grab just the parts we do support.
    if (traceParentParts[0] === VERSION &&
        traceParentParts.length !== VERSION_PART_COUNT) {
        return null;
    }
    const [version, traceId, parentId, flags] = traceParentParts;
    const isValidParent = VERSION_REGEX.test(version) &&
        TRACE_ID_REGEX.test(traceId) &&
        PARENT_ID_REGEX.test(parentId) &&
        FLAGS_REGEX.test(flags);
    if (!isValidParent) {
        return null;
    }
    return {
        traceId: traceId,
        spanId: parentId,
        traceFlags: parseInt(flags, 16),
    };
}
exports.parseTraceParent = parseTraceParent;
/**
 * Propagates {@link SpanContext} through Trace Context format propagation.
 *
 * Based on the Trace Context specification:
 * https://www.w3.org/TR/trace-context/
 */
class HttpTraceContext {
    inject(context, carrier, setter) {
        const spanContext = api_1.getParentSpanContext(context);
        if (!spanContext)
            return;
        const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || api_1.TraceFlags.NONE).toString(16)}`;
        setter.set(carrier, exports.TRACE_PARENT_HEADER, traceParent);
        if (spanContext.traceState) {
            setter.set(carrier, exports.TRACE_STATE_HEADER, spanContext.traceState.serialize());
        }
    }
    extract(context, carrier, getter) {
        const traceParentHeader = getter.get(carrier, exports.TRACE_PARENT_HEADER);
        if (!traceParentHeader)
            return context;
        const traceParent = Array.isArray(traceParentHeader)
            ? traceParentHeader[0]
            : traceParentHeader;
        if (typeof traceParent !== 'string')
            return context;
        const spanContext = parseTraceParent(traceParent);
        if (!spanContext)
            return context;
        spanContext.isRemote = true;
        const traceStateHeader = getter.get(carrier, exports.TRACE_STATE_HEADER);
        if (traceStateHeader) {
            // If more than one `tracestate` header is found, we merge them into a
            // single header.
            const state = Array.isArray(traceStateHeader)
                ? traceStateHeader.join(',')
                : traceStateHeader;
            spanContext.traceState = new TraceState_1.TraceState(typeof state === 'string' ? state : undefined);
        }
        return api_1.setExtractedSpanContext(context, spanContext);
    }
    fields() {
        return [exports.TRACE_PARENT_HEADER, exports.TRACE_STATE_HEADER];
    }
}
exports.HttpTraceContext = HttpTraceContext;
//# sourceMappingURL=HttpTraceContext.js.map