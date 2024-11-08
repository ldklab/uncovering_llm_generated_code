const { MongoClient } = require('mongodb');

async function main() {
  // Connection URL
  const url = 'mongodb://localhost:27017';
  const client = new MongoClient(url);

  // Database Name
  const dbName = 'myProject';

  try {
    // Use connect method to connect to the Server
    await client.connect();
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('documents');

    // Insert some documents
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    console.log('Inserted documents =>', insertResult);

    // Find all documents
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);

    // Find documents with a query filter
    const filteredDocs = await collection.find({ a: 3 }).toArray();
    console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

    // Update a document
    const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
    console.log('Updated documents =>', updateResult);

    // Remove a document
    const deleteResult = await collection.deleteMany({ a: 3 });
    console.log('Deleted documents =>', deleteResult);

    // Index a collection
    const indexName = await collection.createIndex({ a: 1 });
    console.log('index name =', indexName);
  } catch (err) {
    console.error(err.stack);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error);