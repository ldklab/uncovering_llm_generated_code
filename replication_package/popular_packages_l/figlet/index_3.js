const fs = require('fs');
const path = require('path');

const figlet = (() => {
  const fontsCache = {}; // Cache to store loaded fonts

  const loadFontData = (fontName) => {
    if (fontsCache[fontName]) {
      return Promise.resolve(fontsCache[fontName]);
    }

    return new Promise((resolve, reject) => {
      const fontPath = path.join(__dirname, `${fontName}.flf`);
      fs.readFile(fontPath, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        fontsCache[fontName] = data; // Cache the loaded font data
        resolve(data);
      });
    });
  };

  const generateAsciiArt = (text, fontData, options) => {
    // This is a placeholder for ASCII art generation logic
    return text.split('').map(char => char.repeat(5)).join(' '); // Simple mock conversion
  };

  const text = (inputText, options = {}, callback) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';

    return loadFontData(fontName)
      .then(fontData => generateAsciiArt(inputText, fontData, options))
      .then(asciiArt => {
        if (callback) return callback(null, asciiArt);
        return asciiArt;
      })
      .catch(err => {
        if (callback) return callback(err);
        return Promise.reject(err);
      });
  };

  const textSync = (inputText, options = {}) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';

    if (!fontsCache[fontName]) {
      throw new Error(`Font data for ${fontName} not loaded`);
    }
    return generateAsciiArt(inputText, fontsCache[fontName], options);
  };

  const metadata = (fontName, callback) => {
    return loadFontData(fontName)
      .then(fontData => {
        // Mock metadata
        const options = { font: fontName };
        const headerComment = 'Header information';
        return [options, headerComment];
      })
      .then(([options, headerComment]) => {
        if (callback) return callback(null, options, headerComment);
        return [options, headerComment];
      })
      .catch(err => {
        if (callback) return callback(err);
        return Promise.reject(err);
      });
  };

  const getAvailableFonts = callback => {
    const availableFonts = Object.keys(fontsCache); // Get list of loaded fonts
    if (callback) callback(null, availableFonts);
    return availableFonts;
  };

  return {
    text,
    textSync,
    metadata,
    fonts: getAvailableFonts,
    fontsSync: getAvailableFonts,
    parseFont: (fontName, fontData) => { fontsCache[fontName] = fontData; }
  };
})();

module.exports = figlet;
