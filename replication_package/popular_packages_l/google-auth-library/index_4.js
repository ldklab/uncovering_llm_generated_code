// server.js
const { GoogleAuth, OAuth2Client, JWT, Compute, ExternalAccountClient, Impersonated, DownscopedClient } = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = require('open');
const destroyer = require('server-destroy');

async function authenticateUsingAppDefaultCredentials() {
  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  const response = await client.request({ url: `https://dns.googleapis.com/dns/v1/projects/${projectId}` });
  console.log(response.data);
}

async function authenticateViaOAuth2() {
  const keys = require('./oauth2.keys.json');
  const oAuth2Client = new OAuth2Client(keys.web.client_id, keys.web.client_secret, keys.web.redirect_uris[0]);

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
  });

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url.includes('/oauth2callback')) {
        const queryString = new url.URL(req.url, 'http://localhost:3000').searchParams;
        const authorizationCode = queryString.get('code');
        res.end('Authentication successful! Return to the console.');
        server.destroy();

        const tokenResponse = await oAuth2Client.getToken(authorizationCode);
        oAuth2Client.setCredentials(tokenResponse.tokens);
        resolve(oAuth2Client);
      }
    }).listen(3000, () => open(authorizeUrl, { wait: false }).then(cp => cp.unref()));

    destroyer(server);
  });
}

async function authenticateWithJSONWebToken() {
  const keys = require('./jwt.keys.json');
  const jwtClient = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const response = await jwtClient.request({ url: `https://dns.googleapis.com/dns/v1/projects/${keys.project_id}` });
  console.log(response.data);
}

async function authenticateUsingWorkloadFederation() {
  const configPath = '/path/to/config.json';
  const jsonConfig = require(configPath);
  const externalClient = ExternalAccountClient.fromJSON(jsonConfig);
  externalClient.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
  const projectId = await externalClient.getProjectId();
  const response = await externalClient.request({ url: `https://storage.googleapis.com/storage/v1/b?project=${projectId}` });
  console.log(response.data);
}

async function authenticateWithImpersonatedCredentials() {
  const auth = new GoogleAuth();
  const sourceClient = await auth.getClient();
  const impersonatedClient = new Impersonated({
    sourceClient: sourceClient,
    targetPrincipal: 'impersonated-account@projectID.iam.gserviceaccount.com',
    lifetime: 30,
    targetScopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const response = await impersonatedClient.request({ url: `https://www.googleapis.com/storage/v1/b?project=anotherProjectID` });
  console.log(response.data);
}

async function authenticateWithDownscopedClient() {
  const cab = {
    accessBoundary: {
      accessBoundaryRules: [
        {
          availableResource: '//storage.googleapis.com/projects/_/buckets/bucket_name',
          availablePermissions: ['inRole:roles/storage.objectViewer'],
          availabilityCondition: {
            expression: `resource.name.startsWith('projects/_/buckets/bucket_name/objects/customer-a')`
          }
        },
      ],
    },
  };

  const googleAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const baseClient = await googleAuth.getClient();
  const downscopedClient = new DownscopedClient(baseClient, cab);

  const freshAccessToken = await downscopedClient.getAccessToken();
  console.log('Access Token:', freshAccessToken.token);
}

// Selecting an authentication function to execute
authenticateUsingAppDefaultCredentials().catch(console.error);
