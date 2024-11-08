import { createClient } from 'redis';

async function createRedisClient() {
    // Create and configure a Redis client
    const client = createClient();

    // Log errors
    client.on('error', (err) => console.log('Redis Client Error', err));

    // Connect the client to the Redis server
    await client.connect();

    // Perform basic set and get operations
    await client.set('myKey', 'myValue');
    const value = await client.get('myKey');
    console.log('myKey:', value);

    // Executing a transaction with multi/exec
    const [setKeyReply, getKeyValue] = await client
        .multi() // Start a transaction
        .set('transactionKey', 'transactionValue') // Set a key within transaction
        .get('transactionKey') // Get the key within transaction
        .exec(); // Execute the transaction

    console.log('Transaction setKeyReply:', setKeyReply);
    console.log('Transaction getKeyValue:', getKeyValue);

    // Auto-pipelining: Send multiple commands in a single batch
    const pipelinePromises = [
        client.set('pipelineKey1', 'value1'), // Set first key
        client.set('pipelineKey2', 'value2'), // Set second key
    ];
    await Promise.all(pipelinePromises);
    console.log('Pipelined commands executed.');

    // Disconnect the client
    await client.quit();
}

// Invoke the function and handle any errors
createRedisClient().catch(console.error);
