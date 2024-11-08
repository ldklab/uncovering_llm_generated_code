"use strict";

/**
 * This module re-exports various functionalities from different parts of the
 * project, facilitating a centralized access point for these exports.
 */

const { defineProperty, hasOwnProperty } = Object;

// Helper function to create bindings for module exports
const createBinding = (o, m, k, k2 = k) => {
  defineProperty(o, k2, {
    enumerable: true,
    get: () => m[k],
  });
};

// Helper function to export all members from a module
const exportStar = (m, exports) => {
  for (const p in m) {
    if (p !== "default" && !hasOwnProperty.call(exports, p)) {
      createBinding(exports, m, p);
    }
  }
};

// Exporting various modules
exportStar(require("./common/attributes"), exports);
exportStar(require("./common/ConsoleLogger"), exports);
exportStar(require("./common/global-error-handler"), exports);
exportStar(require("./common/logging-error-handler"), exports);
exportStar(require("./common/NoopLogger"), exports);
exportStar(require("./common/time"), exports);
exportStar(require("./common/types"), exports);
exportStar(require("./ExportResult"), exports);
exportStar(require("./version"), exports);
exportStar(require("./context/propagation/composite"), exports);
exportStar(require("./context/propagation/HttpTraceContext"), exports);
exportStar(require("./context/propagation/types"), exports);
exportStar(require("./baggage/propagation/HttpBaggage"), exports);
exportStar(require("./platform"), exports);
exportStar(require("./trace/NoRecordingSpan"), exports);
exportStar(require("./trace/Plugin"), exports);
exportStar(require("./trace/sampler/AlwaysOffSampler"), exports);
exportStar(require("./trace/sampler/AlwaysOnSampler"), exports);
exportStar(require("./trace/sampler/ParentBasedSampler"), exports);
exportStar(require("./trace/sampler/TraceIdRatioBasedSampler"), exports);
exportStar(require("./trace/TraceState"), exports);
exportStar(require("./trace/IdGenerator"), exports);
exportStar(require("./utils/deep-merge"), exports);
exportStar(require("./utils/url"), exports);
exportStar(require("./utils/wrap"), exports);
