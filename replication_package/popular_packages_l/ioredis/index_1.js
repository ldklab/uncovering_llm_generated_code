const Redis = require('ioredis');

class RedisClient {
  constructor(options) {
    // Initialize a Redis connection using the provided options
    this.redis = new Redis(options);
  }

  // Set a key-value pair in Redis with optional expiration time (in seconds)
  async set(key, value, expire = null) {
    const args = [key, value];
    if (expire) args.push('EX', expire);
    return await this.redis.set(...args);
  }

  // Retrieve the value of a given key from Redis
  async get(key) {
    return await this.redis.get(key);
  }

  // Publish a message to a specific Redis channel
  async publish(channel, message) {
    return await this.redis.publish(channel, message);
  }

  // Subscribe to a Redis channel and register a callback for messages
  async subscribe(channel, callback) {
    await this.redis.subscribe(channel);
    this.redis.on('message', (chan, msg) => {
      if (chan === channel) callback(chan, msg);
    });
  }

  // Execute a series of Redis commands as a pipeline
  async runPipeline(commands) {
    const pipeline = this.redis.pipeline();
    commands.forEach(([command, ...args]) => {
      pipeline[command](...args);
    });
    return await pipeline.exec();
  }

  // Close the Redis connection
  close() {
    this.redis.disconnect();
  }
}

// Usage Example: Demonstrates basic usage of the RedisClient
(async () => {
  const client = new RedisClient({ host: 'localhost', port: 6379 });
  
  // Set a key-value pair with a 10 second expiration
  await client.set('key', 'value', 10);
  console.log(await client.get('key')); // Retrieve the value of 'key'

  // Publish a message to a channel every second
  setInterval(async () => {
    await client.publish('channel', 'message');
  }, 1000);

  // Subscribe to a channel and log received messages
  client.subscribe('channel', (channel, message) => {
    console.log(`Received message: ${message} from channel: ${channel}`);
  });

  // Run a Redis command pipeline
  const results = await client.runPipeline([
    ['set', 'key1', 'value1'],
    ['get', 'key1'],
    ['del', 'key1']
  ]);
  console.log(results); // Log the results of the pipeline

  // Close the client after 3 seconds
  setTimeout(() => client.close(), 3000);
})();
