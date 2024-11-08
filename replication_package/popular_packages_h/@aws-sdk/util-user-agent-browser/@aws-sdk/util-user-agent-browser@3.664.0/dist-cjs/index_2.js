"use strict";

// Importing necessary modules
const bowser = require("bowser");

// Define and export a function named defaultUserAgent
const defaultUserAgent = ({ serviceId, clientVersion }) => async (config) => {
    // Check if the code is running in a browser environment and extract user agent
    const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent
        ? bowser.parse(window.navigator.userAgent)
        : undefined;

    // Prepare an array with sections of user agent details
    const sections = [
        // SDK and version details
        ["aws-sdk-js", clientVersion],
        // User agent specification version
        ["ua", "2.1"],
        // Operating system details or default to 'other'
        [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
        // Language specification
        ["lang/js"],
        // Browser details or default to 'unknown'
        ["md/browser", `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`],
    ];

    // If serviceId is provided, add the API details
    if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
    }

    // Fetch userAgentAppId from config if available and add it to sections
    const appId = await config?.userAgentAppId?.();
    if (appId) {
        sections.push([`app/${appId}`]);
    }

    // Return the constructed sections array
    return sections;
};

// Export the defaultUserAgent function
module.exports = {
    defaultUserAgent
};
