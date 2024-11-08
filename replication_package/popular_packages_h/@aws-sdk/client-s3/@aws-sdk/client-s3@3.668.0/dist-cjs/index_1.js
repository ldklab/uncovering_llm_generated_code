const S3 = require("aws-sdk/clients/s3");

class S3Service {
  constructor() {
    this.s3 = new S3({
      region: "us-east-1",
      // Add other configurations if needed
    });
  }

  async createBucket(bucketName) {
    return this.s3.createBucket({ Bucket: bucketName }).promise();
  }

  async uploadObject(bucketName, key, data) {
    return this.s3.putObject({
      Bucket: bucketName,
      Key: key,
      Body: data
    }).promise();
  }

  async getObject(bucketName, key) {
    return this.s3.getObject({
      Bucket: bucketName,
      Key: key,
    }).promise();
  }

  async deleteObject(bucketName, key) {
    return this.s3.deleteObject({
      Bucket: bucketName,
      Key: key
    }).promise();
  }

  async listObjects(bucketName, prefix) {
    return this.s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: prefix,
    }).promise();
  }

  async deleteBucket(bucketName) {
    return this.s3.deleteBucket({ Bucket: bucketName }).promise();
  }
}

module.exports = S3Service;

// Usage example
(async () => {
  const s3Service = new S3Service();
  try {
    await s3Service.createBucket("my-test-bucket");
    console.log("Bucket created");
  } catch (error) {
    console.error("Error creating bucket:", error);
  }
})();
