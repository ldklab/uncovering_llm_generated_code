// path-parse/index.js

// Function to parse a filepath into its components: root, dir, base, ext, and name.
function pathParse(pathString, options = { platform: process.platform }) {
    const isWin = options.platform === 'win32'; // Determine if the platform is Windows.

    // Function to split the path string based on the platform-specific regular expression.
    function splitPath(path) {
        const winSplit = /^(?:(\/?|)([\w ]:|\\|\\\\)(?:([^\\\/:*?"<>|\r\n]+(?:\\|\\\\))*)([^\\\/:*?"<>|\r\n]*))$/; // Windows path regex
        const posixSplit = /^((?:\/|)(?:[^\/]+(?:\/|))*)([^\/]*)$/; // POSIX path regex
        // Match the path against the appropriate regex and return the captured groups.
        return path.match(isWin ? winSplit : posixSplit).slice(1);
    }

    const result = splitPath(pathString); // Get the split path components.

    // Compute parsed path components from the split result.
    const root = isWin ? (result[2] + '\\') : '/';
    const base = result[4] || result[2] || result[1];
    const dir = result[1] || (isWin ? root : '');
    const ext = base.indexOf('.') !== -1 ? '.' + base.split('.').pop() : '';
    const name = base.slice(0, base.length - ext.length);

    // Return the parsed path components.
    return {
        root,
        dir,
        base,
        ext,
        name
    };
}

// Support function to parse paths in POSIX mode.
pathParse.posix = function(pathString) {
    return pathParse(pathString, { platform: 'posix' });
};

// Support function to parse paths in Windows mode.
pathParse.win32 = function(pathString) {
    return pathParse(pathString, { platform: 'win32' });
};

// Export the pathParse function.
module.exports = pathParse;
