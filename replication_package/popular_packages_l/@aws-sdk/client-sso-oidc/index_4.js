const { SSOOIDCClient, CreateTokenCommand } = require("@aws-sdk/client-sso-oidc");

// Setup the AWS SSO OIDC client
const client = new SSOOIDCClient({ region: "us-west-2" });

// Parameters for creating a new token
const params = {
  clientId: "yourClientId",
  clientSecret: "yourClientSecret",
  grantType: "authorization_code",
  // Additional parameters as necessary
};

// Create a CreateTokenCommand instance with the specified parameters
const command = new CreateTokenCommand(params);

// Function to execute token creation
async function createToken() {
  try {
    // Attempt to send the command and receive token data
    const data = await client.send(command);
    console.log("Token Data: ", data);
  } catch (error) {
    // Log any errors encountered during the process
    console.error("Error creating token: ", error);
  }
}

// Execute the token creation function
createToken();
