const fs = require('fs');
const path = require('path');

// Constants for Default File Paths
const DEFAULT_CREDENTIALS_FILEPATH = path.join(process.env.HOME || process.env.USERPROFILE, '.aws', 'credentials');
const DEFAULT_CONFIG_FILEPATH = path.join(process.env.HOME || process.env.USERPROFILE, '.aws', 'config');

// Function to simulate loading from environment variables
function getCredentialsFromEnv() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    return (accessKeyId && secretAccessKey) ? { accessKeyId, secretAccessKey } : null;
}

// Function to simulate loading from shared credentials file
function getCredentialsFromFile(filepath) {
    if (!fs.existsSync(filepath)) return null;
    
    const contents = fs.readFileSync(filepath, 'utf-8');
    const accessKeyId = contents.match(/aws_access_key_id\s*=\s*(.*)/)?.[1];
    const secretAccessKey = contents.match(/aws_secret_access_key\s*=\s*(.*)/)?.[1];
    
    return (accessKeyId && secretAccessKey) ? { accessKeyId, secretAccessKey } : null;
}

// Default Provider Function
function fetchDefaultCredentials({ filepath = DEFAULT_CREDENTIALS_FILEPATH } = {}) {
    let credentials = getCredentialsFromEnv();
    if (credentials) return Promise.resolve(credentials);
    
    credentials = getCredentialsFromFile(filepath);
    if (credentials) return Promise.resolve(credentials);
    
    return Promise.reject(new Error('No credentials found'));
}

// Usage Example
fetchDefaultCredentials()
    .then(credentials => {
        console.log('Loaded credentials:', credentials);
    })
    .catch(error => {
        console.error('Failed to load credentials:', error);
    });
