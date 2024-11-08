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

    static serialize(uriComponents) {
        const { scheme, userinfo, host, port, path = '/', query, fragment } = uriComponents;
        let serializedURI = `${scheme}://`;
        if (userinfo) serializedURI += `${userinfo}@`;
        serializedURI += `${host}`;
        if (port) serializedURI += `:${port}`;
        serializedURI += path;
        if (query) serializedURI += `?${query}`;
        if (fragment) serializedURI += `#${fragment}`;
        return serializedURI;
    }

    static resolve(baseURI, relativeURI) {
        const base = URI.parse(baseURI);
        const relative = URI.parse(relativeURI);
        const resolvedPath = base.path.split('/').slice(0, -1).concat(relative.path.split('/')).filter(Boolean).join('/');
        return `${base.scheme}://${base.host}/${resolvedPath}`;
    }

    static normalize(uriString) {
        const parsed = URI.parse(uriString);
        if (parsed.scheme) parsed.scheme = parsed.scheme.toLowerCase();
        if (parsed.host) parsed.host = parsed.host.toLowerCase();
        const path = parsed.path.split('/').map(decodeURIComponent).join('/');
        parsed.path = path;
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
