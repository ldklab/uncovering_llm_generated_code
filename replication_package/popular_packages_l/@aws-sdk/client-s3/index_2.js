// s3-client.js

const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");

class S3Service {
  constructor(region) {
    this.client = new S3Client({ region });
  }

  async listBuckets() {
    try {
      const data = await this.client.send(new ListBucketsCommand({}));
      return data.Buckets;
    } catch (error) {
      console.error(`Error fetching buckets: ${error.message}`, error.$metadata);
      throw error;
    }
  }

  close() {
    this.client.destroy();
  }
}

(async function () {
  const s3Service = new S3Service("us-west-2");
  try {
    const buckets = await s3Service.listBuckets();
    console.log("Buckets:", buckets);
  } catch (error) {
    console.error("Failed to list buckets", error);
  } finally {
    s3Service.close();
  }
})();
