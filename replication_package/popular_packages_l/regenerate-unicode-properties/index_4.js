// directory: regenerate-unicode-properties/index.js
const fs = require('fs');
const path = require('path');

// The properties directory is defined here
const propertiesDir = __dirname;

// Function to get Unicode properties by reading files in subdirectories
function getProperties() {
  const properties = {};
  
  // Read the directory synchronously
  fs.readdirSync(propertiesDir).forEach(category => {
    const categoryPath = path.join(propertiesDir, category);
    
    // Check if the categoryPath is a directory
    if (fs.statSync(categoryPath).isDirectory()) {
      properties[category] = {};
      
      // Read each file in the directory
      fs.readdirSync(categoryPath).forEach(file => {
        // Only process .js files
        if (file.endsWith('.js')) {
          const propertyName = path.basename(file, '.js');
          // Load the 'characters' export from the file
          properties[category][propertyName] = require(path.join(categoryPath, file)).characters;
        }
      });
    }
  });

  return properties;
}

// Export the properties as a module
module.exports = getProperties();

// directory: regenerate-unicode-properties/General_Category/Uppercase_Letter.js
const regenerate = require('regenerate');
exports.characters = regenerate()
  .addRange(0x0041, 0x005A) // A-Z
  .addRange(0x00C0, 0x00D6) // À-Ö
  .addRange(0x00D8, 0x00DE); // Ø-Þ

// directory: regenerate-unicode-properties/Script_Extensions/Greek.js
const regenerate = require('regenerate');
exports.characters = regenerate()
  .addRange(0x0370, 0x03FF); // Greek and Coptic

// directory: regenerate-unicode-properties/Property_of_Strings/Basic_Emoji.js
const regenerate = require('regenerate');
exports.characters = regenerate().addRange(0x1F600, 0x1F64F); // Emoticons
exports.strings = ['😀', '😁', '😂', '🤣', '😃', '😄']; // List of example emojis

// directory: regenerate-unicode-properties/unicode-version.js
module.exports = 'Unicode 13.0.0';
