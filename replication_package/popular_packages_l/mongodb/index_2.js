const { MongoClient } = require('mongodb');

async function main() {
  const url = 'mongodb://localhost:27017';
  const client = new MongoClient(url);
  const dbName = 'myProject';

  try {
    await client.connect();
    console.log('Connected successfully to server');
    
    const db = client.db(dbName);
    const collection = db.collection('documents');

    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    console.log('Inserted documents =>', insertResult);

    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);

    const filteredDocs = await collection.find({ a: 3 }).toArray();
    console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

    const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
    console.log('Updated documents =>', updateResult);

    const deleteResult = await collection.deleteMany({ a: 3 });
    console.log('Deleted documents =>', deleteResult);

    const indexName = await collection.createIndex({ a: 1 });
    console.log('index name =', indexName);
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
