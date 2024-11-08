'use strict';

const Mailer = require('./mailer');
const shared = require('./shared');
const SMTPPool = require('./smtp-pool');
const SMTPTransport = require('./smtp-transport');
const SendmailTransport = require('./sendmail-transport');
const StreamTransport = require('./stream-transport');
const JSONTransport = require('./json-transport');
const SESTransport = require('./ses-transport');
const fetch = require('./fetch');
const packageData = require('../package.json');

const ETHEREAL_API = (process.env.ETHEREAL_API || 'https://api.nodemailer.com').replace(/\/+$/, '');
const ETHEREAL_WEB = (process.env.ETHEREAL_WEB || 'https://ethereal.email').replace(/\/+$/, '');
const ETHEREAL_CACHE = ['true', 'yes', 'y', '1'].includes((process.env.ETHEREAL_CACHE || 'yes').toString().trim().toLowerCase());

let testAccount = false;

module.exports = {
    createTransport(transporter, defaults) {
        let options, mailer, urlConfig;

        if (isObjectOrUrl(transporter)) {
            urlConfig = getConfigUrl(transporter);
            options = urlConfig ? shared.parseConnectionUrl(urlConfig) : transporter;

            transporter = initializeTransporter(options);
        }

        mailer = new Mailer(transporter, options, defaults);
        return mailer;
    },

    createTestAccount(apiUrl, callback) {
        let promise = handleCallbackOrPromise(apiUrl, callback);

        if (ETHEREAL_CACHE && testAccount) {
            setImmediate(() => callback(null, testAccount));
            return promise;
        }

        apiUrl = apiUrl || ETHEREAL_API;
        fetchAccount(apiUrl, callback);

        return promise;
    },

    getTestMessageUrl(info) {
        if (!info || !info.response) return false;

        let infoProps = parseResponse(info.response);
        if (infoProps.has('STATUS') && infoProps.has('MSGID')) {
            return (testAccount.web || ETHEREAL_WEB) + '/message/' + infoProps.get('MSGID');
        }

        return false;
    }
};

function isObjectOrUrl(transporter) {
    return (typeof transporter === 'object' && typeof transporter.send !== 'function') ||
           (typeof transporter === 'string' && /^(smtps?|direct):/i.test(transporter));
}

function getConfigUrl(transporter) {
    return typeof transporter === 'string' ? transporter : transporter.url;
}

function initializeTransporter(options) {
    if (options.pool) return new SMTPPool(options);
    if (options.sendmail) return new SendmailTransport(options);
    if (options.streamTransport) return new StreamTransport(options);
    if (options.jsonTransport) return new JSONTransport(options);
    if (options.SES) return new SESTransport(options);
    return new SMTPTransport(options);
}

function handleCallbackOrPromise(apiUrl, callback) {
    if (!callback && typeof apiUrl === 'function') {
        callback = apiUrl;
        apiUrl = false;
    }

    if (!callback) {
        return new Promise((resolve, reject) => {
            callback = shared.callbackPromise(resolve, reject);
        });
    }
}

function fetchAccount(apiUrl, callback) {
    let chunks = [];
    let chunklen = 0;
    let req = createFetchRequest(apiUrl);

    req.on('readable', () => {
        aggregateChunks(req, chunks, chunklen);
    });

    req.once('error', err => callback(err));

    req.once('end', () => {
        parseResponseChunks(chunks, chunklen, callback);
    });
}

function createFetchRequest(apiUrl) {
    return fetch(apiUrl + '/user', {
        contentType: 'application/json',
        method: 'POST',
        body: Buffer.from(JSON.stringify({
            requestor: packageData.name,
            version: packageData.version
        }))
    });
}

function aggregateChunks(req, chunks, chunklen) {
    let chunk;
    while ((chunk = req.read()) !== null) {
        chunks.push(chunk);
        chunklen += chunk.length;
    }
}

function parseResponseChunks(chunks, chunklen, callback) {
    let res = Buffer.concat(chunks, chunklen);
    try {
        let data = JSON.parse(res.toString());
        if (data.status !== 'success' || data.error) {
            return callback(new Error(data.error || 'Request failed'));
        }
        delete data.status;
        testAccount = data;
        callback(null, testAccount);
    } catch (err) {
        callback(err);
    }
}

function parseResponse(response) {
    let infoProps = new Map();
    response.replace(/\[([^\]]+)\]$/, (m, props) => {
        props.replace(/\b([A-Z0-9]+)=([^\s]+)/g, (m, key, value) => {
            infoProps.set(key, value);
        });
    });
    return infoProps;
}
