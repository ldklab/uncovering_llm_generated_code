"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientDefaultValues = void 0;
const tslib_1 = require("tslib");
const package_json_1 = tslib_1.__importDefault(require("./package.json"));
const sha256_browser_1 = require("@aws-crypto/sha256-browser");
const eventstream_serde_browser_1 = require("@aws-sdk/eventstream-serde-browser");
const fetch_http_handler_1 = require("@aws-sdk/fetch-http-handler");
const hash_blob_browser_1 = require("@aws-sdk/hash-blob-browser");
const invalid_dependency_1 = require("@aws-sdk/invalid-dependency");
const md5_js_1 = require("@aws-sdk/md5-js");
const middleware_retry_1 = require("@aws-sdk/middleware-retry");
const url_parser_browser_1 = require("@aws-sdk/url-parser-browser");
const util_base64_browser_1 = require("@aws-sdk/util-base64-browser");
const util_body_length_browser_1 = require("@aws-sdk/util-body-length-browser");
const util_user_agent_browser_1 = require("@aws-sdk/util-user-agent-browser");
const util_utf8_browser_1 = require("@aws-sdk/util-utf8-browser");
const runtimeConfig_shared_1 = require("./runtimeConfig.shared");
/**
 * @internal
 */
exports.ClientDefaultValues = {
    ...runtimeConfig_shared_1.ClientSharedValues,
    runtime: "browser",
    base64Decoder: util_base64_browser_1.fromBase64,
    base64Encoder: util_base64_browser_1.toBase64,
    bodyLengthChecker: util_body_length_browser_1.calculateBodyLength,
    credentialDefaultProvider: (_) => () => Promise.reject(new Error("Credential is missing")),
    defaultUserAgentProvider: util_user_agent_browser_1.defaultUserAgent({
        serviceId: runtimeConfig_shared_1.ClientSharedValues.serviceId,
        clientVersion: package_json_1.default.version,
    }),
    eventStreamSerdeProvider: eventstream_serde_browser_1.eventStreamSerdeProvider,
    maxAttempts: middleware_retry_1.DEFAULT_MAX_ATTEMPTS,
    md5: md5_js_1.Md5,
    region: invalid_dependency_1.invalidProvider("Region is missing"),
    requestHandler: new fetch_http_handler_1.FetchHttpHandler(),
    sha256: sha256_browser_1.Sha256,
    streamCollector: fetch_http_handler_1.streamCollector,
    streamHasher: hash_blob_browser_1.blobHasher,
    urlParser: url_parser_browser_1.parseUrl,
    utf8Decoder: util_utf8_browser_1.fromUtf8,
    utf8Encoder: util_utf8_browser_1.toUtf8,
};
//# sourceMappingURL=runtimeConfig.browser.js.map