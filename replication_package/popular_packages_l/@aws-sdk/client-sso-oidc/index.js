// Importing necessary components from the package
const { SSOOIDCClient, CreateTokenCommand } = require("@aws-sdk/client-sso-oidc");

// Initialize the client
const client = new SSOOIDCClient({ region: "us-west-2" });

// Define input parameters for the CreateTokenCommand
const params = {
  // Example parameters for token creation
  clientId: "yourClientId",
  clientSecret: "yourClientSecret",
  grantType: "authorization_code",
  // Add other necessary parameters
};

// Create an instance of the command
const command = new CreateTokenCommand(params);

// Define an async function to execute the command
async function createToken() {
  try {
    // Sending the command
    const data = await client.send(command);
    console.log("Token Data: ", data);
  } catch (error) {
    // Error handling
    console.error("Error creating token: ", error);
  }
}

// Call the function
createToken();
