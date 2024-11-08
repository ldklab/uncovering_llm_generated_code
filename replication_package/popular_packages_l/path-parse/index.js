// path-parse/index.js

function pathParse(pathString, options = { platform: process.platform }) {
    const isWin = options.platform === 'win32';

    function splitPath(path) {
        const winSplit = /^(?:(\/?|)([\w ]:|\\|\\\\)(?:([^\\\/:*?"<>|\r\n]+(?:\\|\\\\))*)([^\\\/:*?"<>|\r\n]*))$/;
        const posixSplit = /^((?:\/|)(?:[^\/]+(?:\/|))*)([^\/]*)$/;
        return path.match(isWin ? winSplit : posixSplit).slice(1);
    }

    const result = splitPath(pathString);

    const root = isWin ? (result[2] + '\\') : '/';
    const base = result[4] || result[2] || result[1];
    const dir = result[1] || (isWin ? root : '');
    const ext = base.indexOf('.') !== -1 ? '.' + base.split('.').pop() : '';
    const name = base.slice(0, base.length - ext.length);

    return {
        root,
        dir,
        base,
        ext,
        name
    };
}

pathParse.posix = function(pathString) {
    return pathParse(pathString, { platform: 'posix' });
};

pathParse.win32 = function(pathString) {
    return pathParse(pathString, { platform: 'win32' });
};

module.exports = pathParse;
