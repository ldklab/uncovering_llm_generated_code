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
            const storeAdapter = require(`@keyv/${uri.split(':')[0]}`);
            this.store = new storeAdapter(uri);
        }
    }

    async set(key, value, ttl) {
        const namespacedKey = `${this.namespace}:${key}`;
        const expires = ttl ? Date.now() + ttl : null;
        const storedValue = { value: this.serialize(value), expires };
        await this.store.set(namespacedKey, storedValue);
        return true;
    }

    async get(key, options = {}) {
        const { raw = false } = options;
        const namespacedKey = `${this.namespace}:${key}`;
        const storedValue = await this.store.get(namespacedKey);

        if (!storedValue) return undefined;
        
        if (storedValue.expires && Date.now() > storedValue.expires && !raw) {
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
        const namespacePrefix = `${this.namespace}:`;
        for (const key of this.store.keys()) {
            if (key.startsWith(namespacePrefix)) {
                await this.delete(key.substring(namespacePrefix.length));
            }
        }
    }

    async *[Symbol.asyncIterator]() {
        const namespacePrefix = `${this.namespace}:`;
        for (const [key, storedValue] of this.store.entries()) {
            if (key.startsWith(namespacePrefix)) {
                yield [key.substring(namespacePrefix.length), this.deserialize(storedValue.value)];
            }
        }
    }
}

module.exports = Keyv;

// Usage Example
const keyv = new Keyv({ uri: 'redis://localhost:6379' });
keyv.on('error', err => console.error('Connection Error', err));

// Example of setting, getting, and deleting a key-value pair
(async () => {
    await keyv.set('foo', 'bar', 1000);
    console.log(await keyv.get('foo')); // 'bar'
    await keyv.delete('foo');
    console.log(await keyv.get('foo')); // undefined
})();
