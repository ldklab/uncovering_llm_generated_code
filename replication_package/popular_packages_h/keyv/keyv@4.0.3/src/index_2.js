'use strict';

const EventEmitter = require('events');
const JSONB = require('json-buffer');

const availableAdapters = {
    redis: '@keyv/redis',
    mongodb: '@keyv/mongo',
    mongo: '@keyv/mongo',
    sqlite: '@keyv/sqlite',
    postgresql: '@keyv/postgres',
    postgres: '@keyv/postgres',
    mysql: '@keyv/mysql'
};

function getAdapter(opts) {
    if (opts.adapter || opts.uri) {
        const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
        return new (require(availableAdapters[adapter]))(opts);
    }
    return new Map();
}

class Keyv extends EventEmitter {
    constructor(uri, options) {
        super();
        this.opts = {
            namespace: 'keyv',
            serialize: JSONB.stringify,
            deserialize: JSONB.parse,
            ...(typeof uri === 'string' ? { uri } : uri),
            ...options
        };

        if (!this.opts.store) {
            this.opts.store = getAdapter({ ...this.opts });
        }

        if (typeof this.opts.store.on === 'function') {
            this.opts.store.on('error', (err) => this.emit('error', err));
        }

        this.opts.store.namespace = this.opts.namespace;
    }

    _getPrefixedKey(key) {
        return `${this.opts.namespace}:${key}`;
    }

    async get(key, options) {
        const keyPrefixed = this._getPrefixedKey(key);
        const data = await this.opts.store.get(keyPrefixed);
        const deserializedData = (typeof data === 'string') ? this.opts.deserialize(data) : data;

        if (!deserializedData) {
            return undefined;
        }

        if (typeof deserializedData.expires === 'number' && Date.now() > deserializedData.expires) {
            await this.delete(key);
            return undefined;
        }

        return options?.raw ? deserializedData : deserializedData.value;
    }

    async set(key, value, ttl) {
        const keyPrefixed = this._getPrefixedKey(key);
        ttl = ttl === undefined ? this.opts.ttl : ttl;
        ttl = ttl === 0 ? undefined : ttl;

        const expires = typeof ttl === 'number' ? Date.now() + ttl : null;
        const serializedValue = await this.opts.serialize({ value, expires });
        await this.opts.store.set(keyPrefixed, serializedValue, ttl);
        return true;
    }

    async delete(key) {
        const keyPrefixed = this._getPrefixedKey(key);
        await this.opts.store.delete(keyPrefixed);
    }

    async clear() {
        await this.opts.store.clear();
    }
}

module.exports = Keyv;
