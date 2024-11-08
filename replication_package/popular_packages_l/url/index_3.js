const querystring = require('querystring');

function parse(urlStr, parseQueryString = false, slashesDenoteHost = false) {
    const urlPattern = /^(https?:|ftp:|file:|gopher:)?(\/\/)?((([^:@]*):?([^:@]*))?@)?([^:\/?#]+)?(:([0-9]+))?(\/[^?#]*)?(\?([^#]*))?(#(.*))?$/;
    const match = urlStr.match(urlPattern);

    if (!match) return {};

    const [
        href,
        protocol = '',
        slashes,
        ,
        authUser = '',
        authPass = '',
        host = '',
        ,
        port = '',
        pathname = '',
        search = '',
        queryStr = '',
        hash = ''
    ] = match;

    const auth = authUser || authPass ? `${authUser}:${authPass}` : null;
    const hostname = host.toLowerCase();
    const parsedQuery = parseQueryString ? querystring.parse(queryStr) : queryStr;

    const result = {
        href,
        protocol: protocol.toLowerCase(),
        slashes: !!slashes,
        host: hostname ? `${hostname}:${port}`.trimEnd(':') : null,
        auth,
        hostname,
        port,
        pathname,
        search,
        path: `${pathname}${search}`,
        query: parsedQuery,
        hash
    };

    if (slashesDenoteHost && result.slashes && !result.host) {
        const [fakedHost, ...pathParts] = pathname.split('/');
        result.host = fakedHost;
        result.pathname = `/${pathParts.join('/')}`;
    }

    return result;
}

function format(urlObj) {
    const protocol = urlObj.protocol ? urlObj.protocol + (urlObj.protocol.endsWith(':') ? '' : ':') : '';
    const auth = urlObj.auth ? `${urlObj.auth}@` : '';
    const host = urlObj.host || ((urlObj.hostname || '') + (urlObj.port ? ':' + urlObj.port : ''));
    const pathname = urlObj.pathname ? '/' + urlObj.pathname.replace(/^\//, '') : '';
    const search = urlObj.search ? ('?' + urlObj.search.replace(/^\?/, '')) : (urlObj.query ? ('?' + querystring.stringify(urlObj.query)) : '');
    const hash = urlObj.hash ? ('#' + urlObj.hash.replace(/^#/, '')) : '';
  
    if (['http', 'https', 'ftp', 'gopher', 'file'].includes(protocol)) {
        return `${protocol}//${auth}${host}${pathname}${search}${hash}`;
    }

    return `${protocol}${auth}${host}${pathname}${search}${hash}`;
}

function resolve(from, to) {
    const fromParsed = parse(from);
    const toParsed = parse(to);
  
    if (toParsed.protocol) {
        return to;
    }

    let base = fromParsed.href.split(/[?#]/)[0];
    if (toParsed.pathname.startsWith('/')) {
        base = `${fromParsed.protocol}//${fromParsed.host}`;
    } else {
        base = base.substring(0, base.lastIndexOf('/') + 1);
    }

    const resolvedPath = resolvePath(base + toParsed.pathname);
    return format({
        ...fromParsed,
        pathname: resolvedPath,
        query: toParsed.query,
        hash: toParsed.hash
    });
}

function resolvePath(path) {
    const segments = path.split('/');
    const resolved = [];
    for (const segment of segments) {
        if (segment === '.' || segment === '') continue;
        if (segment === '..') resolved.pop();
        else resolved.push(segment);
    }
    return '/' + resolved.join('/');
}

module.exports = {
    parse,
    format,
    resolve
};
