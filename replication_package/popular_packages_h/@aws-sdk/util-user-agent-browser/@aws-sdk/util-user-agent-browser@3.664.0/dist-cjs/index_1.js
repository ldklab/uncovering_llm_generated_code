"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUserAgent = void 0;

const bowser = require("bowser");

/**
 * Generates a default user agent array containing information about the environment
 * where the code is running. It includes details about the SDK version, operating
 * system, language, browser, and optionally a serviceId and appId.
 *
 * @param {Object} params - The parameters to generate a user agent.
 * @param {string} params.serviceId - The service identifier, if available.
 * @param {string} params.clientVersion - The version of the client using the SDK.
 * @returns {Function} - A function that accepts a config object and returns an array of user agent sections.
 */
const defaultUserAgent = ({ serviceId, clientVersion }) => async (config) => {
    let parsedUA;
    
    // Check if running in a browser environment and parse user agent
    if (typeof window !== "undefined" && window.navigator) {
        parsedUA = bowser.parse(window.navigator.userAgent);
    }
    
    // Initial user agent sections with SDK and language details
    const sections = [
        ["aws-sdk-js", clientVersion],
        ["ua", "2.1"],
        [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
        ["lang/js"],
        ["md/browser", `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`],
    ];
    
    // Append serviceId information if provided
    if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
    }
    
    // Append application Id if provided by config
    const appId = await config?.userAgentAppId?.();
    if (appId) {
        sections.push([`app/${appId}`]);
    }
    
    return sections;
};

exports.defaultUserAgent = defaultUserAgent;
