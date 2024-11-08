const fs = require('fs');
const path = require('path');

const figlet = (() => {
  const fonts = {}; // stores fonts data

  // Mock of FIGfont font data loading
  const loadFontData = (fontName) => {
    if (fontName in fonts) {
      return Promise.resolve(fonts[fontName]);
    }
    // Simulate loading font data
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, `${fontName}.flf`), 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          fonts[fontName] = data; // Assume process and parse
          resolve(data);
        }
      });
    });
  };

  const generateAsciiArt = (text, fontData, options) => {
    // Placeholder function that does simple mock conversion
    return text.split('').map(char => char.repeat(5)).join(' ');
  };

  const text = (inputText, options = {}, callback) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';

    return loadFontData(fontName)
      .then(fontData => generateAsciiArt(inputText, fontData, options))
      .then(asciiArt => (callback ? callback(null, asciiArt) : asciiArt))
      .catch(err => (callback ? callback(err) : Promise.reject(err)));
  };

  const textSync = (inputText, options = {}) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';
    const fontData = fonts[fontName];

    if (!fontData) {
      throw new Error(`Font data for ${fontName} not loaded`);
    }
    return generateAsciiArt(inputText, fontData, options);
  };

  const metadata = (fontName, callback) => {
    return loadFontData(fontName)
      .then(fontData => { // Mock metadata return
        const options = {font: fontName};
        const headerComment = 'Header information';
        return [options, headerComment];
      })
      .then(([options, headerComment]) => (callback ? callback(null, options, headerComment) : [options, headerComment]))
      .catch(err => (callback ? callback(err) : Promise.reject(err)));
  };

  const fontsList = callback => {
    const availableFonts = Object.keys(fonts); // Mock available fonts
    if (callback) callback(null, availableFonts);
    return availableFonts;
  };

  return {
    text,
    textSync,
    metadata,
    fonts: fontsList,
    fontsSync: () => fontsList(),
    parseFont: (fontName, fontData) => { fonts[fontName] = fontData; }
  };
})();

module.exports = figlet;
