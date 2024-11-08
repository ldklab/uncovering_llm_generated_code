'use strict';

const EventEmitter = require('events');
const JSONB = require('json-buffer');

const loadStore = options => {
	const adapterMap = {
		redis: '@keyv/redis',
		mongodb: '@keyv/mongo',
		mongo: '@keyv/mongo',
		sqlite: '@keyv/sqlite',
		postgresql: '@keyv/postgres',
		postgres: '@keyv/postgres',
		mysql: '@keyv/mysql'
	};
	if (options.adapter || options.uri) {
		const adapterKey = options.adapter || /^[^:]*/.exec(options.uri)[0];
		return new (require(adapterMap[adapterKey]))(options);
	}

	return new Map();
};

class Keyv extends EventEmitter {
	constructor(uri, options) {
		super();
		this.opts = Object.assign({
				namespace: 'keyv',
				serialize: JSONB.stringify,
				deserialize: JSONB.parse
			},
			(typeof uri === 'string') ? { uri } : uri,
			options
		);

		if (!this.opts.store) {
			const storeOptions = Object.assign({}, this.opts);
			this.opts.store = loadStore(storeOptions);
		}

		if (typeof this.opts.store.on === 'function') {
			this.opts.store.on('error', error => this.emit('error', error));
		}

		this.opts.store.namespace = this.opts.namespace;
	}

	_getKeyPrefix(key) {
		return `${this.opts.namespace}:${key}`;
	}

	async get(key, options) {
		const keyPrefixed = this._getKeyPrefix(key);
		const { store } = this.opts;
		const data = await store.get(keyPrefixed);
		const parsedData = (typeof data === 'string') ? this.opts.deserialize(data) : data;

		if (parsedData === undefined) {
			return undefined;
		}

		if (typeof parsedData.expires === 'number' && Date.now() > parsedData.expires) {
			await this.delete(key);
			return undefined;
		}

		return (options && options.raw) ? parsedData : parsedData.value;
	}

	async set(key, value, ttl) {
		const keyPrefixed = this._getKeyPrefix(key);
		ttl = ttl !== undefined ? ttl : this.opts.ttl;
		ttl = ttl === 0 ? undefined : ttl;

		const { store } = this.opts;
		const expires = typeof ttl === 'number' ? (Date.now() + ttl) : null;
		const valueToStore = { value, expires };
		const serializedValue = this.opts.serialize(valueToStore);

		await store.set(keyPrefixed, serializedValue, ttl);
		return true;
	}

	async delete(key) {
		const keyPrefixed = this._getKeyPrefix(key);
		const { store } = this.opts;
		return store.delete(keyPrefixed);
	}

	async clear() {
		const { store } = this.opts;
		return store.clear();
	}
}

module.exports = Keyv;
