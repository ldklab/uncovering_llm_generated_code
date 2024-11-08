/*
	Node plugin for figlet.js
*/

const figlet = require('./figlet.js');
const fs = require('fs');
const path = require('path');
const fontDir = path.join(__dirname, '/../fonts/');

/*
    Asynchronously loads a font file into the figlet object.

    Parameters:
    - name (string): Name of the font to load.
    - next (function): Callback function to be executed after font is loaded.
*/
figlet.loadFont = function(name, next) {
    if (figlet.figFonts[name]) {
        next(null, figlet.figFonts[name].options);
        return;
    }

    fs.readFile(path.join(fontDir, `${name}.flf`), {encoding: 'utf-8'}, (err, fontData) => {
        if (err) return next(err);
        
        try {
            next(null, figlet.parseFont(name, fontData));
        } catch(error) {
            next(error);
        }
    });
};

/*
    Synchronously loads a font file into the figlet object.

    Parameters:
    - name (string): Name of the font to load.
    - returns: Parsed font options.
*/
figlet.loadFontSync = function(name) {
    if (figlet.figFonts[name]) {
        return figlet.figFonts[name].options;
    }

    const fontData = fs.readFileSync(path.join(fontDir, `${name}.flf`), {encoding: 'utf-8'});

    return figlet.parseFont(name, fontData);
};

/*
    Asynchronously returns an array containing all available font names.
*/
figlet.fonts = function(next) {
    fs.readdir(fontDir, (err, files) => {
        if (err) return next(err);
        
        const fontList = files
            .filter(file => /\.flf$/.test(file))
            .map(file => file.replace(/\.flf$/, ''));

        next(null, fontList);
    });
};

/*
    Synchronously returns an array containing all available font names.
*/
figlet.fontsSync = function() {
    return fs.readdirSync(fontDir)
        .filter(file => /\.flf$/.test(file))
        .map(file => file.replace(/\.flf$/, ''));
};

module.exports = figlet;
