import { createClient } from 'redis';

async function connectToRedis() {
    const client = createClient();

    client.on('error', (err) => console.error('Redis Client Error:', err));

    try {
        await client.connect();

        // Set and get a simple key-value pair
        await client.set('sampleKey', 'sampleValue');
        const retrievedValue = await client.get('sampleKey');
        console.log('sampleKey:', retrievedValue);

        // Perform a transaction
        const [transactionSet, transactionGet] = await client
            .multi()
            .set('transactionSample', 'transactionData')
            .get('transactionSample')
            .exec();

        console.log('Transaction Set Response:', transactionSet); // Should log "OK"
        console.log('Transaction Get Response:', transactionGet); // Should log "transactionData"

        // Execute pipelined commands
        const pipelineOperations = [
            client.set('pipelineSample1', 'valueA'),
            client.set('pipelineSample2', 'valueB'),
        ];
        await Promise.all(pipelineOperations);
        console.log('Pipelined operations completed successfully.');

    } finally {
        await client.quit();
    }
}

connectToRedis().catch(console.error);
