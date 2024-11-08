import { createClient } from 'redis';

async function createRedisClient() {
    // Create a Redis client
    const client = createClient();

    // Attach an error handler to catch and log any errors
    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    // Basic usage: set a key-value pair
    await client.set('myKey', 'myValue');

    // Retrieve the value for a given key
    const value = await client.get('myKey');
    console.log('myKey:', value);

    // Example of transaction: multi/exec
    const [setKeyReply, getKeyValue] = await client
      .multi()
      .set('transactionKey', 'transactionValue')
      .get('transactionKey')
      .exec();

    console.log('Transaction setKeyReply:', setKeyReply); // Should log "OK"
    console.log('Transaction getKeyValue:', getKeyValue); // Should log "transactionValue"

    // Use auto-pipelining by making requests in the same tick
    const promises = [
        client.set('pipelineKey1', 'value1'),
        client.set('pipelineKey2', 'value2'),
    ];
    await Promise.all(promises);
    
    console.log('Pipelined commands executed.');

    // Disconnecting from the Redis server
    await client.quit();
}

createRedisClient().catch(console.error);
