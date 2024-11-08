"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const createBinding = (o, m, k, k2) => {
    if (k2 === undefined) k2 = k;
    let desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: () => m[k] };
    }
    Object.defineProperty(o, k2, desc);
};

const exportStar = (m, exports) => {
    for (let p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
            createBinding(exports, m, p);
    }
};

// ------------------------------------------------------------------
// Infrastructure
// ------------------------------------------------------------------
exportStar(require("./type/clone/index"), exports);
exportStar(require("./type/create/index"), exports);
exportStar(require("./type/error/index"), exports);
exportStar(require("./type/guard/index"), exports);
exportStar(require("./type/helpers/index"), exports);
exportStar(require("./type/patterns/index"), exports);
exportStar(require("./type/registry/index"), exports);
exportStar(require("./type/sets/index"), exports);
exportStar(require("./type/symbols/index"), exports);

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
exportStar(require("./type/any/index"), exports);
exportStar(require("./type/array/index"), exports);
exportStar(require("./type/async-iterator/index"), exports);
exportStar(require("./type/awaited/index"), exports);
exportStar(require("./type/bigint/index"), exports);
exportStar(require("./type/boolean/index"), exports);
exportStar(require("./type/composite/index"), exports);
exportStar(require("./type/const/index"), exports);
exportStar(require("./type/constructor/index"), exports);
exportStar(require("./type/constructor-parameters/index"), exports);
exportStar(require("./type/date/index"), exports);
exportStar(require("./type/deref/index"), exports);
exportStar(require("./type/enum/index"), exports);
exportStar(require("./type/exclude/index"), exports);
exportStar(require("./type/extends/index"), exports);
exportStar(require("./type/extract/index"), exports);
exportStar(require("./type/function/index"), exports);
exportStar(require("./type/indexed/index"), exports);
exportStar(require("./type/instance-type/index"), exports);
exportStar(require("./type/integer/index"), exports);
exportStar(require("./type/intersect/index"), exports);
exportStar(require("./type/iterator/index"), exports);
exportStar(require("./type/intrinsic/index"), exports);
exportStar(require("./type/keyof/index"), exports);
exportStar(require("./type/literal/index"), exports);
exportStar(require("./type/mapped/index"), exports);
exportStar(require("./type/never/index"), exports);
exportStar(require("./type/not/index"), exports);
exportStar(require("./type/null/index"), exports);
exportStar(require("./type/number/index"), exports);
exportStar(require("./type/object/index"), exports);
exportStar(require("./type/omit/index"), exports);
exportStar(require("./type/optional/index"), exports);
exportStar(require("./type/parameters/index"), exports);
exportStar(require("./type/partial/index"), exports);
exportStar(require("./type/pick/index"), exports);
exportStar(require("./type/promise/index"), exports);
exportStar(require("./type/readonly/index"), exports);
exportStar(require("./type/readonly-optional/index"), exports);
exportStar(require("./type/record/index"), exports);
exportStar(require("./type/recursive/index"), exports);
exportStar(require("./type/ref/index"), exports);
exportStar(require("./type/regexp/index"), exports);
exportStar(require("./type/required/index"), exports);
exportStar(require("./type/rest/index"), exports);
exportStar(require("./type/return-type/index"), exports);
exportStar(require("./type/schema/index"), exports);
exportStar(require("./type/static/index"), exports);
exportStar(require("./type/strict/index"), exports);
exportStar(require("./type/string/index"), exports);
exportStar(require("./type/symbol/index"), exports);
exportStar(require("./type/template-literal/index"), exports);
exportStar(require("./type/transform/index"), exports);
exportStar(require("./type/tuple/index"), exports);
exportStar(require("./type/uint8array/index"), exports);
exportStar(require("./type/undefined/index"), exports);
exportStar(require("./type/union/index"), exports);
exportStar(require("./type/unknown/index"), exports);
exportStar(require("./type/unsafe/index"), exports);
exportStar(require("./type/void/index"), exports);

// ------------------------------------------------------------------
// Namespace
// ------------------------------------------------------------------
exportStar(require("./type/type/index"), exports);
