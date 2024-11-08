"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebCryptoSha256 = void 0;

var tslib_1 = require("tslib");  // Import tslib for managing module exports
tslib_1.__exportStar(require("./crossPlatformSha256"), exports);  // Re-export all exports from crossPlatformSha256

var webCryptoSha256_1 = require("./webCryptoSha256");  // Import from webCryptoSha256
// Define a property WebCryptoSha256 in the exports object, referencing Sha256 from webCryptoSha256
Object.defineProperty(exports, "WebCryptoSha256", { 
    enumerable: true, 
    get: function () { 
        return webCryptoSha256_1.Sha256; 
    } 
});
