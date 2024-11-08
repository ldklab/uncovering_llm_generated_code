const Redis = require('ioredis');

class RedisClient {
  constructor(options) {
    // Initializes a new Redis client instance with provided connection options
    this.redis = new Redis(options);
  }

  async set(key, value, expire = null) {
    // Sets a key-value pair in Redis, optionally setting an expiration time
    const args = [key, value];
    if (expire) {
      args.push('EX', expire); // Adds expiration time if provided
    }
    return await this.redis.set(...args);
  }

  async get(key) {
    // Retrieves the value associated with the specified key from Redis
    return await this.redis.get(key);
  }

  async publish(channel, message) {
    // Publishes a message to a specified channel in Redis
    return await this.redis.publish(channel, message);
  }

  async subscribe(channel, callback) {
    // Subscribes to a specified channel and listens for messages
    await this.redis.subscribe(channel);
    this.redis.on('message', callback); // Executes callback on message received
  }

  async runPipeline(commands) {
    // Executes a series of Redis commands as a pipeline
    const pipeline = this.redis.pipeline();
    commands.forEach(([command, ...args]) => {
      pipeline[command](...args); // Adds commands to the pipeline
    });
    return await pipeline.exec();
  }

  close() {
    // Closes the connection to the Redis server
    this.redis.disconnect();
  }
}

// Usage Example
(async () => {
  // Create a RedisClient instance pointing to 'localhost' on port 6379
  const client = new RedisClient({ host: 'localhost', port: 6379 });
  
  // Set a key-value pair with an expiration of 10 seconds
  await client.set('key', 'value', 10);
  
  // Retrieve and log the value associated with 'key'
  console.log(await client.get('key'));

  // Publish a message to 'channel' every second
  setInterval(async () => {
    await client.publish('channel', 'message');
  }, 1000);

  // Subscribe to 'channel' and log received messages
  client.subscribe('channel', (channel, message) => {
    console.log(`Received message: ${message} from channel: ${channel}`);
  });

  // Execute a pipeline of commands: set, get and delete a key
  const results = await client.runPipeline([
    ['set', 'key1', 'value1'],
    ['get', 'key1'],
    ['del', 'key1']
  ]);
  
  // Log the results of the pipeline execution
  console.log(results);

  // Close the Redis connection after 3 seconds
  setTimeout(() => client.close(), 3000);
})();
