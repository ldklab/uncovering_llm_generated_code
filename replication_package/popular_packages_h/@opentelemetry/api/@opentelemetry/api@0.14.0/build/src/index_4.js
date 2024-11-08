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

function __createBinding(o, m, k, k2 = k) {
    Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
}

function __exportStar(m, exports) {
    for (const p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
            __createBinding(exports, m, p);
        }
    }
}

Object.defineProperty(exports, "__esModule", { value: true });

exports.propagation = exports.metrics = exports.trace = exports.context = void 0;

// Re-export modules
[
    "./common/Exception",
    "./common/Logger",
    "./common/Time",
    "./context/context",
    "./context/propagation/TextMapPropagator",
    "./context/propagation/NoopTextMapPropagator",
    "./baggage/Baggage",
    "./baggage/EntryValue",
    "./metrics/BatchObserverResult",
    "./metrics/BoundInstrument",
    "./metrics/Meter",
    "./metrics/MeterProvider",
    "./metrics/Metric",
    "./metrics/NoopMeter",
    "./metrics/NoopMeterProvider",
    "./metrics/Observation",
    "./metrics/ObserverResult",
    "./trace/attributes",
    "./trace/Event",
    "./trace/link_context",
    "./trace/link",
    "./trace/NoopLogger",
    "./trace/NoopSpan",
    "./trace/NoopTracer",
    "./trace/NoopTracerProvider",
    "./trace/ProxyTracer",
    "./trace/ProxyTracerProvider",
    "./trace/Sampler",
    "./trace/SamplingResult",
    "./trace/span_context",
    "./trace/span_kind",
    "./trace/span",
    "./trace/SpanOptions",
    "./trace/status",
    "./trace/TimedEvent",
    "./trace/trace_flags",
    "./trace/trace_state",
    "./trace/tracer_provider",
    "./trace/tracer"
].forEach(module => __exportStar(require(module), exports));

// Specific imports from spancontext-utils
const spancontext_utils_1 = require("./trace/spancontext-utils");
Object.defineProperties(exports, {
    INVALID_SPANID: { enumerable: true, get: () => spancontext_utils_1.INVALID_SPANID },
    INVALID_TRACEID: { enumerable: true, get: () => spancontext_utils_1.INVALID_TRACEID },
    INVALID_SPAN_CONTEXT: { enumerable: true, get: () => spancontext_utils_1.INVALID_SPAN_CONTEXT },
    isSpanContextValid: { enumerable: true, get: () => spancontext_utils_1.isSpanContextValid },
    isValidTraceId: { enumerable: true, get: () => spancontext_utils_1.isValidTraceId },
    isValidSpanId: { enumerable: true, get: () => spancontext_utils_1.isValidSpanId }
});

// Context base imports
const context_base_1 = require("@opentelemetry/context-base");
Object.defineProperties(exports, {
    ROOT_CONTEXT: { enumerable: true, get: () => context_base_1.ROOT_CONTEXT },
    createContextKey: { enumerable: true, get: () => context_base_1.createContextKey }
});

// API Entry Points
const context_1 = require("./api/context");
exports.context = context_1.ContextAPI.getInstance(); // Context API Singleton

const trace_1 = require("./api/trace");
exports.trace = trace_1.TraceAPI.getInstance(); // Trace API Singleton

const metrics_1 = require("./api/metrics");
exports.metrics = metrics_1.MetricsAPI.getInstance(); // Metrics API Singleton

const propagation_1 = require("./api/propagation");
exports.propagation = propagation_1.PropagationAPI.getInstance(); // Propagation API Singleton

// Default export with key APIs
exports.default = {
    trace: exports.trace,
    metrics: exports.metrics,
    context: exports.context,
    propagation: exports.propagation
};
