const figlet = require("./figlet.js");
const fs = require("fs");
const path = require("path");
const fontDir = path.join(__dirname, "/../fonts/");

figlet.loadFont = function (name, next) {
  return new Promise((resolve, reject) => {
    if (figlet.figFonts[name]) {
      next?.(null, figlet.figFonts[name].options);
      resolve(figlet.figFonts[name].options);
      return;
    }

    fs.readFile(path.join(fontDir, name + ".flf"), { encoding: "utf-8" }, (err, fontData) => {
      if (err) {
        next?.(err);
        reject(err);
        return;
      }

      fontData = fontData.toString(); // Ensures it's a string
      try {
        const font = figlet.parseFont(name, fontData);
        next?.(null, font);
        resolve(font);
      } catch (error) {
        next?.(error);
        reject(error);
      }
    });
  });
};

figlet.loadFontSync = function (name) {
  if (figlet.figFonts[name]) {
    return figlet.figFonts[name].options;
  }

  const fontData = fs.readFileSync(path.join(fontDir, name + ".flf"), { encoding: "utf-8" });
  return figlet.parseFont(name, fontData.toString());
};

figlet.fonts = function (next) {
  return new Promise((resolve, reject) => {
    fs.readdir(fontDir, (err, files) => {
      if (err) {
        next?.(err);
        reject(err);
        return;
      }

      const fontList = files.filter(file => file.endsWith(".flf")).map(file => file.replace(/\.flf$/, ""));
      next?.(null, fontList);
      resolve(fontList);
    });
  });
};

figlet.fontsSync = function () {
  return fs.readdirSync(fontDir)
           .filter(file => file.endsWith(".flf"))
           .map(file => file.replace(/\.flf$/, ""));
};

module.exports = figlet;
