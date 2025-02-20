"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Import various utilities and APIs from internal modules and re-export them

// Baggage module
var utils_1 = require("./baggage/utils");
exports.baggageEntryMetadataFromString = utils_1.baggageEntryMetadataFromString;

// Context APIs
var context_1 = require("./context/context");
exports.createContextKey = context_1.createContextKey;
exports.ROOT_CONTEXT = context_1.ROOT_CONTEXT;

// Diagnostics APIs
var consoleLogger_1 = require("./diag/consoleLogger");
exports.DiagConsoleLogger = consoleLogger_1.DiagConsoleLogger;
var types_1 = require("./diag/types");
exports.DiagLogLevel = types_1.DiagLogLevel;

// Metrics APIs
var NoopMeter_1 = require("./metrics/NoopMeter");
exports.createNoopMeter = NoopMeter_1.createNoopMeter;
var Metric_1 = require("./metrics/Metric");
exports.ValueType = Metric_1.ValueType;

// Propagation APIs
var TextMapPropagator_1 = require("./propagation/TextMapPropagator");
exports.defaultTextMapGetter = TextMapPropagator_1.defaultTextMapGetter;
exports.defaultTextMapSetter = TextMapPropagator_1.defaultTextMapSetter;

// Tracing APIs
var ProxyTracer_1 = require("./trace/ProxyTracer");
exports.ProxyTracer = ProxyTracer_1.ProxyTracer;
var ProxyTracerProvider_1 = require("./trace/ProxyTracerProvider");
exports.ProxyTracerProvider = ProxyTracerProvider_1.ProxyTracerProvider;
var SamplingResult_1 = require("./trace/SamplingResult");
exports.SamplingDecision = SamplingResult_1.SamplingDecision;
var span_kind_1 = require("./trace/span_kind");
exports.SpanKind = span_kind_1.SpanKind;
var status_1 = require("./trace/status");
exports.SpanStatusCode = status_1.SpanStatusCode;
var trace_flags_1 = require("./trace/trace_flags");
exports.TraceFlags = trace_flags_1.TraceFlags;
var utils_2 = require("./trace/internal/utils");
exports.createTraceState = utils_2.createTraceState;
var spancontext_utils_1 = require("./trace/spancontext-utils");
exports.isSpanContextValid = spancontext_utils_1.isSpanContextValid;
exports.isValidTraceId = spancontext_utils_1.isValidTraceId;
exports.isValidSpanId = spancontext_utils_1.isValidSpanId;
var invalid_span_constants_1 = require("./trace/invalid-span-constants");
exports.INVALID_SPANID = invalid_span_constants_1.INVALID_SPANID;
exports.INVALID_TRACEID = invalid_span_constants_1.INVALID_TRACEID;
exports.INVALID_SPAN_CONTEXT = invalid_span_constants_1.INVALID_SPAN_CONTEXT;

// API exports for context, diag, metrics, propagation, and trace
const context_api_1 = require("./context-api");
exports.context = context_api_1.context;
const diag_api_1 = require("./diag-api");
exports.diag = diag_api_1.diag;
const metrics_api_1 = require("./metrics-api");
exports.metrics = metrics_api_1.metrics;
const propagation_api_1 = require("./propagation-api");
exports.propagation = propagation_api_1.propagation;
const trace_api_1 = require("./trace-api");
exports.trace = trace_api_1.trace;

// Default export
exports.default = {
    context: context_api_1.context,
    diag: diag_api_1.diag,
    metrics: metrics_api_1.metrics,
    propagation: propagation_api_1.propagation,
    trace: trace_api_1.trace,
};
