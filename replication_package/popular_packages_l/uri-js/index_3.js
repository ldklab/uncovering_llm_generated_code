class URI {
    static parse(uriString) {
        const uriRegEx = /^(?<scheme>[a-z][\w.-]+):\/\/(?<userinfo>[^@]+@)?(?<host>[\w.-]+)(:(?<port>\d+))?(?<path>[\/\w.-]*)\??(?<query>[\w=&]*)#?(?<fragment>\w*)/i;
        const match = uriString.match(uriRegEx);
        if (!match) return null;
        const { scheme, userinfo, host, port, path, query, fragment } = match.groups;
        return {
            scheme: scheme.toLowerCase(),
            userinfo: userinfo ? userinfo.slice(0, -1) : undefined,
            host: host.toLowerCase(),
            port: port ? parseInt(port) : undefined,
            path: path || '/',
            query,
            fragment
        };
    }

    static serialize({ scheme, userinfo, host, port, path = '/', query, fragment }) {
        let result = `${scheme}://`;
        if (userinfo) result += `${userinfo}@`;
        result += `${host}`;
        if (port) result += `:${port}`;
        result += path;
        if (query) result += `?${query}`;
        if (fragment) result += `#${fragment}`;
        return result;
    }

    static resolve(baseURI, relativeURI) {
        const base = URI.parse(baseURI);
        const relative = URI.parse(relativeURI);
        const resolvedPath = [...base.path.split('/').slice(0, -1), ...relative.path.split('/')].filter(Boolean).join('/');
        return `${base.scheme}://${base.host}/${resolvedPath}`;
    }

    static normalize(uriString) {
        const parsedURI = URI.parse(uriString);
        parsedURI.scheme = parsedURI.scheme.toLowerCase();
        parsedURI.host = parsedURI.host.toLowerCase();
        parsedURI.path = parsedURI.path.split('/').map(decodeURIComponent).join('/');
        return URI.serialize(parsedURI);
    }

    static equal(uri1, uri2) {
        return URI.normalize(uri1) === URI.normalize(uri2);
    }

    static normalizeIP(host) {
        return host.replace(/^0+/, '').toLowerCase();
    }

    static parseMailto(uriString) {
        const mailtoRegEx = /^mailto:(?<to>[^?]+)\??(?<query>.*)$/i;
        const match = uriString.match(mailtoRegEx);
        if (!match) return null;
        const { to, query } = match.groups;
        const queryParams = new URLSearchParams(query);
        return {
            scheme: "mailto",
            to: to.split(','),
            subject: queryParams.get('subject'),
            body: queryParams.get('body')
        };
    }
}

module.exports = URI;

// Usage example:
// const URI = require('./uri');
// console.log(URI.parse("http://user:pass@example.com:8080/path/to/resource?search=query#fragment"));
// console.log(URI.serialize({ scheme: 'https', host: 'example.com', path: '/path', query: 'query=test', fragment: 'footer' }));
