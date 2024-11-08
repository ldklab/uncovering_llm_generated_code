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

function createTransport(transporter, defaults) {
    let options;
    
    if (isTransporterConfig(transporter) || looksLikeUrl(transporter)) {
        const urlConfig = typeof transporter === 'string' ? transporter : transporter.url;
        options = urlConfig ? shared.parseConnectionUrl(urlConfig) : transporter;
        transporter = selectTransport(options);
    }

    return new Mailer(transporter, options, defaults);
}

function isTransporterConfig(transporter) {
    return typeof transporter === 'object' && typeof transporter.send !== 'function';
}

function looksLikeUrl(transporter) {
    return typeof transporter === 'string' && /^(smtps?|direct):/i.test(transporter);
}

function selectTransport(options) {
    if (options.pool) return new SMTPPool(options);
    if (options.sendmail) return new SendmailTransport(options);
    if (options.streamTransport) return new StreamTransport(options);
    if (options.jsonTransport) return new JSONTransport(options);
    if (options.SES) return new SESTransport(options);
    return new SMTPTransport(options);
}

function createTestAccount(apiUrl, callback) {
    let promise;
    if (!apiUrl || typeof apiUrl === 'function') {
        [apiUrl, callback] = [callback, apiUrl];
    }

    if (!callback) {
        promise = new Promise((resolve, reject) => {
            callback = shared.callbackPromise(resolve, reject);
        });
    }

    if (ETHEREAL_CACHE && testAccount) {
        setImmediate(() => callback(null, testAccount));
        return promise;
    }

    apiUrl = apiUrl || ETHEREAL_API;
    makeEtherealApiRequest(apiUrl, callback);
    return promise;
}

function makeEtherealApiRequest(apiUrl, callback) {
    let chunks = [];
    let chunklen = 0;
    
    const req = fetch(apiUrl + '/user', {
        contentType: 'application/json',
        method: 'POST',
        body: Buffer.from(JSON.stringify({
            requestor: packageData.name,
            version: packageData.version
        }))
    });

    req.on('readable', () => {
        let chunk;
        while ((chunk = req.read()) !== null) {
            chunks.push(chunk);
            chunklen += chunk.length;
        }
    });

    req.once('error', err => callback(err));

    req.once('end', () => {
        try {
            const res = Buffer.concat(chunks, chunklen);
            const data = JSON.parse(res.toString());
            handleApiResponse(data, callback);
        } catch (err) {
            callback(err);
        }
    });
}

function handleApiResponse(data, callback) {
    if (data.status !== 'success' || data.error) {
        return callback(new Error(data.error || 'Request failed'));
    }
    delete data.status;
    testAccount = data;
    callback(null, testAccount);
}

function getTestMessageUrl(info) {
    if (!info || !info.response) return false;

    const infoProps = new Map();
    info.response.replace(/\[([^\]]+)\]$/, (m, props) => {
        props.replace(/\b([A-Z0-9]+)=([^\s]+)/g, (m, key, value) => {
            infoProps.set(key, value);
        });
    });

    if (infoProps.has('STATUS') && infoProps.has('MSGID')) {
        return (testAccount.web || ETHEREAL_WEB) + '/message/' + infoProps.get('MSGID');
    }

    return false;
}

module.exports = { createTransport, createTestAccount, getTestMessageUrl };
