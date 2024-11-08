const { SSOOIDCClient, CreateTokenCommand } = require("@aws-sdk/client-sso-oidc");

(async function generateToken() {
  const client = new SSOOIDCClient({ region: "us-west-2" });
  
  const tokenParams = {
    clientId: "yourClientId",
    clientSecret: "yourClientSecret",
    grantType: "authorization_code",
    // Include additional necessary parameters
  };
  
  const tokenCommand = new CreateTokenCommand(tokenParams);
  
  try {
    const tokenData = await client.send(tokenCommand);
    console.log("Token retrieved successfully:", tokenData);
  } catch (err) {
    console.error("Failed to retrieve token:", err);
  }
})();
