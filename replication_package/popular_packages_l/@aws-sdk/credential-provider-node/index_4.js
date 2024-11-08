const fs = require('fs');
const path = require('path');

// Constants for Default File Paths
const DEFAULT_CREDENTIALS_FILEPATH = path.join(process.env.HOME || process.env.USERPROFILE, '.aws', 'credentials');
const DEFAULT_CONFIG_FILEPATH = path.join(process.env.HOME || process.env.USERPROFILE, '.aws', 'config');

// Function to load from environment variables
function loadFromEnv() {
    return { 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
    }.accessKeyId && { 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
    } || null;
}

// Function to load from shared credentials file
function loadFromCredentialsFile(filepath) {
    if (fs.existsSync(filepath)) {
        const contents = fs.readFileSync(filepath, 'utf-8');
        const accessKeyId = contents.match(/aws_access_key_id\s*=\s*(.*)/)?.[1];
        const secretAccessKey = contents.match(/aws_secret_access_key\s*=\s*(.*)/)?.[1];
        return accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : null;
    }
    return null;
}

// Simplified version of the defaultProvider function
function defaultProvider({ filepath = DEFAULT_CREDENTIALS_FILEPATH } = {}) {
    return new Promise((resolve, reject) => {
        let credentials = loadFromEnv();
        if (credentials) {
            return resolve(credentials);
        }

        credentials = loadFromCredentialsFile(filepath);
        if (credentials) {
            return resolve(credentials);
        }

        return reject(new Error('No credentials found'));
    });
}

// Usage example
defaultProvider()
    .then(credentials => {
        console.log('Loaded credentials:', credentials);
    })
    .catch(error => {
        console.error('Failed to load credentials:', error.message);
    });
