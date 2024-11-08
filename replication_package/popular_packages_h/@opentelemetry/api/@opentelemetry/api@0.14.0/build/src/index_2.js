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

const { INVALID_SPANID, INVALID_TRACEID, INVALID_SPAN_CONTEXT, isSpanContextValid, isValidTraceId, isValidSpanId } = require('./trace/spancontext-utils');
const { ROOT_CONTEXT, createContextKey } = require('@opentelemetry/context-base');
const ContextAPI = require('./api/context').ContextAPI;
const TraceAPI = require('./api/trace').TraceAPI;
const MetricsAPI = require('./api/metrics').MetricsAPI;
const PropagationAPI = require('./api/propagation').PropagationAPI;

Object.defineProperty(exports, "INVALID_SPANID", { enumerable: true, get: () => INVALID_SPANID });
Object.defineProperty(exports, "INVALID_TRACEID", { enumerable: true, get: () => INVALID_TRACEID });
Object.defineProperty(exports, "INVALID_SPAN_CONTEXT", { enumerable: true, get: () => INVALID_SPAN_CONTEXT });
Object.defineProperty(exports, "isSpanContextValid", { enumerable: true, get: () => isSpanContextValid });
Object.defineProperty(exports, "isValidTraceId", { enumerable: true, get: () => isValidTraceId });
Object.defineProperty(exports, "isValidSpanId", { enumerable: true, get: () => isValidSpanId });

Object.defineProperty(exports, "ROOT_CONTEXT", { enumerable: true, get: () => ROOT_CONTEXT });
Object.defineProperty(exports, "createContextKey", { enumerable: true, get: () => createContextKey });

exports.context = ContextAPI.getInstance();
exports.trace = TraceAPI.getInstance();
exports.metrics = MetricsAPI.getInstance();
exports.propagation = PropagationAPI.getInstance();

exports.default = {
    trace: exports.trace,
    metrics: exports.metrics,
    context: exports.context,
    propagation: exports.propagation,
};

const modulesToExport = [
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
];

modulesToExport.forEach(module => {
    __exportStar(require(module), exports);
});
