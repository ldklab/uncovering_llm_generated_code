const { EventEmitter } = require('events');

class Keyv extends EventEmitter {
    constructor({ uri, store = new Map(), ttl, namespace = 'keyv', serialize = JSON.stringify, deserialize = JSON.parse } = {}) {
        super();
        this.store = store;
        this.ttl = ttl;
        this.namespace = namespace;
        this.serialize = serialize;
        this.deserialize = deserialize;
        this.useUri(uri);
    }

    useUri(uri) {
        if (uri) {
            const storeAdapter = require(`@keyv/${uri.split(':')[0]}`);
            this.store = new storeAdapter(uri);
        }
    }

    async set(key, value, ttl) {
        const namespacedKey = `${this.namespace}:${key}`;
        const storedValue = { value: this.serialize(value), expires: ttl ? Date.now() + ttl : null };
        await this.store.set(namespacedKey, storedValue);
        return true;
    }

    async get(key, { raw = false } = {}) {
        const namespacedKey = `${this.namespace}:${key}`;
        const storedValue = await this.store.get(namespacedKey);
        if (!storedValue) return undefined;
        if (!raw && storedValue.expires && Date.now() > storedValue.expires) {
            await this.delete(key);
            return undefined;
        }
        return raw ? storedValue : this.deserialize(storedValue.value);
    }

    async delete(key) {
        const namespacedKey = `${this.namespace}:${key}`;
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
                yield [key.split(':')[1], this.deserialize(value.value)];
            }
        }
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
