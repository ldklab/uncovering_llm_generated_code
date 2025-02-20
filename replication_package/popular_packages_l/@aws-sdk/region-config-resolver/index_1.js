// package.json
{
  "name": "@aws-sdk/region-config-resolver",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT"
}

// index.js

// Export functions related to AWS region configuration
module.exports = {
  resolveRegionFromEnv,
  validateRegion,
  getRegionEndpoint,
  listAvailableRegions
};

// Define supported AWS regions
const availableRegions = [
  'us-east-1', 'us-west-2', 'eu-west-1', // List other available regions here
];

// Function to retrieve the AWS region from environment variables
function resolveRegionFromEnv() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || null;
}

// Function to validate if the specified region is supported
function validateRegion(region) {
  if (!region || !availableRegions.includes(region)) {
    throw new Error(`Invalid AWS region: ${region}`);
  }
  return true;
}

// Function to generate the endpoint URL for the given region
function getRegionEndpoint(region) {
  if (!region) {
    throw new Error("Region is required to get endpoint.");
  }
  return `https://service.${region}.amazonaws.com`; // Mock endpoint generation
}

// Function to list all supported AWS regions
function listAvailableRegions() {
  return availableRegions;
}

// Example demonstration of using the module's methods
try {
  const region = resolveRegionFromEnv(); // Try to resolve region from the environment
  validateRegion(region);                // Validate the resolved region
  console.log(`Using region: ${region}`);           // Output the region being used
  console.log(`Endpoint: ${getRegionEndpoint(region)}`); // Output the service endpoint
  console.log(`Available regions: ${listAvailableRegions().join(', ')}`); // List supported regions
} catch (error) {
  console.error(error.message); // Handle and display error if region is invalid
}
