/*!
 * vue-router v4.0.2 Rewritten
 * (c) 2020 Eduardo San Martin Morote
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

// Utility to create unique symbol-based keys for internal states
const createSymbol = (name) => typeof Symbol === 'function' ? Symbol(name) : name;

// Symbols for internal use
const matchedRouteKey = createSymbol('router view location matched');
const viewDepthKey = createSymbol('router view depth');
const routerKey = createSymbol('router');
const routeLocationKey = createSymbol('route location');
const routerViewLocationKey = createSymbol('router view location');

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Utility functions for parameter handling
function applyToParams(fn, params) {
    const newParams = {};
    for (const key in params) {
        const value = params[key];
        newParams[key] = Array.isArray(value) ? value.map(fn) : fn(value);
    }
    return newParams;
}

function stringToQuery(queryString) {
    const query = {};
    if (!queryString || queryString === '?') return query;
    // Process query parts
    queryString = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    for (const part of queryString.split('&')) {
        const eqPos = part.indexOf('=');
        const key = decodeURIComponent(eqPos < 0 ? part : part.slice(0, eqPos));
        const value = eqPos < 0 ? null : decodeURIComponent(part.slice(eqPos + 1));
        if (!query.hasOwnProperty(key)) query[key] = value;
        else if (Array.isArray(query[key])) query[key].push(value);
        else query[key] = [query[key], value];
    }
    return query;
}

function paramsToString(query) {
    return Object.keys(query)
        .map(key => {
            const value = query[key];
            return value === undefined
                ? key
                : Array.isArray(value)
                    ? value.map(v => `${key}=${encodeURIComponent(v)}`).join('&')
                    : `${key}=${encodeURIComponent(value)}`;
        })
        .filter(Boolean)
        .join('&');
}

// Core Vue-router functionalities for navigation
function parseURL(parseQuery, location, currentLocation = '/') {
    const { path, query = {}, searchString = '', hash = '' } = {
        path: location.split(/[\?#]/)[0] || '',
        searchString: location.match(/\?([^#]*)/)?.[1] || '',
        hash: location.includes('#') ? location.slice(location.indexOf('#')) : '',
    };
    return {
        fullPath: path + (searchString && '?') + searchString + hash,
        path: resolveRelativePath(path || location, currentLocation),
        query: parseQuery(searchString),
        hash,
    };
}

function resolveRelativePath(to, from) {
    if (to.startsWith('/')) return to;
    const fromSegments = from.split('/');
    let position = fromSegments.length - 1;
    for (const segment of to.split('/')) {
        if (position === 1 || segment === '.') continue;
        if (segment === '..') position--;
        else break;
    }
    return fromSegments.slice(0, position).concat(to.split('/')).join('/');
}

function createWebHistory(base) {
    base = normalizeBase(base);
    const { location, state, push, replace } = useHistoryStateNavigation(base);
    const { listen, pauseListeners } = useHistoryListeners(base, state, location, replace);
    return {
        location,
        base,
        go: delta => (delta ? history.go(delta) : null),
        createHref: l => base.replace(/^[^#]+#/, '#') + l,
        push,
        replace,
        listen,
    };
}

// Define components and utility hooks
const RouterLink = vue.defineComponent({
    name: 'RouterLink',
    props: {
        to: { type: [String, Object], required: true },
        replace: Boolean,
    },
    setup(props, { slots }) {
        const router = vue.inject(routerKey);
        const currentRoute = vue.inject(routeLocationKey);
        const route = vue.computed(() => router.resolve(vue.unref(props.to)));
        function navigate(e) {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
                e.preventDefault();
                router[vue.unref(props.replace) ? 'replace' : 'push'](vue.unref(props.to));
            }
        }
        return () => vue.h('a', { href: route.value.href, onClick: navigate }, slots.default());
    },
});

const RouterView = vue.defineComponent({
    name: 'RouterView',
    props: { name: { type: String, default: 'default' }, route: Object },
    setup(props, { slots }) {
        const injectedRoute = vue.inject(routerViewLocationKey);
        const routeToDisplay = vue.computed(() => props.route || injectedRoute.value);
        const depth = vue.inject(viewDepthKey, 0);
        const matchedRouteRef = vue.computed(() => routeToDisplay.value.matched[depth]);
        vue.provide(viewDepthKey, depth + 1);
        vue.provide(routerViewLocationKey, routeToDisplay);
        return () => {
            const ViewComponent = matchedRouteRef.value && matchedRouteRef.value.components[props.name];
            return vue.h(ViewComponent, { ref: vue.ref(), key: matchedRouteRef.value }, slots.default());
        };
    },
});

// Main createRouter function
function createRouter(options) {
    const matcher = createRouterMatcher(options.routes, options);
    const routerHistory = options.history;

    const currentRoute = vue.shallowRef(START_LOCATION_NORMALIZED);
    const pendingLocation = START_LOCATION_NORMALIZED;

    async function push(to) {
        const targetLocation = matcher.resolve(to, currentRoute.value);
        const from = currentRoute.value;
        const isPush = !to.replace;
        // Update current route and navigate
        currentRoute.value = targetLocation;
        if (isPush) routerHistory.push(targetLocation.fullPath);
        else routerHistory.replace(targetLocation.fullPath);
    }

    const router = {
        currentRoute,
        push,
        install(app) {
            app.component('RouterLink', RouterLink);
            app.component('RouterView', RouterView);
            app.provide(routerKey, router);
            app.provide(routeLocationKey, where => vue.computed(() => currentRoute.value[where]), currentRoute);
        },
    };

    return router;
}

exports.createRouter = createRouter;
exports.RouterLink = RouterLink;
exports.RouterView = RouterView;
