// index.js - Entry point of the Node.js package
const path = require('path');
const fs = require('fs');

// Base directory for data files
const dataDirectory = path.join(__dirname, 'data');

/**
 * Load JSON data from a specified file within the data directory.
 * 
 * @param {string} category - Category of data to load ('api' or 'css').
 * @param {string} filename - JSON filename to load data from.
 * @returns {Object} - JSON data from the file.
 */
function loadJsonData(category, filename) {
  const filePath = path.join(dataDirectory, category, `${filename}.json`);
  try {
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (err) {
    console.error(`Failed to load data from '${filename}':`, err);
    return null;
  }
}

/**
 * Retrieve CSS data for a specified element type.
 *
 * @param {string} elementType - Type of CSS element ('properties', 'selectors', etc.).
 * @returns {Object|null} - Data for the specified CSS element type or null if unavailable.
 */
function fetchCssData(elementType) {
  return loadJsonData('css', elementType);
}

/**
 * Retrieve API data for a specified API.
 *
 * @param {string} apiIdentifier - Identifier of the API to get data for.
 * @returns {Object|null} - API data or null if unavailable.
 */
function fetchApiData(apiIdentifier) {
  return loadJsonData('api', apiIdentifier);
}

module.exports = {
  fetchCssData,
  fetchApiData
};

// Example usage - Typically executed elsewhere, like tests or a different module
const cssProps = fetchCssData('properties');
const apiInfo = fetchApiData('fetch');
console.log('CSS Properties:', cssProps);
console.log('API Information:', apiInfo);
