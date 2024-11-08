/*
  Node plugin for figlet.js
*/

const figlet = require("./figlet.js");
const fs = require("fs");
const path = require("path");

const fontDir = path.join(__dirname, "/../fonts/");

// Asynchronously loads a font into the figlet object.
figlet.loadFont = function (name, next) {
  return new Promise((resolve, reject) => {
    if (figlet.figFonts[name]) {
      next && next(null, figlet.figFonts[name].options);
      return resolve(figlet.figFonts[name].options);
    }

    fs.readFile(path.join(fontDir, `${name}.flf`), 'utf-8', (err, fontData) => {
      if (err) {
        next && next(err);
        return reject(err);
      }

      try {
        const font = figlet.parseFont(name, fontData + "");
        next && next(null, font);
        resolve(font);
      } catch (error) {
        next && next(error);
        reject(error);
      }
    });
  });
};

// Synchronously loads a font into the figlet object.
figlet.loadFontSync = function (name) {
  if (figlet.figFonts[name]) {
    return figlet.figFonts[name].options;
  }

  const fontData = fs.readFileSync(path.join(fontDir, `${name}.flf`), 'utf-8');
  return figlet.parseFont(name, fontData + "");
};

// Asynchronously returns an array containing all of the font names.
figlet.fonts = function (next) {
  return new Promise((resolve, reject) => {
    fs.readdir(fontDir, (err, files) => {
      if (err) {
        next && next(err);
        return reject(err);
      }

      const fontList = files.filter(file => /\.flf$/.test(file))
                            .map(file => file.replace(/\.flf$/, ""));
      next && next(null, fontList);
      resolve(fontList);
    });
  });
};

// Synchronously returns an array of all font names.
figlet.fontsSync = function () {
  return fs.readdirSync(fontDir)
           .filter(file => /\.flf$/.test(file))
           .map(file => file.replace(/\.flf$/, ""));
};

module.exports = figlet;
