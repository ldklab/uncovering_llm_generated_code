const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

// Create STS client for the specified AWS region
const stsClient = new STSClient({ region: "us-east-1" });

// Async function to retrieve and display the caller's identity
async function displayCallerIdentity() {
  try {
    // Instantiate the command to get caller identity
    const getCommand = new GetCallerIdentityCommand({});

    // Execute the command with the STS client
    const response = await stsClient.send(getCommand);

    console.log("Caller Identity Information:", response);
  } catch (err) {
    console.error("Failed to fetch caller identity:", err);
  }
}

// Trigger the example function to show caller identity
displayCallerIdentity();
