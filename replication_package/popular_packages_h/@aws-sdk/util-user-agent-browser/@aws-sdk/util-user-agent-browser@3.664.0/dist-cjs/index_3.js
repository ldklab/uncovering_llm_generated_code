"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUserAgent = void 0;
const tslib_1 = require("tslib");
const bowser_1 = tslib_1.__importDefault(require("bowser"));

// The `defaultUserAgent` function generates a user-agent string
// It is an async function that accepts an object containing `serviceId` and `clientVersion`
// and returns another function that takes `config` as a parameter
const defaultUserAgent = ({ serviceId, clientVersion }) => async (config) => {
    // Checks if `window` is defined to determine if running in a browser environment
    // If so, parses the user agent string from the browser using `bowser`
    // Otherwise, sets `parsedUA` to undefined for non-browser environments
    const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent
        ? bowser_1.default.parse(window.navigator.userAgent)
        : undefined;

    // Constructs an array of user agent sections
    // Includes information such as sdk name and version, operating system, language, and browser details
    const sections = [
        ["aws-sdk-js", clientVersion],
        ["ua", "2.1"],
        [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
        ["lang/js"],
        ["md/browser", `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`],
    ];
    
    // Adds API service ID and client version if `serviceId` is provided
    if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
    }
    
    // Optionally adds application ID if it is available from `config`
    const appId = await config?.userAgentAppId?.();
    if (appId) {
        sections.push([`app/${appId}`]);
    }
    
    // Returns the finalized user agent sections
    return sections;
};

exports.defaultUserAgent = defaultUserAgent;
