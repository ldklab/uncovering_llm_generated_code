// directory: regenerate-unicode-properties/index.js
const fs = require('fs');
const path = require('path');

const propertiesDir = __dirname;

function getProperties() {
  const properties = {};
  fs.readdirSync(propertiesDir).forEach(category => {
    const categoryPath = path.join(propertiesDir, category);
    if (fs.statSync(categoryPath).isDirectory()) {
      properties[category] = {};
      fs.readdirSync(categoryPath).forEach(file => {
        if (file.endsWith('.js')) {
          const propertyName = path.basename(file, '.js');
          properties[category][propertyName] = require(path.join(categoryPath, file)).characters;
        }
      });
    }
  });
  return properties;
}

module.exports = getProperties();

// directory: regenerate-unicode-properties/General_Category/Uppercase_Letter.js
const regenerate = require('regenerate');
exports.characters = regenerate()
  .addRange(0x0041, 0x005A) // A-Z
  .addRange(0x00C0, 0x00D6) // À-Ö
  .addRange(0x00D8, 0x00DE) // Ø-Þ

// directory: regenerate-unicode-properties/Script_Extensions/Greek.js
const regenerate = require('regenerate');
exports.characters = regenerate()
  .addRange(0x0370, 0x03FF); // Greek and Coptic

// directory: regenerate-unicode-properties/Property_of_Strings/Basic_Emoji.js
const regenerate = require('regenerate');
exports.characters = regenerate().addRange(0x1F600, 0x1F64F); // Emoticons
exports.strings = ['😀', '😁', '😂', '🤣', '😃', '😄'];

// directory: regenerate-unicode-properties/unicode-version.js
module.exports = 'Unicode 13.0.0';

// Note: While the sets include only exemplary ranges and strings, 
// in a real implementation they would cover all relevant Unicode ranges
// and possibly include comprehensive data via code generation.
