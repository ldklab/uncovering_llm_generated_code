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

function createBinding(o, m, k, k2 = k) {
    Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
}

function exportStar(m, exports) {
    for (let p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
            createBinding(exports, m, p);
        }
    }
}

Object.defineProperty(exports, "__esModule", { value: true });

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
//# sourceMappingURL=index.js.map
