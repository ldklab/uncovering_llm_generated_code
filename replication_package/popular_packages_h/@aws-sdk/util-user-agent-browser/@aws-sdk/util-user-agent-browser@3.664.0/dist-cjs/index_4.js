"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUserAgent = void 0;

const tslib_1 = require("tslib");
const bowser = tslib_1.__importDefault(require("bowser"));

const defaultUserAgent = ({ serviceId, clientVersion }) => async (config) => {
    // Check if running in a browser environment and parse user agent if available
    const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent
        ? bowser.parse(window.navigator.userAgent)
        : undefined;

    // Prepare sections of the user agent including any available information
    const sections = [
        ["aws-sdk-js", clientVersion],
        ["ua", "2.1"],
        [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
        ["lang/js"],
        ["md/browser", `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`],
    ];

    // If service ID is provided, include it in the user agent sections
    if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
    }

    // Attempt to retrieve additional app-specific user agent information
    const appId = await config?.userAgentAppId?.();
    if (appId) {
        sections.push([`app/${appId}`]);
    }

    // Return the constructed list of user agent sections
    return sections;
};

exports.defaultUserAgent = defaultUserAgent;
