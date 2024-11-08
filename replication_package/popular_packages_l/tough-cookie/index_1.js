// File: cookie-manager.js

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
        const attributes = cookieString.split(';').map(attr => attr.trim());
        const [nameValue, ...options] = attributes;
        const [name, value] = nameValue.split('=');

        const cookieOptions = {};
        options.forEach(option => {
            const [key, val] = option.split('=');
            switch (key.toLowerCase()) {
                case 'domain':
                    cookieOptions.domain = val;
                    break;
                case 'path':
                    cookieOptions.path = val;
                    break;
                case 'expires':
                    cookieOptions.expires = new Date(val);
                    break;
                case 'secure':
                    cookieOptions.secure = true;
                    break;
                case 'samesite':
                    cookieOptions.sameSite = val.toLowerCase();
                    break;
            }
        });
        
        return new Cookie(name, value, cookieOptions);
    }

    toString() {
        let cookieString = `${this.name}=${this.value}`;
        if (this.domain) cookieString += `; Domain=${this.domain}`;
        if (this.path) cookieString += `; Path=${this.path}`;
        if (this.expires) cookieString += `; Expires=${this.expires.toUTCString()}`;
        if (this.secure) cookieString += '; Secure';
        if (this.sameSite) cookieString += `; SameSite=${this.sameSite}`;
        return cookieString;
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
        return this.cookies.find(cookie => 
            cookie.domain === domain && cookie.path === path && cookie.name === key) || null;
    }

    findCookies(domain, path) {
        return this.cookies.filter(cookie => 
            cookie.domain === domain && path.startsWith(cookie.path));
    }

    putCookie(cookie) {
        this.cookies.push(cookie);
    }

    removeCookie(domain, path, key) {
        this.cookies = this.cookies.filter(cookie => 
            !(cookie.domain === domain && cookie.path === path && cookie.name === key));
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
        const isHttp = url.startsWith('http:');
        if (!cookie.secure && isHttp && cookie.name.startsWith('__Secure-')) {
            if (this.prefixSecurity === 'strict') {
                throw new Error('Cookie must be Secure');
            }
            return false;
        }
        if (cookie.name.startsWith('__Host-') && 
            (!cookie.secure || cookie.path !== '/' || cookie.domain)) {
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
        cookie.domain = domain;  // Set domain extracted from URL
        this.store.putCookie(cookie);
    }

    async getCookies(url, options = {}) {
        const { hostname: domain, pathname } = new URL(url);
        return this.store.findCookies(domain, pathname).filter(cookie =>
            !(options.sameSiteContext === 'lax' && cookie.sameSite === 'strict')
        );
    }
}

module.exports = { Cookie, CookieJar, MemoryCookieStore };
