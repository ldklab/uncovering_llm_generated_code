'use strict';

const hasSymbol = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

function PolySymbol(name) {
    return hasSymbol ? Symbol('[vue-router]: ' + name) : ('[vue-router]: ') + name;
}

const matchedRouteKey = /*#__PURE__*/ PolySymbol('router view location matched');
const viewDepthKey = /*#__PURE__*/ PolySymbol('router view depth');
const routerKey = /*#__PURE__*/ PolySymbol('router');
const routeLocationKey = /*#__PURE__*/ PolySymbol('route location');
const routerViewLocationKey = /*#__PURE__*/ PolySymbol('router view location');

function resolveRelativePath(to, from) {
    if (to.startsWith('/')) return to;
    if (!from.startsWith('/')) {
        warn(`Cannot resolve relative path "${to}" from "${from}".`);
        return to;
    }
    if (!to) return from;
    const fromSegments = from.split('/');
    const toSegments = to.split('/');
    let position = fromSegments.length - 1;
    for (let toPosition = 0; toPosition < toSegments.length; toPosition++) {
        const segment = toSegments[toPosition];
        if (position === 1 || segment === '.') continue;
        if (segment === '..') position--;
        else break;
    }
    return fromSegments.slice(0, position).join('/') + '/' + toSegments.join('/');
}

function createWebHistory(base) {
    base = normalizeBase(base);
    const historyNavigation = useHistoryStateNavigation(base);
    const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);

    function createHref(base, location) {
        return base.replace(/^[^#]+#/, '#') + location;
    }

    return {
        location: '',
        base,
        go: (delta) => history.go(delta),
        createHref: createHref.bind(null, base),
        ...historyNavigation, 
        ...historyListeners
    };
}

function applyToParams(fn, params) {
    const newParams = {};
    for (const key in params) {
        const value = params[key];
        newParams[key] = Array.isArray(value) ? value.map(fn) : fn(value);
    }
    return newParams;
}

function parseURL(parseQuery, location, currentLocation = '/') {
    let path, query = {}, searchString = '', hash = '';
    const searchPos = location.indexOf('?');
    const hashPos = location.indexOf('#', searchPos > -1 ? searchPos : 0);
    if (searchPos > -1) {
        path = location.slice(0, searchPos);
        searchString = location.slice(searchPos + 1, hashPos > -1 ? hashPos : location.length);
        query = parseQuery(searchString);
    }
    if (hashPos > -1) {
        path = path || location.slice(0, hashPos);
        hash = location.slice(hashPos);
    }
    path = resolveRelativePath(path || location, currentLocation);
    return { fullPath: path + (searchString && '?') + searchString + hash, path, query, hash };
}

function stringifyURL(stringifyQuery, location) {
    let query = location.query ? stringifyQuery(location.query) : '';
    return location.path + (query && '?') + query + (location.hash || '');
}

function createRouter(options) {
    const matcher = createRouterMatcher(options.routes, options);
    const routerHistory = options.history;
    const currentRoute = { value: START_LOCATION_NORMALIZED };
  
    function resolve(location, currentLocation = currentRoute.value) {
        if (typeof location === 'string') {
            const locationNormalized = parseURL(options.parseQuery, location, currentLocation.path);
            const matchedRoute = matcher.resolve({ path: locationNormalized.path }, currentLocation);
            const href = routerHistory.createHref(locationNormalized.fullPath);
            return {
              ...locationNormalized, 
              ...matchedRoute, 
              params: applyToParams(decodeURIComponent, matchedRoute.params),
              hash: decodeURIComponent(locationNormalized.hash), 
              redirectedFrom: undefined, href
            };
        }
        // handle object location
    }

    function push(to) {
        const targetLocation = resolve(to);
        if (!isSameRouteLocation(targetLocation, currentRoute.value)) {
            finalizeNavigation(targetLocation, currentRoute.value, true);
        }
    }

    function finalizeNavigation(to, from, isPush) {
        currentRoute.value = to;
        if (isPush) {
            routerHistory.push(to.fullPath);
        }
    }

    return {
        currentRoute,
        resolve,
        push
    };
}

module.exports = {
    createWebHistory,
    createRouter
};
