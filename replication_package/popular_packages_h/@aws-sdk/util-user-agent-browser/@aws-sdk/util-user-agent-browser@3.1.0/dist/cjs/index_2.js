"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUserAgent = void 0;
const bowser_1 = require("bowser");

/**
 * Provides a default User Agent string for a browser environment.
 * Attempts to infer device information using the bowser library to
 * detect browser and version details.
 */
const defaultUserAgent = ({ serviceId, clientVersion }) => async () => {
    let parsedUA;
    if (window?.navigator?.userAgent) {
        parsedUA = bowser_1.parse(window.navigator.userAgent);
    }

    const sections = [
        // sdk-metadata
        ["aws-sdk-js", clientVersion],
        // os-metadata
        [
            `os/${parsedUA?.os?.name || "other"}`,
            parsedUA?.os?.version,
        ],
        // language-metadata
        ["lang/js"],
        // browser vendor and version
        [
            "md/browser",
            `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`,
        ],
    ];

    if (serviceId) {
        // api-metadata
        sections.push([`api/${serviceId}`, clientVersion]);
    }

    return sections;
};

exports.defaultUserAgent = defaultUserAgent;
