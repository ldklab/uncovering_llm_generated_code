"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToBase64 = void 0;
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
const hex_to_binary_1 = require("../../common/hex-to-binary");
function hexToBase64(hexStr) {
    return Buffer.from((0, hex_to_binary_1.hexToBinary)(hexStr)).toString('base64');
}
exports.hexToBase64 = hexToBase64;
//# sourceMappingURL=hex-to-base64.js.map