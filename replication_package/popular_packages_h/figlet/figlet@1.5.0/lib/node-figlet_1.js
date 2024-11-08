/*
  Node plugin for figlet.js
*/

const figlet = require('./figlet.js');
const fs = require('fs');
const path = require('path');
const fontDir = path.join(__dirname, '/../fonts/');

/*
  Loads a font into the figlet object asynchronously.

  Parameters:
  - name (string): The name of the font to load.
  - next (function): Callback function to handle the result.
*/
figlet.loadFont = function(name, next) {
    // Check if the font is already loaded
    if (figlet.figFonts[name]) {
        next(null, figlet.figFonts[name].options);
        return;
    }

    // Read the font file asynchronously
    fs.readFile(path.join(fontDir, `${name}.flf`), { encoding: 'utf-8' }, (err, fontData) => {
        if (err) {
            return next(err);
        }

        try {
            // Parse and load the font data
            next(null, figlet.parseFont(name, fontData));
        } catch (error) {
            next(error);
        }
    });
};

/*
  Loads a font synchronously into the figlet object.

  Parameters:
  - name (string): The name of the font to load.
*/
figlet.loadFontSync = function(name) {
    // Check if the font is already loaded
    if (figlet.figFonts[name]) {
        return figlet.figFonts[name].options;
    }

    // Read the font file synchronously
    const fontData = fs.readFileSync(path.join(fontDir, `${name}.flf`), { encoding: 'utf-8' });

    // Parse and return the font data
    return figlet.parseFont(name, fontData);
};

/*
  Returns an array containing all of the font names asynchronously.
*/
figlet.fonts = function(next) {
    const fontList = [];

    // Read the font directory asynchronously
    fs.readdir(fontDir, (err, files) => {
        if (err) {
            return next(err);
        }

        // Filter and list all ".flf" files
        files.forEach(file => {
            if (/\.flf$/.test(file)) {
                fontList.push(file.replace(/\.flf$/, ''));
            }
        });

        next(null, fontList);
    });
};

/*
  Returns an array containing all of the font names synchronously.
*/
figlet.fontsSync = function() {
    const fontList = [];

    // Read the font directory synchronously
    const files = fs.readdirSync(fontDir);

    // Filter and list all ".flf" files
    files.forEach(file => {
        if (/\.flf$/.test(file)) {
            fontList.push(file.replace(/\.flf$/, ''));
        }
    });

    return fontList;
};

module.exports = figlet;
