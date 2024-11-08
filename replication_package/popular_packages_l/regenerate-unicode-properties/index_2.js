// directory: regenerate-unicode-properties/index.js
const fs = require('fs');
const path = require('path');

// Retrieve Unicode properties from categorized files
function getProperties() {
  const propertiesDir = __dirname;
  const properties = {};
  
  // Read through each category (subdirectory) in the current directory
  fs.readdirSync(propertiesDir).forEach(category => {
    const categoryPath = path.join(propertiesDir, category);
    
    // If a category is a directory, further process files within
    if (fs.lstatSync(categoryPath).isDirectory()) {
      properties[category] = {};
      
      // Read each JavaScript file within the directory
      fs.readdirSync(categoryPath).forEach(file => {
        if (file.endsWith('.js')) {
          const propertyName = path.basename(file, '.js');
          
          // Require the file to get the character set from its exports
          const propertyModule = require(path.join(categoryPath, file));
          properties[category][propertyName] = propertyModule.characters;
        }
      });
    }
  });
  
  return properties;
}

// Export the collected properties immediately
module.exports = getProperties();

// directory: regenerate-unicode-properties/General_Category/Uppercase_Letter.js
const regenerate = require('regenerate');

exports.characters = regenerate()
  .addRange(0x0041, 0x005A) // Characters A-Z
  .addRange(0x00C0, 0x00D6) // Characters À-Ö
  .addRange(0x00D8, 0x00DE); // Characters Ø-Þ

// directory: regenerate-unicode-properties/Script_Extensions/Greek.js
const regenerate = require('regenerate');

exports.characters = regenerate()
  .addRange(0x0370, 0x03FF); // Characters from Greek and Coptic block

// directory: regenerate-unicode-properties/Property_of_Strings/Basic_Emoji.js
const regenerate = require('regenerate');

exports.characters = regenerate()
  .addRange(0x1F600, 0x1F64F); // Emoticon range

// Additional specific emojis exported as strings
exports.strings = ['😀', '😁', '😂', '🤣', '😃', '😄'];

// directory: regenerate-unicode-properties/unicode-version.js
module.exports = 'Unicode 13.0.0';
