"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const https_1 = require("https");
const errors_js_1 = require("../util/errors.js");
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const protocols = {
    'https:': https_1.get,
    'http:': http_1.get,
};
const fetch = async (url, timeout, options) => {
    if (protocols[url.protocol] === undefined) {
        throw new TypeError('Unsupported URL protocol.');
    }
    return new Promise((resolve, reject) => {
        const { agent } = options;
        protocols[url.protocol](url, { agent, timeout }, async (response) => {
            if (response.statusCode !== 200) {
                reject(new errors_js_1.JOSEError('Expected 200 OK from the JSON Web Key Set HTTP response'));
            }
            else {
                const parts = [];
                for await (const part of response) {
                    parts.push(part);
                }
                try {
                    resolve(JSON.parse(buffer_utils_js_1.decoder.decode(buffer_utils_js_1.concat(...parts))));
                }
                catch (err) {
                    reject(new errors_js_1.JOSEError('Failed to parse the JSON Web Key Set HTTP response as JSON'));
                }
            }
        }).on('error', reject);
    });
};
exports.default = fetch;
