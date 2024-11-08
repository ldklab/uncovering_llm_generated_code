"use strict";
/*
 * OpenTelemetry Node.js Library
 * Licensed under the Apache License, Version 2.0
 * For full license details, see:
 * https://www.apache.org/licenses/LICENSE-2.0
 */

// Exporting OpenTelemetry components and utilities
const { W3CBaggagePropagator } = require("./baggage/propagation/W3CBaggagePropagator");
const { AnchoredClock } = require("./common/anchored-clock");
const { isAttributeKey, isAttributeValue, sanitizeAttributes } = require("./common/attributes");
const {
    globalErrorHandler, setGlobalErrorHandler
} = require("./common/global-error-handler");
const { loggingErrorHandler } = require("./common/logging-error-handler");
const {
    addHrTimes, getTimeOrigin, hrTime, hrTimeDuration, hrTimeToMicroseconds,
    hrTimeToMilliseconds, hrTimeToNanoseconds, hrTimeToTimeStamp,
    isTimeInput, isTimeInputHrTime, millisToHrTime, timeInputToHrTime
} = require("./common/time");
const { hexToBinary } = require("./common/hex-to-binary");
const { ExportResultCode } = require("./ExportResult");

const utils = require("./baggage/utils");
exports.baggageUtils = {
    getKeyPairs: utils.getKeyPairs,
    serializeKeyPairs: utils.serializeKeyPairs,
    parseKeyPairsIntoRecord: utils.parseKeyPairsIntoRecord,
    parsePairKeyValue: utils.parsePairKeyValue,
};

const { RandomIdGenerator, SDK_INFO, _globalThis, getEnv, getEnvWithoutDefaults, hexToBase64, otperformance, unrefTimer } = require("./platform");

const { CompositePropagator } = require("./propagation/composite");
const {
    TRACE_PARENT_HEADER, TRACE_STATE_HEADER, W3CTraceContextPropagator, parseTraceParent
} = require("./trace/W3CTraceContextPropagator");

const {
    RPCType, deleteRPCMetadata, getRPCMetadata, setRPCMetadata
} = require("./trace/rpc-metadata");

const { AlwaysOffSampler } = require("./trace/sampler/AlwaysOffSampler");
const { AlwaysOnSampler } = require("./trace/sampler/AlwaysOnSampler");
const { ParentBasedSampler } = require("./trace/sampler/ParentBasedSampler");
const { TraceIdRatioBasedSampler } = require("./trace/sampler/TraceIdRatioBasedSampler");

const {
    isTracingSuppressed, suppressTracing, unsuppressTracing
} = require("./trace/suppress-tracing");

const { TraceState } = require("./trace/TraceState");

const {
    DEFAULT_ATTRIBUTE_COUNT_LIMIT, DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT, DEFAULT_ENVIRONMENT,
    DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT, DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
    parseEnvironment
} = require("./utils/environment");

const { merge } = require("./utils/merge");
const { TracesSamplerValues } = require("./utils/sampling");
const { TimeoutError, callWithTimeout } = require("./utils/timeout");
const { isUrlIgnored, urlMatches } = require("./utils/url");
const { isWrapped } = require("./utils/wrap");
const { BindOnceFuture } = require("./utils/callback");
const { VERSION } = require("./version");

const exporter = require("./internal/exporter");
exports.internal = {
    _export: exporter._export,
};

// Export definitions
module.exports = {
    W3CBaggagePropagator,
    AnchoredClock,
    isAttributeKey,
    isAttributeValue,
    sanitizeAttributes,
    globalErrorHandler,
    setGlobalErrorHandler,
    loggingErrorHandler,
    addHrTimes,
    getTimeOrigin,
    hrTime,
    hrTimeDuration,
    hrTimeToMicroseconds,
    hrTimeToMilliseconds,
    hrTimeToNanoseconds,
    hrTimeToTimeStamp,
    isTimeInput,
    isTimeInputHrTime,
    millisToHrTime,
    timeInputToHrTime,
    hexToBinary,
    ExportResultCode,
    RandomIdGenerator,
    SDK_INFO,
    _globalThis,
    getEnv,
    getEnvWithoutDefaults,
    hexToBase64,
    otperformance,
    unrefTimer,
    CompositePropagator,
    TRACE_PARENT_HEADER,
    TRACE_STATE_HEADER,
    W3CTraceContextPropagator,
    parseTraceParent,
    RPCType,
    deleteRPCMetadata,
    getRPCMetadata,
    setRPCMetadata,
    AlwaysOffSampler,
    AlwaysOnSampler,
    ParentBasedSampler,
    TraceIdRatioBasedSampler,
    isTracingSuppressed,
    suppressTracing,
    unsuppressTracing,
    TraceState,
    DEFAULT_ATTRIBUTE_COUNT_LIMIT,
    DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    DEFAULT_ENVIRONMENT,
    DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
    DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
    parseEnvironment,
    merge,
    TracesSamplerValues,
    TimeoutError,
    callWithTimeout,
    isUrlIgnored,
    urlMatches,
    isWrapped,
    BindOnceFuture,
    VERSION
};
