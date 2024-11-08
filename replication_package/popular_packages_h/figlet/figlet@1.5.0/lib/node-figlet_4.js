const figlet = require('./figlet.js');
const fs = require('fs');
const path = require('path');
const fontDir = path.join(__dirname, '/../fonts/');

figlet.loadFont = function(name, callback) {
    if (figlet.figFonts[name]) {
        callback(null, figlet.figFonts[name].options);
    } else {
        fs.readFile(path.join(fontDir, `${name}.flf`), { encoding: 'utf-8' }, (err, fontData) => {
            if (err) {
                return callback(err);
            }
            try {
                callback(null, figlet.parseFont(name, fontData));
            } catch (error) {
                callback(error);
            }
        });
    }
};

figlet.loadFontSync = function(name) {
    if (figlet.figFonts[name]) {
        return figlet.figFonts[name].options;
    }
    const fontData = fs.readFileSync(path.join(fontDir, `${name}.flf`), { encoding: 'utf-8' });
    return figlet.parseFont(name, fontData);
};

figlet.fonts = function(callback) {
    fs.readdir(fontDir, (err, files) => {
        if (err) {
            return callback(err);
        }
        const fontList = files.filter(file => file.endsWith('.flf')).map(file => file.replace(/\.flf$/, ''));
        callback(null, fontList);
    });
};

figlet.fontsSync = function() {
    const files = fs.readdirSync(fontDir);
    return files.filter(file => file.endsWith('.flf')).map(file => file.replace(/\.flf$/, ''));
};

module.exports = figlet;
