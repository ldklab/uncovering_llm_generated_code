import { createClient } from 'redis';

async function useRedis() {
    const redisClient = createClient();

    redisClient.on('error', (err) => console.error('Redis Error:', err));

    try {
        await redisClient.connect();

        // Setting and getting a key-value
        await redisClient.set('exampleKey', 'exampleValue');
        const retrievedValue = await redisClient.get('exampleKey');
        console.log('exampleKey:', retrievedValue);

        // Transaction block
        const [replySet, replyGet] = await redisClient
            .multi()
            .set('transKey', 'transValue')
            .get('transKey')
            .exec();

        console.log('Transaction set reply:', replySet);
        console.log('Transaction get reply:', replyGet);

        // Auto-pipelining
        await Promise.all([
            redisClient.set('pipeKey1', 'pipeValue1'),
            redisClient.set('pipeKey2', 'pipeValue2')
        ]);

        console.log('Pipelined commands completed.');
    } catch (error) {
        console.error('Error executing Redis commands:', error);
    } finally {
        await redisClient.quit();
    }
}

useRedis().catch(console.error);
