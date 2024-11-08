const fs = require('fs');
const path = require('path');

const figlet = (() => {
  const fontsCache = {};

  const loadFontData = (fontName) => {
    if (fontsCache[fontName]) {
      return Promise.resolve(fontsCache[fontName]);
    }
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, `${fontName}.flf`), 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        fontsCache[fontName] = data;
        resolve(data);
      });
    });
  };

  const generateAsciiArt = (text, fontData, options) => {
    return text.split('').map(char => char.repeat(5)).join(' ');
  };

  const text = (inputText, options = {}, callback) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';
    return loadFontData(fontName)
      .then(fontData => generateAsciiArt(inputText, fontData, options))
      .then(asciiArt => callback ? callback(null, asciiArt) : asciiArt)
      .catch(err => callback ? callback(err) : Promise.reject(err));
  };

  const textSync = (inputText, options = {}) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';
    const fontData = fontsCache[fontName];
    if (!fontData) {
      throw new Error(`Font data for ${fontName} not loaded`);
    }
    return generateAsciiArt(inputText, fontData, options);
  };

  const metadata = (fontName, callback) => {
    return loadFontData(fontName)
      .then(fontData => {
        const options = { font: fontName };
        const headerComment = 'Header information';
        return [options, headerComment];
      })
      .then(([options, headerComment]) => callback ? callback(null, options, headerComment) : [options, headerComment])
      .catch(err => callback ? callback(err) : Promise.reject(err));
  };

  const listFonts = (callback) => {
    const fonts = Object.keys(fontsCache);
    if (callback) callback(null, fonts);
    return fonts;
  };

  return {
    text,
    textSync,
    metadata,
    fonts: listFonts,
    fontsSync: () => listFonts(),
    parseFont: (fontName, fontData) => { fontsCache[fontName] = fontData; }
  };
})();

module.exports = figlet;
