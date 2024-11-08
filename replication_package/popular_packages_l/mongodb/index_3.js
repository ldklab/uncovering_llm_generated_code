const { MongoClient } = require('mongodb');

async function run() {
  const url = 'mongodb://localhost:27017'; // MongoDB server URL
  const client = new MongoClient(url); // MongoDB client instance

  const dbName = 'myProject'; // Database name

  try {
    await client.connect(); // Connect to the MongoDB server
    console.log('Connected to MongoDB server');

    const db = client.db(dbName); // Access the specified database
    const collection = db.collection('documents'); // Access the collection

    // Insert sample documents into the collection
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    console.log('Documents inserted:', insertResult);

    // Find all documents in the collection
    const documents = await collection.find({}).toArray();
    console.log('All documents:', documents);

    // Find documents with a specific condition
    const specificDocs = await collection.find({ a: 3 }).toArray();
    console.log('Documents with a:3:', specificDocs);

    // Update documents matching a condition
    const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
    console.log('Document update result:', updateResult);

    // Delete documents matching a condition
    const deleteResult = await collection.deleteMany({ a: 3 });
    console.log('Documents deleted:', deleteResult);

    // Create an index on the collection
    const index = await collection.createIndex({ a: 1 });
    console.log('Index created:', index);
  } catch (error) {
    console.error('An error occurred:', error.stack); // Handle errors
  } finally {
    await client.close(); // Ensure the client connection is closed
  }
}

run().catch(console.error); // Execute the run function and catch any errors
