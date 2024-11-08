class URI {
    static parse(uriString) {
        const parser = /^(?<scheme>[a-z][\w.-]+):\/\/(?<userinfo>[^@]+@)?(?<host>[\w.-]+)(:(?<port>\d+))?(?<path>[\/\w.-]*)\??(?<query>[\w=&]*)#?(?<fragment>\w*)/i;
        const matched = uriString.match(parser);
        if (!matched) return null;
        const { scheme, userinfo, host, port, path, query, fragment } = matched.groups;
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
        return `${scheme}://${userinfo ? `${userinfo}@` : ''}${host}${port ? `:${port}` : ''}${path}${query ? `?${query}` : ''}${fragment ? `#${fragment}` : ''}`;
    }

    static resolve(baseURI, relativeURI) {
        const base = URI.parse(baseURI);
        const relative = URI.parse(relativeURI);
        const resolvedPath = base.path.split('/').slice(0, -1).concat(relative.path.split('/')).filter(Boolean).join('/');
        return `${base.scheme}://${base.host}/${resolvedPath}`;
    }

    static normalize(uriString) {
        const parsed = URI.parse(uriString);
        parsed.scheme = parsed.scheme.toLowerCase();
        parsed.host = parsed.host.toLowerCase();
        parsed.path = parsed.path.split('/').map(decodeURIComponent).join('/');
        return URI.serialize(parsed);
    }

    static equal(uri1, uri2) {
        return URI.normalize(uri1) === URI.normalize(uri2);
    }

    static normalizeIP(host) {
        return host.replace(/^0+/, '').toLowerCase();
    }

    static parseMailto(uriString) {
        const mailtoParser = /^mailto:(?<to>[^?]+)\??(?<query>.*)$/i;
        const matched = uriString.match(mailtoParser);
        if (!matched) return null;
        const { to, query } = matched.groups;
        const params = new URLSearchParams(query);
        return {
            scheme: "mailto",
            to: to.split(','),
            subject: params.get('subject'),
            body: params.get('body')
        };
    }
}

module.exports = URI;

// Usage example:
// const URI = require('./uri');
// console.log(URI.parse("http://user:pass@example.com:8080/path/to/resource?search=query#fragment"));
// console.log(URI.serialize({ scheme: 'https', host: 'example.com', path: '/path', query: 'query=test', fragment: 'footer' }));
