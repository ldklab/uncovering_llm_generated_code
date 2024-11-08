const { MongoClient } = require('mongodb');

async function main() {
  const url = 'mongodb://localhost:27017'; // MongoDB connection URL
  const client = new MongoClient(url); // MongoDB client instance

  const dbName = 'myProject'; // Database name to operate on

  try {
    await client.connect();
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('documents');

    // Insert documents into the collection
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    console.log('Inserted documents =>', insertResult);

    // Retrieve all documents from the collection
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);

    // Query documents with specific criteria
    const filteredDocs = await collection.find({ a: 3 }).toArray();
    console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

    // Update documents based on filter criteria
    const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
    console.log('Updated documents =>', updateResult);

    // Delete documents matching the criteria
    const deleteResult = await collection.deleteMany({ a: 3 });
    console.log('Deleted documents =>', deleteResult);

    // Create an index on the specified field
    const indexName = await collection.createIndex({ a: 1 });
    console.log('index name =', indexName);
  } catch (err) {
    console.error(err.stack); // Catch and log errors
  } finally {
    await client.close(); // Ensure the connection is closed
  }
}

main().catch(console.error); // Execute the main function and handle any errors
