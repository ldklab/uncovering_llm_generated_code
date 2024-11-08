const { EventEmitter } = require('events');

class Keyv extends EventEmitter {
    constructor(options = {}) {
        super();
        this.store = options.store || new Map();
        this.ttl = options.ttl;
        this.namespace = options.namespace || 'keyv';
        this.serialize = options.serialize || JSON.stringify;
        this.deserialize = options.deserialize || JSON.parse;
        if (options.uri) this.useUri(options.uri);
    }

    useUri(uri) {
        const scheme = uri.split(':')[0];
        const Adapter = require(`@keyv/${scheme}`);
        this.store = new Adapter(uri);
    }

    async set(key, value, ttl) {
        const fullKey = this._fullKey(key);
        const item = { value: this.serialize(value), expires: ttl ? Date.now() + ttl : null };
        await this.store.set(fullKey, item);
        return true;
    }

    async get(key, { raw = false } = {}) {
        const fullKey = this._fullKey(key);
        const item = await this.store.get(fullKey);
        if (!item) return undefined;
        if (!raw && item.expires && Date.now() > item.expires) {
            await this.delete(key);
            return undefined;
        }
        return raw ? item : this.deserialize(item.value);
    }

    async delete(key) {
        return this.store.delete(this._fullKey(key));
    }

    async clear() {
        for (const key of this.store.keys()) {
            if (key.startsWith(`${this.namespace}:`)) {
                await this.delete(key.substring(this.namespace.length + 1));
            }
        }
    }

    async *[Symbol.asyncIterator]() {
        for (const [key, item] of this.store.entries()) {
            if (key.startsWith(`${this.namespace}:`)) {
                yield [key.substring(this.namespace.length + 1), this.deserialize(item.value)];
            }
        }
    }

    _fullKey(key) {
        return `${this.namespace}:${key}`;
    }
}

module.exports = Keyv;

// Usage Example
const keyv = new Keyv({ uri: 'redis://localhost:6379' });
keyv.on('error', err => console.error('Connection Error', err));

// Example setting, getting, and deleting a key-value pair
(async () => {
    await keyv.set('foo', 'bar', 1000);
    console.log(await keyv.get('foo')); // 'bar'
    await keyv.delete('foo');
    console.log(await keyv.get('foo')); // undefined
})();
