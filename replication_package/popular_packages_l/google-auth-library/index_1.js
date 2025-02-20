// server.js - Refactored version
const { GoogleAuth, OAuth2Client, JWT, Compute, ExternalAccountClient, Impersonated, DownscopedClient } = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = require('open');
const destroyer = require('server-destroy');

async function useAppDefaultCredentials() {
  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  const response = await client.request({ url: `https://dns.googleapis.com/dns/v1/projects/${projectId}` });
  console.log(response.data);
}

async function useOAuth2() {
  const keys = require('./oauth2.keys.json');
  const oAuth2Client = new OAuth2Client(keys.web.client_id, keys.web.client_secret, keys.web.redirect_uris[0]);

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
  });

  return new Promise((resolve, reject) => {
    const server = http
      .createServer(async (req, res) => {
        if (req.url.indexOf('/oauth2callback') > -1) {
          const querystring = new url.URL(req.url, 'http://localhost:3000').searchParams;
          const code = querystring.get('code');
          res.end('Authentication successful! Please return to the console.');
          server.destroy();

          const tokenResponse = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokenResponse.tokens);
          resolve(oAuth2Client);
        }
      })
      .listen(3000, () => open(authorizeUrl, { wait: false }).then(cp => cp.unref()));

    destroyer(server);
  });
}

async function useJSONWebToken() {
  const keys = require('./jwt.keys.json');
  const client = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const response = await client.request({ url: `https://dns.googleapis.com/dns/v1/projects/${keys.project_id}` });
  console.log(response.data);
}

async function useWorkloadFederation() {
  const jsonConfig = require('/path/to/config.json');
  const client = ExternalAccountClient.fromJSON(jsonConfig);
  client.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
  const projectId = await client.getProjectId();
  const response = await client.request({ url: `https://storage.googleapis.com/storage/v1/b?project=${projectId}` });
  console.log(response.data);
}

async function useImpersonatedCredentials() {
  const auth = new GoogleAuth();
  const client = await auth.getClient();
  const targetClient = new Impersonated({
    sourceClient: client,
    targetPrincipal: 'impersonated-account@projectID.iam.gserviceaccount.com',
    lifetime: 30,
    delegates: [],
    targetScopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const response = await targetClient.request({ url: `https://www.googleapis.com/storage/v1/b?project=anotherProjectID` });
  console.log(response.data);
}

async function useDownscopedClient() {
  const accessBoundary = {
    accessBoundary: {
      accessBoundaryRules: [
        {
          availableResource: '//storage.googleapis.com/projects/_/buckets/bucket_name',
          availablePermissions: ['inRole:roles/storage.objectViewer'],
          availabilityCondition: {
            expression: `resource.name.startsWith('projects/_/buckets/bucket_name/objects/customer-a')`,
          },
        },
      ],
    },
  };

  const googleAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await googleAuth.getClient();
  const cabClient = new DownscopedClient(client, accessBoundary);

  const refreshedToken = await cabClient.getAccessToken();
  console.log('Access Token:', refreshedToken.token);
}

// Example function call to demonstrate usage
useAppDefaultCredentials().catch(console.error);
