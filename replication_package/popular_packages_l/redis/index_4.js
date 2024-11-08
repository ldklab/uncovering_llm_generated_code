import { createClient } from 'redis';

async function createRedisClient() {
    const client = createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    await client.set('myKey', 'myValue');
    const value = await client.get('myKey');
    console.log('myKey:', value);

    const [setKeyReply, getKeyValue] = await client
      .multi()
      .set('transactionKey', 'transactionValue')
      .get('transactionKey')
      .exec();

    console.log('Transaction setKeyReply:', setKeyReply);
    console.log('Transaction getKeyValue:', getKeyValue);

    await Promise.all([
        client.set('pipelineKey1', 'value1'),
        client.set('pipelineKey2', 'value2'),
    ]);
    
    console.log('Pipelined commands executed.');

    await client.quit();
}

createRedisClient().catch(console.error);
