const figlet = require('./figlet.js');
const fs = require('fs');
const path = require('path');
const fontDir = path.join(__dirname, '/../fonts/');

figlet.loadFont = function(name, next) {
    if (figlet.figFonts[name]) {
        return next(null, figlet.figFonts[name].options);
    }

    const fontPath = path.join(fontDir, `${name}.flf`);
    fs.readFile(fontPath, { encoding: 'utf-8' }, (err, fontData) => {
        if (err) return next(err);

        try {
            const parsedFont = figlet.parseFont(name, fontData);
            next(null, parsedFont);
        } catch (error) {
            next(error);
        }
    });
};

figlet.loadFontSync = function(name) {
    if (figlet.figFonts[name]) {
        return figlet.figFonts[name].options;
    }

    const fontPath = path.join(fontDir, `${name}.flf`);
    const fontData = fs.readFileSync(fontPath, { encoding: 'utf-8' });
    return figlet.parseFont(name, fontData);
};

figlet.fonts = function(next) {
    fs.readdir(fontDir, (err, files) => {
        if (err) return next(err);

        const fontList = files
            .filter(file => /\.flf$/.test(file))
            .map(file => file.replace(/\.flf$/, ''));
        
        next(null, fontList);
    });
};

figlet.fontsSync = function() {
    return fs.readdirSync(fontDir)
        .filter(file => /\.flf$/.test(file))
        .map(file => file.replace(/\.flf$/, ''));
};

module.exports = figlet;
