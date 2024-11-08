"use strict";

/* 
 * This module serves as an entry point for the OpenTelemetry API, re-exporting 
 * various functionalities (context, diagnostics, metrics, propagation, trace) 
 * for external use.
 */

// Baggage utility exports
const { baggageEntryMetadataFromString } = require("./baggage/utils");

// Context APIs
const { createContextKey, ROOT_CONTEXT } = require("./context/context");

// Diag APIs
const { DiagConsoleLogger } = require("./diag/consoleLogger");
const { DiagLogLevel } = require("./diag/types");

// Metrics APIs
const { createNoopMeter } = require("./metrics/NoopMeter");
const { ValueType } = require("./metrics/Metric");

// Propagation APIs
const { defaultTextMapGetter, defaultTextMapSetter } = require("./propagation/TextMapPropagator");

// Trace APIs
const { ProxyTracer } = require("./trace/ProxyTracer");
const { ProxyTracerProvider } = require("./trace/ProxyTracerProvider");
const { SamplingDecision } = require("./trace/SamplingResult");
const { SpanKind } = require("./trace/span_kind");
const { SpanStatusCode } = require("./trace/status");
const { TraceFlags } = require("./trace/trace_flags");
const { createTraceState } = require("./trace/internal/utils");
const { isSpanContextValid, isValidTraceId, isValidSpanId } = require("./trace/spancontext-utils");
const { INVALID_SPANID, INVALID_TRACEID, INVALID_SPAN_CONTEXT } = require("./trace/invalid-span-constants");

// Module-level variable definition imports
const { context } = require("./context-api");
const { diag } = require("./diag-api");
const { metrics } = require("./metrics-api");
const { propagation } = require("./propagation-api");
const { trace } = require("./trace-api");

// Exporting all functionalities
module.exports = {
    baggageEntryMetadataFromString,
    createContextKey,
    ROOT_CONTEXT,
    DiagConsoleLogger,
    DiagLogLevel,
    createNoopMeter,
    ValueType,
    defaultTextMapGetter,
    defaultTextMapSetter,
    ProxyTracer,
    ProxyTracerProvider,
    SamplingDecision,
    SpanKind,
    SpanStatusCode,
    TraceFlags,
    createTraceState,
    isSpanContextValid,
    isValidTraceId,
    isValidSpanId,
    INVALID_SPANID,
    INVALID_TRACEID,
    INVALID_SPAN_CONTEXT,
    context,
    diag,
    metrics,
    propagation,
    trace,
    default: {
        context,
        diag,
        metrics,
        propagation,
        trace
    }
};
