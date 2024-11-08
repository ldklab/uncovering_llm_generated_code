const { MongoClient } = require('mongodb');

async function main() {
  const url = 'mongodb://localhost:27017';
  const dbName = 'myProject';
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected to MongoDB server');

    const db = client.db(dbName);
    const collection = db.collection('documents');

    // Insert documents
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    console.log('Documents inserted:', insertResult);

    // Retrieve documents
    const allDocs = await collection.find({}).toArray();
    console.log('All documents:', allDocs);

    // Filtered retrieval
    const queryDocs = await collection.find({ a: 3 }).toArray();
    console.log('Filtered documents with a: 3:', queryDocs);

    // Update documents
    const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
    console.log('Update result:', updateResult);

    // Delete documents
    const deleteResult = await collection.deleteMany({ a: 3 });
    console.log('Delete result:', deleteResult);

    // Create index
    const indexName = await collection.createIndex({ a: 1 });
    console.log('Created index:', indexName);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

main().catch((error) => console.error('Main function error:', error));
