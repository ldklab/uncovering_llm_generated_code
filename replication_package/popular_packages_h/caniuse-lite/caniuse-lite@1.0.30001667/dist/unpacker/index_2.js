// Import the 'agents' object from './agents.js' module and assign it to 'agents' property
const { agents } = require('./agents');

// Import the entire module exported from './feature.js' and assign it to 'feature' property
const feature = require('./feature');

// Import the 'features' object from './features.js' module and assign it to 'features' property
const { features } = require('./features');

// Import the entire module exported from './region.js' and assign it to 'region' property
const region = require('./region');

// Export the above imported properties as a part of the module.exports
module.exports = {
  agents,
  feature,
  features,
  region
};
