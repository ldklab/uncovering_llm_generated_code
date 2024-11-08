"use strict";
const { parse } = require("bowser");

/**
 * Generates the default user agent details for a browser environment.
 * Utilizes the Bowser library to parse user agent strings to fetch 
 * device, OS, and browser information.
 *
 * @param {object} options - Configuration options for the user agent string.
 * @param {string} options.serviceId - Optional service identifier.
 * @param {string} options.clientVersion - The client version string.
 * @returns {Function} - An async function that returns an array of user agent metadata.
 */
const defaultUserAgent = ({ serviceId, clientVersion }) => async () => {
    const navigator = window?.navigator;
    const userAgentString = navigator ? navigator.userAgent : undefined;
    const parsedUA = userAgentString ? parse(userAgentString) : undefined;

    const sections = [
        ["aws-sdk-js", clientVersion],
        [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
        ["lang/js"],
        [`md/browser`, `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`],
    ];

    if (serviceId) {
        sections.push([`api/${serviceId}`, clientVersion]);
    }

    return sections;
};

exports.defaultUserAgent = defaultUserAgent;
