const { EventEmitter } = require('events');

class Keyv extends EventEmitter {
    constructor(options = {}) {
        super();
        const {
            uri,
            store = new Map(),
            ttl,
            namespace = 'keyv',
            serialize = JSON.stringify,
            deserialize = JSON.parse
        } = options;
        
        this.store = store;
        this.ttl = ttl;
        this.namespace = namespace;
        this.serialize = serialize;
        this.deserialize = deserialize;
        
        if (uri) {
            this.useUri(uri);
        }
    }

    useUri(uri) {
        try {
            const adapter = require(`@keyv/${uri.split(':')[0]}`);
            this.store = new adapter(uri);
        } catch (error) {
            this.emit('error', new Error(`Failed to load storage adapter for URI: ${uri}`));
        }
    }

    async set(key, value, ttl) {
        const namespacedKey = this._getNamespacedKey(key);
        const expires = ttl ? Date.now() + ttl : null;
        const storedValue = { value: this.serialize(value), expires };
        await this.store.set(namespacedKey, storedValue);
        return true;
    }

    async get(key, { raw = false } = {}) {
        const namespacedKey = this._getNamespacedKey(key);
        const storedValue = await this.store.get(namespacedKey);

        if (!storedValue) return undefined;

        const { expires, value } = storedValue;
        if (!raw && expires && Date.now() > expires) {
            await this.delete(key);
            return undefined;
        }
        return raw ? storedValue : this.deserialize(value);
    }

    async delete(key) {
        const namespacedKey = this._getNamespacedKey(key);
        return this.store.delete(namespacedKey);
    }

    async clear() {
        for (const key of this.store.keys()) {
            if (key.startsWith(`${this.namespace}:`)) {
                await this.delete(key.split(':')[1]);
            }
        }
    }

    async *[Symbol.asyncIterator]() {
        for (const [key, value] of this.store.entries()) {
            if (key.startsWith(`${this.namespace}:`)) {
                yield [key.slice(this.namespace.length + 1), this.deserialize(value.value)];
            }
        }
    }

    _getNamespacedKey(key) {
        return `${this.namespace}:${key}`;
    }
}

module.exports = Keyv;

// Example usage of Keyv
const keyv = new Keyv({ uri: 'redis://localhost:6379' });
keyv.on('error', err => console.error('Connection Error', err));

(async () => {
    await keyv.set('foo', 'bar', 1000);
    console.log(await keyv.get('foo')); // Outputs: 'bar'
    await keyv.delete('foo');
    console.log(await keyv.get('foo')); // Outputs: undefined
})();
