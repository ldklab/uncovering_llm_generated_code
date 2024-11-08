const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

// Create an STS client configured for the 'us-east-1' AWS region
const client = new STSClient({ region: "us-east-1" });

// Function to retrieve and log the caller's identity
async function getCallerIdentity() {
  try {
    // Initiate the GetCallerIdentityCommand
    const command = new GetCallerIdentityCommand({});
    
    // Execute the command and await the response
    const response = await client.send(command);
    
    // Log the successful retrieval of caller identity data
    console.log("Caller identity:", response);
  } catch (error) {
    // Log any errors encountered during execution
    console.error("Error getting caller identity:", error);
  }
}

// Invoke the function to fetch and output the caller's identity
getCallerIdentity();
