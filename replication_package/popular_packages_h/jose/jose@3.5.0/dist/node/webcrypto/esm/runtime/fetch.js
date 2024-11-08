import { get as http } from 'http';
import { get as https } from 'https';
import { JOSEError } from '../util/errors.js';
import { concat, decoder } from '../lib/buffer_utils.js';
const protocols = {
    'https:': https,
    'http:': http,
};
const fetch = async (url, timeout, options) => {
    if (protocols[url.protocol] === undefined) {
        throw new TypeError('Unsupported URL protocol.');
    }
    return new Promise((resolve, reject) => {
        const { agent } = options;
        protocols[url.protocol](url, { agent, timeout }, async (response) => {
            if (response.statusCode !== 200) {
                reject(new JOSEError('Expected 200 OK from the JSON Web Key Set HTTP response'));
            }
            else {
                const parts = [];
                for await (const part of response) {
                    parts.push(part);
                }
                try {
                    resolve(JSON.parse(decoder.decode(concat(...parts))));
                }
                catch (err) {
                    reject(new JOSEError('Failed to parse the JSON Web Key Set HTTP response as JSON'));
                }
            }
        }).on('error', reject);
    });
};
export default fetch;
