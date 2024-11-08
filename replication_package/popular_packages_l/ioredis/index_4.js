const Redis = require('ioredis');

class RedisClient {
  constructor(options) {
    this.redis = new Redis(options);
  }

  async set(key, value, expire = null) {
    const args = [key, value];
    if (expire) {
      args.push('EX', expire);
    }
    return await this.redis.set(...args);
  }

  async get(key) {
    return await this.redis.get(key);
  }

  async publish(channel, message) {
    return await this.redis.publish(channel, message);
  }

  async subscribe(channel, callback) {
    await this.redis.subscribe(channel);
    this.redis.on('message', callback);
  }

  async runPipeline(commands) {
    const pipeline = this.redis.pipeline();
    commands.forEach(([command, ...args]) => {
      pipeline[command](...args);
    });
    return await pipeline.exec();
  }

  close() {
    this.redis.disconnect();
  }
}

(async () => {
  const client = new RedisClient({ host: 'localhost', port: 6379 });
  
  await client.set('key', 'value', 10);
  console.log(await client.get('key'));

  setInterval(async () => {
    await client.publish('channel', 'message');
  }, 1000);

  client.subscribe('channel', (channel, message) => {
    console.log(`Received message: ${message} from channel: ${channel}`);
  });

  const results = await client.runPipeline([
    ['set', 'key1', 'value1'],
    ['get', 'key1'],
    ['del', 'key1']
  ]);
  console.log(results);

  setTimeout(() => client.close(), 3000);
})();
