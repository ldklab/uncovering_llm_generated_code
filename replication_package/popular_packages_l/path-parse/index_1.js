// path-parse/index.js

function pathParse(path, options = { platform: process.platform }) {
    const isWindows = options.platform === 'win32';

    const splitPathPatterns = {
        win32: /^(?:(\/?|)([\w ]:|\\|\\\\)(?:([^\\\/:*?"<>|\r\n]+(?:\\|\\\\))*)([^\\\/:*?"<>|\r\n]*))$/,
        posix: /^((?:\/|)(?:[^\/]+(?:\/|))*)([^\/]*)$/
    };

    const splitPath = (pathString) => {
        const pattern = isWindows ? splitPathPatterns.win32 : splitPathPatterns.posix;
        return pathString.match(pattern).slice(1);
    };

    const components = splitPath(path);

    const root = isWindows ? (components[1] + '\\') : '/';
    const base = components[3] || components[1] || components[0];
    const dir = components[0] || (isWindows ? root : '');
    const ext = base.includes('.') ? '.' + base.split('.').pop() : '';
    const name = base.slice(0, base.length - ext.length);

    return {
        root,
        dir,
        base,
        ext,
        name
    };
}

pathParse.posix = (pathString) => pathParse(pathString, { platform: 'posix' });
pathParse.win32 = (pathString) => pathParse(pathString, { platform: 'win32' });

module.exports = pathParse;
