const { SSOOIDCClient, CreateTokenCommand } = require("@aws-sdk/client-sso-oidc");

async function createToken() {
  const client = new SSOOIDCClient({ region: "us-west-2" });

  const params = {
    clientId: "yourClientId",
    clientSecret: "yourClientSecret",
    grantType: "authorization_code",
    // Add other necessary parameters specific to your use case
  };

  const command = new CreateTokenCommand(params);

  try {
    const data = await client.send(command);
    console.log("Token Data: ", data);
  } catch (error) {
    console.error("Error creating token: ", error);
  }
}

createToken();
