const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

async function fetchCallerIdentity() {
  const stsClient = new STSClient({ region: "us-east-1" });
  const identityCommand = new GetCallerIdentityCommand({});

  try {
    const result = await stsClient.send(identityCommand);
    console.log("Caller identity:", result);
  } catch (err) {
    console.error("Failed to get caller identity:", err);
  }
}

fetchCallerIdentity();
