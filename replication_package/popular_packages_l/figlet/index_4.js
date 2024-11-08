const fs = require('fs');
const path = require('path');

const figlet = (() => {
  const fonts = {};

  const loadFontData = async (fontName) => {
    if (fonts[fontName]) return fonts[fontName];
    const filePath = path.join(__dirname, `${fontName}.flf`);
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      fonts[fontName] = data;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const generateAsciiArt = (text, fontData) => {
    return text.split('').map(char => char.repeat(5)).join(' ');
  };

  const text = async (inputText, options = {}, callback) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';
    try {
      const fontData = await loadFontData(fontName);
      const asciiArt = generateAsciiArt(inputText, fontData);
      if (callback) {
        callback(null, asciiArt);
      } else {
        return asciiArt;
      }
    } catch (err) {
      if (callback) {
        callback(err);
      } else {
        throw err;
      }
    }
  };

  const textSync = (inputText, options = {}) => {
    const fontName = typeof options === 'string' ? options : options.font || 'Standard';
    if (!fonts[fontName]) throw new Error(`Font data for ${fontName} not loaded`);
    return generateAsciiArt(inputText, fonts[fontName]);
  };

  const metadata = async (fontName, callback) => {
    try {
      const fontData = await loadFontData(fontName);
      const options = { font: fontName };
      const headerComment = 'Header information';
      if (callback) {
        callback(null, options, headerComment);
      } else {
        return [options, headerComment];
      }
    } catch (err) {
      if (callback) {
        callback(err);
      } else {
        throw err;
      }
    }
  };

  const fontsList = (callback) => {
    const availableFonts = Object.keys(fonts);
    if (callback) {
      callback(null, availableFonts);
    }
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
