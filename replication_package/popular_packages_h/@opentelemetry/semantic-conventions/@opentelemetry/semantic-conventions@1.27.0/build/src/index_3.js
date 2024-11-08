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
const __createBinding = (o, m, k, k2 = k) => {
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: () => m[k],
    });
};

const __exportStar = (m, exports) => {
    for (const p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
            __createBinding(exports, m, p);
        }
    }
};

Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-restricted-syntax --
 * These re-exports are only of constants, only two-levels deep, and
 * should not cause problems for tree-shakers.
 */
// Deprecated. These are kept around for compatibility purposes
__exportStar(require("./trace"), exports);
__exportStar(require("./resource"), exports);
// Use these instead
__exportStar(require("./stable_attributes"), exports);
__exportStar(require("./stable_metrics"), exports);
//# sourceMappingURL=index.js.map
