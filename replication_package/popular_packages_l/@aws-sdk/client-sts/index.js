const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

// Initialize the STS client with the specified region
const client = new STSClient({ region: "us-east-1" });

// Function to get the caller identity
async function getCallerIdentity() {
  try {
    // Construct the command
    const command = new GetCallerIdentityCommand({});
    
    // Send the command using the client
    const data = await client.send(command);
    
    console.log("Caller identity:", data);
  } catch (error) {
    console.error("Error getting caller identity:", error);
  }
}

// Example function call
getCallerIdentity();
