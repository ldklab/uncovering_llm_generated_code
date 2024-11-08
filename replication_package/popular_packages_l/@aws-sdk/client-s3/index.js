// s3-client.js

const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");

class S3Service {
  constructor(region) {
    this.client = new S3Client({ region });
  }

  async listBuckets() {
    const command = new ListBucketsCommand({});
    try {
      const data = await this.client.send(command);
      return data.Buckets;
    } catch (error) {
      console.log(`Error: ${error.message}`, error.$metadata);
      throw error;
    }
  }

  close() {
    this.client.destroy();
  }
}

// Usage Example
async function main() {
  const s3Service = new S3Service("us-west-2");
  try {
    const buckets = await s3Service.listBuckets();
    console.log("Buckets:", buckets);
  } catch (error) {
    console.error("Failed to list buckets", error);
  } finally {
    s3Service.close();
  }
}

main();
