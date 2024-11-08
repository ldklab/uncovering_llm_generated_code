const fs = require('fs');
const hljs = require('./core');

// Read all language files from the 'languages' directory
const languageFiles = fs.readdirSync('./languages');

// Register each language automatically
languageFiles.forEach(file => {
  const language = file.replace('.js', '');
  hljs.registerLanguage(language, require(`./languages/${language}`));
});

// Set up exports
hljs.HighlightJS = hljs;
hljs.default = hljs;
module.exports = hljs;
