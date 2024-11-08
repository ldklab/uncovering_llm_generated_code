// index.js - Entry point of the Node.js package
const path = require('path');
const fs = require('fs');

// Base directory for data files
const dataDir = path.join(__dirname, 'data');

/**
 * Load JSON data from a specified file within the data directory.
 * 
 * @param {string} category - The category of data to load ('api' or 'css').
 * @param {string} filename - The name of the JSON file to load data from.
 * @returns {Object} - The JSON data from the file.
 */
function loadData(category, filename) {
  try {
    const filePath = path.join(dataDir, category, `${filename}.json`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error loading data from ${filename}:`, error);
    return null;
  }
}

/**
 * Get CSS data for a specific element.
 *
 * @param {string} type - The type of CSS element ('properties', 'selectors', etc.).
 * @returns {Object|null} - The data for the specified CSS element type or null if not available.
 */
function getCssData(type) {
  return loadData('css', type);
}

/**
 * Get API data for a specific API element.
 *
 * @param {string} apiName - The name of the API to retrieve data for.
 * @returns {Object|null} - The API data or null if not available.
 */
function getApiData(apiName) {
  return loadData('api', apiName);
}

module.exports = {
  getCssData,
  getApiData
};

// Example usage - This would usually be executed elsewhere, like in tests or another file
const cssProperties = getCssData('properties');
const apiData = getApiData('fetch');
console.log('CSS Properties:', cssProperties);
console.log('API Data:', apiData);
