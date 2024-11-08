// path-parse/index.js

function parsePath(pathString, options = { platform: process.platform }) {
    const isWindows = options.platform === 'win32';

    function splitPath(path) {
        const windowsRegex = /^(?:(\/?|)([\w ]:|\\|\\\\)(?:([^\\\/:*?"<>|\r\n]+(?:\\|\\\\))*)([^\\\/:*?"<>|\r\n]*))$/;
        const posixRegex = /^((?:\/|)(?:[^\/]+(?:\/|))*)([^\/]*)$/;
        return path.match(isWindows ? windowsRegex : posixRegex).slice(1);
    }

    const segments = splitPath(pathString);

    const root = isWindows ? (segments[2] + '\\') : '/';
    const base = segments[4] || segments[2] || segments[1];
    const dir = segments[1] || (isWindows ? root : '');
    const ext = (base.indexOf('.') !== -1) ? '.' + base.split('.').pop() : '';
    const name = base.slice(0, base.length - ext.length);

    return {
        root,
        dir,
        base,
        ext,
        name
    };
}

parsePath.posix = function(pathString) {
    return parsePath(pathString, { platform: 'posix' });
};

parsePath.win32 = function(pathString) {
    return parsePath(pathString, { platform: 'win32' });
};

module.exports = parsePath;
