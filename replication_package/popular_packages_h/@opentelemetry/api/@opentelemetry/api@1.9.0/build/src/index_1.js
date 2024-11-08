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

// Import utility functions and components
var utils_1 = require("./baggage/utils");
var context_1 = require("./context/context");
var consoleLogger_1 = require("./diag/consoleLogger");
var types_1 = require("./diag/types");
var NoopMeter_1 = require("./metrics/NoopMeter");
var Metric_1 = require("./metrics/Metric");
var TextMapPropagator_1 = require("./propagation/TextMapPropagator");
var ProxyTracer_1 = require("./trace/ProxyTracer");
var ProxyTracerProvider_1 = require("./trace/ProxyTracerProvider");
var SamplingResult_1 = require("./trace/SamplingResult");
var span_kind_1 = require("./trace/span_kind");
var status_1 = require("./trace/status");
var trace_flags_1 = require("./trace/trace_flags");
var utils_2 = require("./trace/internal/utils");
var spancontext_utils_1 = require("./trace/spancontext-utils");
var invalid_span_constants_1 = require("./trace/invalid-span-constants");
const context_api_1 = require("./context-api");
const diag_api_1 = require("./diag-api");
const metrics_api_1 = require("./metrics-api");
const propagation_api_1 = require("./propagation-api");
const trace_api_1 = require("./trace-api");

// Export utility functions and constants
exports.baggageEntryMetadataFromString = utils_1.baggageEntryMetadataFromString;
exports.createContextKey = context_1.createContextKey;
exports.ROOT_CONTEXT = context_1.ROOT_CONTEXT;
exports.DiagConsoleLogger = consoleLogger_1.DiagConsoleLogger;
exports.DiagLogLevel = types_1.DiagLogLevel;
exports.createNoopMeter = NoopMeter_1.createNoopMeter;
exports.ValueType = Metric_1.ValueType;
exports.defaultTextMapGetter = TextMapPropagator_1.defaultTextMapGetter;
exports.defaultTextMapSetter = TextMapPropagator_1.defaultTextMapSetter;
exports.ProxyTracer = ProxyTracer_1.ProxyTracer;
exports.ProxyTracerProvider = ProxyTracerProvider_1.ProxyTracerProvider;
exports.SamplingDecision = SamplingResult_1.SamplingDecision;
exports.SpanKind = span_kind_1.SpanKind;
exports.SpanStatusCode = status_1.SpanStatusCode;
exports.TraceFlags = trace_flags_1.TraceFlags;
exports.createTraceState = utils_2.createTraceState;
exports.isSpanContextValid = spancontext_utils_1.isSpanContextValid;
exports.isValidTraceId = spancontext_utils_1.isValidTraceId;
exports.isValidSpanId = spancontext_utils_1.isValidSpanId;
exports.INVALID_SPANID = invalid_span_constants_1.INVALID_SPANID;
exports.INVALID_TRACEID = invalid_span_constants_1.INVALID_TRACEID;
exports.INVALID_SPAN_CONTEXT = invalid_span_constants_1.INVALID_SPAN_CONTEXT;

// Export APIs
exports.context = context_api_1.context;
exports.diag = diag_api_1.diag;
exports.metrics = metrics_api_1.metrics;
exports.propagation = propagation_api_1.propagation;
exports.trace = trace_api_1.trace;

// Default export object
exports.default = {
    context: context_api_1.context,
    diag: diag_api_1.diag,
    metrics: metrics_api_1.metrics,
    propagation: propagation_api_1.propagation,
    trace: trace_api_1.trace,
};
