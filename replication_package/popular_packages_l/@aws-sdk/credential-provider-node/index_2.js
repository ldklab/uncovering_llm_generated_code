const fs = require('fs');
const path = require('path');

// Constants for Default File Paths
const DEFAULT_CREDENTIALS_FILEPATH = path.join(process.env.HOME || process.env.USERPROFILE, '.aws', 'credentials');

// Function to load credentials from environment variables
const loadCredentialsFromEnv = () => {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
    return AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ?
        { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } : null;
};

// Function to load credentials from specified file
const loadCredentialsFromFile = (filepath) => {
    if (fs.existsSync(filepath)) {
        const contents = fs.readFileSync(filepath, 'utf-8');
        const accessKeyId = contents.match(/aws_access_key_id\s*=\s*(.*)/)?.[1];
        const secretAccessKey = contents.match(/aws_secret_access_key\s*=\s*(.*)/)?.[1];
        return accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : null;
    }
    return null;
};

// Default provider to fetch AWS credentials
const getDefaultProvider = ({ filepath = DEFAULT_CREDENTIALS_FILEPATH } = {}) => {
    return new Promise((resolve, reject) => {
        let credentials = loadCredentialsFromEnv();
        if (credentials) return resolve(credentials);

        credentials = loadCredentialsFromFile(filepath);
        if (credentials) return resolve(credentials);

        reject(new Error('No credentials found'));
    });
};

// Usage demonstration
getDefaultProvider()
    .then(credentials => console.log('Loaded credentials:', credentials))
    .catch(error => console.error('Failed to load credentials:', error));
