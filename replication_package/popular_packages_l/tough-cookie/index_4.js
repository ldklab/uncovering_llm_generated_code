// File: tough-cookie.js

class Cookie {
    constructor(name, value, options = {}) {
        this.name = name;
        this.value = value;
        this.domain = options.domain || null;
        this.path = options.path || '/';
        this.expires = options.expires || null;
        this.secure = options.secure || false;
        this.sameSite = options.sameSite || 'lax';
    }

    static parse(cookieString) {
        const parts = cookieString.split(';').map(part => part.trim());
        const [nameValue, ...attributes] = parts;
        const [name, value] = nameValue.split('=');
        
        const options = {};
        attributes.forEach(attr => {
            const [key, val] = attr.split('=');
            switch (key.toLowerCase()) {
                case 'domain':
                    options.domain = val;
                    break;
                case 'path':
                    options.path = val;
                    break;
                case 'expires':
                    options.expires = new Date(val);
                    break;
                case 'secure':
                    options.secure = true;
                    break;
                case 'samesite':
                    options.sameSite = val.toLowerCase();
                    break;
            }
        });

        return new Cookie(name, value, options);
    }

    toString() {
        let str = `${this.name}=${this.value}`;
        if (this.domain) str += `; Domain=${this.domain}`;
        if (this.path) str += `; Path=${this.path}`;
        if (this.expires) str += `; Expires=${this.expires.toUTCString()}`;
        if (this.secure) str += '; Secure';
        if (this.sameSite) str += `; SameSite=${this.sameSite}`;
        return str;
    }

    cookieString() {
        return `${this.name}=${this.value}`;
    }
}

class MemoryCookieStore {
    constructor() {
        this.cookies = [];
    }

    findCookie(domain, path, key) {
        return this.cookies.find(cookie => cookie.domain === domain && cookie.path === path && cookie.name === key) || null;
    }

    findCookies(domain, path) {
        return this.cookies.filter(cookie => cookie.domain === domain && path.startsWith(cookie.path));
    }

    putCookie(cookie) {
        this.cookies.push(cookie);
    }

    removeCookie(domain, path, key) {
        this.cookies = this.cookies.filter(cookie => !(cookie.domain === domain && cookie.path === path && cookie.name === key));
    }

    getAllCookies() {
        return [...this.cookies];
    }
}

class CookieJar {
    constructor(store = new MemoryCookieStore(), { prefixSecurity = 'silent' } = {}) {
        this.store = store;
        this.prefixSecurity = prefixSecurity;
    }

    checkPrefixSecurity(cookie, url) {
        if (!cookie.secure && url.startsWith('http:') && cookie.name.startsWith('__Secure-')) {
            if (this.prefixSecurity === 'strict') {
                throw new Error('Cookie must be Secure');
            }
            return false;
        }
        if (cookie.name.startsWith('__Host-') && (!cookie.secure || cookie.path !== '/' || cookie.domain)) {
            if (this.prefixSecurity === 'strict') {
                throw new Error('Cookie must be Secure, with Path=/, and without Domain for __Host-');
            }
            return false;
        }
        return true;
    }

    async setCookie(cookieStr, url) {
        const cookie = Cookie.parse(cookieStr);
        if (!this.checkPrefixSecurity(cookie, url)) return;

        const { hostname: domain } = new URL(url);
        this.store.putCookie(cookie);
    }

    async getCookies(url, options = {}) {
        const { hostname: domain, pathname } = new URL(url);
        return this.store.findCookies(domain, pathname).filter(cookie => {
            if (options.sameSiteContext === 'lax' && cookie.sameSite === 'strict') {
                return false;
            }
            return true;
        });
    }
}

module.exports = { Cookie, CookieJar, MemoryCookieStore };
