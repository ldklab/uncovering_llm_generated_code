"use strict";

function createBinding(o, m, k, k2 = k) {
    const desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || (!m.__esModule && (desc.writable || desc.configurable))) {
        Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
    }
}

function exportStar(m, exports) {
    for (const key in m) {
        if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
            createBinding(exports, m, key);
        }
    }
}

Object.defineProperty(exports, "__esModule", { value: true });

// Infrastructure
exportStar(require("./type/clone/index"), exports);
exportStar(require("./type/create/index"), exports);
exportStar(require("./type/error/index"), exports);
exportStar(require("./type/guard/index"), exports);
exportStar(require("./type/helpers/index"), exports);
exportStar(require("./type/patterns/index"), exports);
exportStar(require("./type/registry/index"), exports);
exportStar(require("./type/sets/index"), exports);
exportStar(require("./type/symbols/index"), exports);

// Types
const types = [
    "./type/any/index",
    "./type/array/index",
    "./type/async-iterator/index",
    "./type/awaited/index",
    "./type/bigint/index",
    "./type/boolean/index",
    "./type/composite/index",
    "./type/const/index",
    "./type/constructor/index",
    "./type/constructor-parameters/index",
    "./type/date/index",
    "./type/deref/index",
    "./type/enum/index",
    "./type/exclude/index",
    "./type/extends/index",
    "./type/extract/index",
    "./type/function/index",
    "./type/indexed/index",
    "./type/instance-type/index",
    "./type/integer/index",
    "./type/intersect/index",
    "./type/iterator/index",
    "./type/intrinsic/index",
    "./type/keyof/index",
    "./type/literal/index",
    "./type/mapped/index",
    "./type/never/index",
    "./type/not/index",
    "./type/null/index",
    "./type/number/index",
    "./type/object/index",
    "./type/omit/index",
    "./type/optional/index",
    "./type/parameters/index",
    "./type/partial/index",
    "./type/pick/index",
    "./type/promise/index",
    "./type/readonly/index",
    "./type/readonly-optional/index",
    "./type/record/index",
    "./type/recursive/index",
    "./type/ref/index",
    "./type/regexp/index",
    "./type/required/index",
    "./type/rest/index",
    "./type/return-type/index",
    "./type/schema/index",
    "./type/static/index",
    "./type/strict/index",
    "./type/string/index",
    "./type/symbol/index",
    "./type/template-literal/index",
    "./type/transform/index",
    "./type/tuple/index",
    "./type/uint8array/index",
    "./type/undefined/index",
    "./type/union/index",
    "./type/unknown/index",
    "./type/unsafe/index",
    "./type/void/index"
];

types.forEach(typePath => exportStar(require(typePath), exports));

// Namespace
exportStar(require("./type/type/index"), exports);
