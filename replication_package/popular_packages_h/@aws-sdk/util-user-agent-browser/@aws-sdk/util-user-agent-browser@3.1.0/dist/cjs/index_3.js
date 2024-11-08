"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUserAgent = void 0;
const bowser_1 = require("bowser");

/**
 * Generates a default user agent string for browsers, attempting to infer
 * device and browser details using the 'bowser' library.
 */
const defaultUserAgent = ({ serviceId, clientVersion }) => async () => {
    const userAgent = window?.navigator?.userAgent;
    const parsedUA = userAgent ? bowser_1.parse(userAgent) : undefined;
    
    const sdkMetadata = ["aws-sdk-js", clientVersion];
    const osMetadata = [
        `os/${parsedUA?.os?.name || "other"}`,
        parsedUA?.os?.version
    ];
    const langMetadata = ["lang/js"];
    const browserMetadata = [
        "md/browser",
        `${parsedUA?.browser?.name || "unknown"}_${parsedUA?.browser?.version || "unknown"}`
    ];

    const sections = [
        sdkMetadata,
        ...osMetadata,
        langMetadata,
        browserMetadata
    ];

    if (serviceId) {
        const apiMetadata = [`api/${serviceId}`, clientVersion];
        sections.push(apiMetadata);
    }

    return sections;
};

exports.defaultUserAgent = defaultUserAgent;
