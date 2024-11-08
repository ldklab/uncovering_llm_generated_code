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

const { 
  INVALID_SPANID, 
  INVALID_TRACEID, 
  INVALID_SPAN_CONTEXT, 
  isSpanContextValid, 
  isValidTraceId, 
  isValidSpanId 
} = require("./trace/spancontext-utils");

const { 
  ROOT_CONTEXT, 
  createContextKey 
} = require("@opentelemetry/context-base");

const contextAPI = require("./api/context").ContextAPI.getInstance();
const traceAPI = require("./api/trace").TraceAPI.getInstance();
const metricsAPI = require("./api/metrics").MetricsAPI.getInstance();
const propagationAPI = require("./api/propagation").PropagationAPI.getInstance();

const propagation = propagationAPI;
const metrics = metricsAPI;
const trace = traceAPI;
const context = contextAPI;

exports.INVALID_SPANID = INVALID_SPANID;
exports.INVALID_TRACEID = INVALID_TRACEID;
exports.INVALID_SPAN_CONTEXT = INVALID_SPAN_CONTEXT;
exports.isSpanContextValid = isSpanContextValid;
exports.isValidTraceId = isValidTraceId;
exports.isValidSpanId = isValidSpanId;
exports.ROOT_CONTEXT = ROOT_CONTEXT;
exports.createContextKey = createContextKey;

exports.context = context;
exports.trace = trace;
exports.metrics = metrics;
exports.propagation = propagation;

exports.default = {
  trace,
  metrics,
  context,
  propagation,
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
  "./trace/tracer",
];

modulesToExport.forEach(modulePath => {
  require(modulePath).then(module => {
    Object.keys(module).forEach(exportKey => {
      if (exportKey !== "default" && !exports.hasOwnProperty(exportKey)) {
        exports[exportKey] = module[exportKey];
      }
    });
  });
});
