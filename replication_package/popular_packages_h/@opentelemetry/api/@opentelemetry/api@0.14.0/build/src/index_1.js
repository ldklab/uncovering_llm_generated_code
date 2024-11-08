"use strict";
/**
 * OpenTelemetry API Export Module
 * Manages the export of OpenTelemetry components and APIs
 */
Object.defineProperty(exports, "__esModule", { value: true });

const { INVALID_SPANID, INVALID_TRACEID, INVALID_SPAN_CONTEXT, isSpanContextValid, isValidTraceId, isValidSpanId } = require("./trace/spancontext-utils");
const { ROOT_CONTEXT, createContextKey } = require("@opentelemetry/context-base");
const { ContextAPI } = require("./api/context");
const { TraceAPI } = require("./api/trace");
const { MetricsAPI } = require("./api/metrics");
const { PropagationAPI } = require("./api/propagation");

// Export OpenTelemetry Modules
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

modulesToExport.forEach(mod => {
    const requiredModule = require(mod);
    Object.keys(requiredModule).forEach(property => {
        if (property !== "default" && !exports.hasOwnProperty(property)) {
            exports[property] = requiredModule[property];
        }
    });
});

// Export Span Context Utilities
exports.INVALID_SPANID = INVALID_SPANID;
exports.INVALID_TRACEID = INVALID_TRACEID;
exports.INVALID_SPAN_CONTEXT = INVALID_SPAN_CONTEXT;
exports.isSpanContextValid = isSpanContextValid;
exports.isValidTraceId = isValidTraceId;
exports.isValidSpanId = isValidSpanId;

// Export Context Base
exports.ROOT_CONTEXT = ROOT_CONTEXT;
exports.createContextKey = createContextKey;

// Entrypoints for OpenTelemetry APIs
exports.context = ContextAPI.getInstance();
exports.trace = TraceAPI.getInstance();
exports.metrics = MetricsAPI.getInstance();
exports.propagation = PropagationAPI.getInstance();

// Default Export
exports.default = {
    trace: exports.trace,
    metrics: exports.metrics,
    context: exports.context,
    propagation: exports.propagation,
};
