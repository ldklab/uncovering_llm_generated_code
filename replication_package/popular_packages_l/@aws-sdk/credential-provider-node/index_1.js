const fs = require('fs');
const path = require('path');

// Constants for Default File Paths
const DEFAULT_CREDENTIALS_FILEPATH = path.join(process.env.HOME || process.env.USERPROFILE, '.aws', 'credentials');

// Function to load credentials from environment variables
function loadFromEnv() {
    const { AWS_ACCESS_KEY_ID: accessKeyId, AWS_SECRET_ACCESS_KEY: secretAccessKey } = process.env;
    return accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : null;
}

// Function to parse and load credentials from the specified credentials file
function loadFromCredentialsFile(filepath) {
    if (!fs.existsSync(filepath)) return null;
    
    const contents = fs.readFileSync(filepath, 'utf-8');
    const accessKeyId = contents.match(/aws_access_key_id\s*=\s*(.*)/)?.[1];
    const secretAccessKey = contents.match(/aws_secret_access_key\s*=\s*(.*)/)?.[1];

    return accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : null;
}

// Main provider function to gather AWS credentials from various sources
function defaultProvider({ filepath = DEFAULT_CREDENTIALS_FILEPATH } = {}) {
    // Attempt to load credentials from environment variables
    let credentials = loadFromEnv();
    if (credentials) return Promise.resolve(credentials);
    
    // Attempt to load credentials from the default/shared credentials file
    credentials = loadFromCredentialsFile(filepath);
    if (credentials) return Promise.resolve(credentials);

    // Additional credential sources like SSO, EC2 metadata, etc. would be implemented here
    
    // If no credentials are found, reject with an error
    return Promise.reject(new Error('No credentials found'));
}

// Example of how to use the defaultProvider function to get AWS credentials
defaultProvider()
    .then(credentials => console.log('Loaded credentials:', credentials))
    .catch(error => console.error('Failed to load credentials:', error));
