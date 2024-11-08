"use strict";
/*
 * Module which aggregates and re-exports different functionalities for ease of use.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Re-export old modules for backward compatibility.
 */
__exportStar(require("./trace"), exports);
__exportStar(require("./resource"), exports);

/**
 * Re-export newer modules for preferred usage.
 */
__exportStar(require("./stable_attributes"), exports);
__exportStar(require("./stable_metrics"), exports);
//# sourceMappingURL=index.js.map
