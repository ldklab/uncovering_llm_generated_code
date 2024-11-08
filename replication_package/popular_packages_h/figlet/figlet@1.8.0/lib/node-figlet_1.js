const figlet = require("./figlet.js");
const fs = require("fs");
const path = require("path");
const fontDir = path.join(__dirname, "/../fonts/");

// Loads a font into the figlet object asynchronously
figlet.loadFont = function (name, next) {
  return new Promise((resolve, reject) => {
    if (figlet.figFonts[name]) {
      if (next) next(null, figlet.figFonts[name].options);
      resolve(figlet.figFonts[name].options);
    } else {
      fs.readFile(path.join(fontDir, `${name}.flf`), 'utf-8', (err, fontData) => {
        if (err) {
          if (next) next(err);
          reject(err);
          return;
        }
        fontData = fontData.toString();
        try {
          const font = figlet.parseFont(name, fontData);
          if (next) next(null, font);
          resolve(font);
        } catch (error) {
          if (next) next(error);
          reject(error);
        }
      });
    }
  });
};

// Loads a font synchronously into the figlet object
figlet.loadFontSync = function (name) {
  if (figlet.figFonts[name]) {
    return figlet.figFonts[name].options;
  }
  const fontData = fs.readFileSync(path.join(fontDir, `${name}.flf`), 'utf-8').toString();
  return figlet.parseFont(name, fontData);
};

// Returns an array of all font names asynchronously
figlet.fonts = function (next) {
  return new Promise((resolve, reject) => {
    fs.readdir(fontDir, (err, files) => {
      if (err) {
        if (next) next(err);
        reject(err);
        return;
      }
      const fontList = files.filter(file => /\.flf$/.test(file)).map(file => file.replace(/\.flf$/, ""));
      if (next) next(null, fontList);
      resolve(fontList);
    });
  });
};

// Returns an array of all font names synchronously
figlet.fontsSync = function () {
  return fs.readdirSync(fontDir)
    .filter(file => /\.flf$/.test(file))
    .map(file => file.replace(/\.flf$/, ""));
};

module.exports = figlet;
