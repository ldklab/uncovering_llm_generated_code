"use strict";

/*
 * OpenTelemetry Module
 * Provides a structured export of various components for telemetry data collection.
 */

// Module Import and Export Section

// Import telemetry propagators and make them available for export
var W3CBaggagePropagator_1 = require("./baggage/propagation/W3CBaggagePropagator");
exports.W3CBaggagePropagator = W3CBaggagePropagator_1.W3CBaggagePropagator;

// Import and export clock utilities
var anchored_clock_1 = require("./common/anchored-clock");
exports.AnchoredClock = anchored_clock_1.AnchoredClock;

// Import and manage attribute-related functionalities
var attributes_1 = require("./common/attributes");
exports.isAttributeKey = attributes_1.isAttributeKey;
exports.isAttributeValue = attributes_1.isAttributeValue;
exports.sanitizeAttributes = attributes_1.sanitizeAttributes;

// Global error handling support
var global_error_handler_1 = require("./common/global-error-handler");
exports.globalErrorHandler = global_error_handler_1.globalErrorHandler;
exports.setGlobalErrorHandler = global_error_handler_1.setGlobalErrorHandler;

// Logging error handler support
var logging_error_handler_1 = require("./common/logging-error-handler");
exports.loggingErrorHandler = logging_error_handler_1.loggingErrorHandler;

// Time and High-Resolution Time utilities 
var time_1 = require("./common/time");
exports.addHrTimes = time_1.addHrTimes;
exports.getTimeOrigin = time_1.getTimeOrigin;
exports.hrTime = time_1.hrTime;
exports.hrTimeDuration = time_1.hrTimeDuration;
exports.hrTimeToMicroseconds = time_1.hrTimeToMicroseconds;
exports.hrTimeToMilliseconds = time_1.hrTimeToMilliseconds;
exports.hrTimeToNanoseconds = time_1.hrTimeToNanoseconds;
exports.hrTimeToTimeStamp = time_1.hrTimeToTimeStamp;
exports.isTimeInput = time_1.isTimeInput;
exports.isTimeInputHrTime = time_1.isTimeInputHrTime;
exports.millisToHrTime = time_1.millisToHrTime;
exports.timeInputToHrTime = time_1.timeInputToHrTime;

// Conversion and binary utilities
var hex_to_binary_1 = require("./common/hex-to-binary");
exports.hexToBinary = hex_to_binary_1.hexToBinary;

// Export result handling
var ExportResult_1 = require("./ExportResult");
exports.ExportResultCode = ExportResult_1.ExportResultCode;

// Utilize baggage utilities
const utils_1 = require("./baggage/utils");
exports.baggageUtils = {
    getKeyPairs: utils_1.getKeyPairs,
    serializeKeyPairs: utils_1.serializeKeyPairs,
    parseKeyPairsIntoRecord: utils_1.parseKeyPairsIntoRecord,
    parsePairKeyValue: utils_1.parsePairKeyValue,
};

// Platform-specific functionalities
var platform_1 = require("./platform");
exports.RandomIdGenerator = platform_1.RandomIdGenerator;
exports.SDK_INFO = platform_1.SDK_INFO;
exports._globalThis = platform_1._globalThis;
exports.getEnv = platform_1.getEnv;
exports.getEnvWithoutDefaults = platform_1.getEnvWithoutDefaults;
exports.hexToBase64 = platform_1.hexToBase64;
exports.otperformance = platform_1.otperformance;
exports.unrefTimer = platform_1.unrefTimer;

// Context propagation
var composite_1 = require("./propagation/composite");
exports.CompositePropagator = composite_1.CompositePropagator;

// Trace context propagation
var W3CTraceContextPropagator_1 = require("./trace/W3CTraceContextPropagator");
exports.TRACE_PARENT_HEADER = W3CTraceContextPropagator_1.TRACE_PARENT_HEADER;
exports.TRACE_STATE_HEADER = W3CTraceContextPropagator_1.TRACE_STATE_HEADER;
exports.W3CTraceContextPropagator = W3CTraceContextPropagator_1.W3CTraceContextPropagator;
exports.parseTraceParent = W3CTraceContextPropagator_1.parseTraceParent;

// RPC Metadata management
var rpc_metadata_1 = require("./trace/rpc-metadata");
exports.RPCType = rpc_metadata_1.RPCType;
exports.deleteRPCMetadata = rpc_metadata_1.deleteRPCMetadata;
exports.getRPCMetadata = rpc_metadata_1.getRPCMetadata;
exports.setRPCMetadata = rpc_metadata_1.setRPCMetadata;

// Tracing and Sampling strategies
var AlwaysOffSampler_1 = require("./trace/sampler/AlwaysOffSampler");
exports.AlwaysOffSampler = AlwaysOffSampler_1.AlwaysOffSampler;
var AlwaysOnSampler_1 = require("./trace/sampler/AlwaysOnSampler");
exports.AlwaysOnSampler = AlwaysOnSampler_1.AlwaysOnSampler;
var ParentBasedSampler_1 = require("./trace/sampler/ParentBasedSampler");
exports.ParentBasedSampler = ParentBasedSampler_1.ParentBasedSampler;
var TraceIdRatioBasedSampler_1 = require("./trace/sampler/TraceIdRatioBasedSampler");
exports.TraceIdRatioBasedSampler = TraceIdRatioBasedSampler_1.TraceIdRatioBasedSampler;

// Tracing suppression
var suppress_tracing_1 = require("./trace/suppress-tracing");
exports.isTracingSuppressed = suppress_tracing_1.isTracingSuppressed;
exports.suppressTracing = suppress_tracing_1.suppressTracing;
exports.unsuppressTracing = suppress_tracing_1.unsuppressTracing;

// State management for Tracing
var TraceState_1 = require("./trace/TraceState");
exports.TraceState = TraceState_1.TraceState;

// Environment variables and default settings
var environment_1 = require("./utils/environment");
exports.DEFAULT_ATTRIBUTE_COUNT_LIMIT = environment_1.DEFAULT_ATTRIBUTE_COUNT_LIMIT;
exports.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = environment_1.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
exports.DEFAULT_ENVIRONMENT = environment_1.DEFAULT_ENVIRONMENT;
exports.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = environment_1.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT;
exports.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = environment_1.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT;
exports.parseEnvironment = environment_1.parseEnvironment;

// Merge utilities
var merge_1 = require("./utils/merge");
exports.merge = merge_1.merge;

// Sampling configuration values
var sampling_1 = require("./utils/sampling");
exports.TracesSamplerValues = sampling_1.TracesSamplerValues;

// Timeout handling
var timeout_1 = require("./utils/timeout");
exports.TimeoutError = timeout_1.TimeoutError;
exports.callWithTimeout = timeout_1.callWithTimeout;

// URL utilities
var url_1 = require("./utils/url");
exports.isUrlIgnored = url_1.isUrlIgnored;
exports.urlMatches = url_1.urlMatches;

// Wrapping utilities
var wrap_1 = require("./utils/wrap");
exports.isWrapped = wrap_1.isWrapped;

// Callback utility
var callback_1 = require("./utils/callback");
exports.BindOnceFuture = callback_1.BindOnceFuture;

// Version information
var version_1 = require("./version");
exports.VERSION = version_1.VERSION;

// Internal exporter
const exporter_1 = require("./internal/exporter");
exports.internal = {
    _export: exporter_1._export,
};
