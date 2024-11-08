"use strict";
const bowser = require("bowser");

function getUserAgentString(serviceId, clientVersion) {
    return async function() {
        const userAgent = window?.navigator?.userAgent;
        const parsedUA = userAgent ? bowser.parse(userAgent) : undefined;

        const sections = [
            ["aws-sdk-js", clientVersion],
            [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
            ["lang/js"],
            [`md/browser`, `${parsedUA?.browser?.name || "unknown"}_${parsedUA?.browser?.version || "unknown"}`],
        ];

        if (serviceId) {
            sections.push([`api/${serviceId}`, clientVersion]);
        }

        return sections;
    };
}

module.exports.defaultUserAgent = getUserAgentString;
