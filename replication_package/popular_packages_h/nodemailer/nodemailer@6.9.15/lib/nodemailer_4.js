'use strict';

const Mailer = require('./mailer');
const shared = require('./shared');
const {
    SMTPPool,
    SMTPTransport,
    SendmailTransport,
    StreamTransport,
    JSONTransport,
    SESTransport
} = require('./transports');
const nmfetch = require('./fetch');
const { name, version } = require('../package.json');

const ETHEREAL_API = (process.env.ETHEREAL_API || 'https://api.nodemailer.com').replace(/\/+$/, '');
const ETHEREAL_WEB = (process.env.ETHEREAL_WEB || 'https://ethereal.email').replace(/\/+$/, '');
const ETHEREAL_API_KEY = process.env.ETHEREAL_API_KEY?.trim() || null;
const ETHEREAL_CACHE = ['true', 'yes', 'y', '1'].includes((process.env.ETHEREAL_CACHE || 'yes').toLowerCase());

let testAccount = false;

function createTransport(transporter, defaults) {
    let options;

    const isConfigObject = typeof transporter === 'object' && typeof transporter.send !== 'function';
    const isConnectionString = typeof transporter === 'string' && /^(smtps?|direct):/i.test(transporter);

    if (isConfigObject || isConnectionString) {
        options = isConnectionString ? shared.parseConnectionUrl(transporter) : transporter;

        transporter = options.pool ? new SMTPPool(options)
                      : options.sendmail ? new SendmailTransport(options)
                      : options.streamTransport ? new StreamTransport(options)
                      : options.jsonTransport ? new JSONTransport(options)
                      : options.SES ? new SESTransport(options)
                      : new SMTPTransport(options);
    }

    return new Mailer(transporter, options, defaults);
}

function createTestAccount(apiUrl, callback) {
    let promise;
    
    if (typeof apiUrl === 'function') {
        callback = apiUrl;
        apiUrl = false;
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

    apiUrl ||= ETHEREAL_API;

    const requestHeaders = ETHEREAL_API_KEY ? { Authorization: `Bearer ${ETHEREAL_API_KEY}` } : {};
    const requestBody = { requestor: name, version };

    const req = nmfetch(`${apiUrl}/user`, {
        contentType: 'application/json',
        method: 'POST',
        headers: requestHeaders,
        body: Buffer.from(JSON.stringify(requestBody))
    });

    const chunks = [];
    let chunklen = 0;

    req.on('readable', () => {
        let chunk;
        while ((chunk = req.read()) !== null) {
            chunks.push(chunk);
            chunklen += chunk.length;
        }
    });

    req.on('error', callback);

    req.on('end', () => {
        let data, err;
        try {
            data = JSON.parse(Buffer.concat(chunks, chunklen).toString());
        } catch (e) {
            err = e;
        }
        if (err || data.status !== 'success' || data.error) {
            return callback(err || new Error(data.error || 'Request failed'));
        }
        testAccount = data;
        callback(null, testAccount);
    });

    return promise;
}

function getTestMessageUrl(info) {
    if (!info?.response) return false;

    const infoProps = new Map();
    info.response.replace(/\[([^\]]+)\]$/, (m, props) => {
        props.replace(/\b([A-Z0-9]+)=([^\s]+)/g, (m, key, value) => {
            infoProps.set(key, value);
        });
    });

    return infoProps.has('STATUS') && infoProps.has('MSGID') ? 
           `${testAccount.web || ETHEREAL_WEB}/message/${infoProps.get('MSGID')}` : false;
}

module.exports = { createTransport, createTestAccount, getTestMessageUrl };
