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

// Helper function to create bindings between objects
function createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}

// Helper function to export all properties from one module to another
function exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
        createBinding(exports, m, p);
    }
}

// Exporting functionality from other modules

// Deprecated - kept for compatibility
exportStar(require("./trace"), exports);
exportStar(require("./resource"), exports);

// Recommended for current use
exportStar(require("./stable_attributes"), exports);
exportStar(require("./stable_metrics"), exports);
