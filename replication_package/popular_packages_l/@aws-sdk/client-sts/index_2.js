const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

// Create and configure the STS client
const stsClient = new STSClient({ region: "us-east-1" });

// Function to retrieve and log the AWS caller identity
async function fetchCallerIdentity() {
  try {
    // Instantiate the command to get caller identity
    const callerIdentityCommand = new GetCallerIdentityCommand({});
    
    // Execute the command and await the response
    const response = await stsClient.send(callerIdentityCommand);
    
    // Print the caller identity to the console
    console.log("Caller identity:", response);
  } catch (err) {
    // Print any errors encountered during the request
    console.error("Error retrieving caller identity:", err);
  }
}

// Execute the function to retrieve caller identity
fetchCallerIdentity();
