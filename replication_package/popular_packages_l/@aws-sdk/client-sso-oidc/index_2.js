const { SSOOIDCClient, CreateTokenCommand } = require("@aws-sdk/client-sso-oidc");

const client = new SSOOIDCClient({ region: "us-west-2" });

const params = {
  clientId: "yourClientId",
  clientSecret: "yourClientSecret",
  grantType: "authorization_code",
};

const command = new CreateTokenCommand(params);

async function createToken() {
  try {
    const data = await client.send(command);
    console.log("Token Data: ", data);
  } catch (error) {
    console.error("Error creating token: ", error);
  }
}

createToken();
