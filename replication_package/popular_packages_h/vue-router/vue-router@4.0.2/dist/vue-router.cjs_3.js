'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

const hasSymbol = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
const PolySymbol = (name) => hasSymbol ? Symbol('[vue-router]: ' + name) : ('[vue-router]: ') + name;
const matchedRouteKey = PolySymbol('router view location matched');
const viewDepthKey = PolySymbol('router view depth');
const routerKey = PolySymbol('router');
const routeLocationKey = PolySymbol('route location');
const routerViewLocationKey = PolySymbol('router view location');

const isBrowser = typeof window !== 'undefined';

function isESModule(obj) {
    return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module');
}

const assign = Object.assign;
function applyToParams(fn, params) {
    const newParams = {};
    for (const key in params) {
        const value = params[key];
        newParams[key] = Array.isArray(value) ? value.map(fn) : fn(value);
    }
    return newParams;
}

function warn(msg) {
    const args = Array.from(arguments).slice(1);
    console.warn.apply(console, ['[Vue Router warn]: ' + msg].concat(args));
}

const removeTrailingSlash = (path) => path.replace(/\/$/, '');
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
        hash = location.slice(hashPos, location.length);
    }
    path = resolveRelativePath(path != null ? path : location, currentLocation);
    return {
        fullPath: path + (searchString && '?') + searchString + hash,
        path,
        query,
        hash,
    };
}

function stringifyURL(stringifyQuery, location) {
    let query = location.query ? stringifyQuery(location.query) : '';
    return location.path + (query && '?') + query + (location.hash || '');
}

function stripBase(pathname, base) {
    if (!base || pathname.toLowerCase().indexOf(base.toLowerCase()))
        return pathname;
    return pathname.slice(base.length) || '/';
}

function resolveRelativePath(to, from) {
    if (to.startsWith('/')) return to;
    if (!from.startsWith('/')) {
        warn(`Cannot resolve a relative location without an absolute path. Trying to resolve "${to}" from "${from}".`);
        return to;
    }
    if (!to) return from;
    const fromSegments = from.split('/');
    const toSegments = to.split('/');
    let position = fromSegments.length - 1;
    let toPosition;
    let segment;
    for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
        segment = toSegments[toPosition];
        if (position === 1 || segment === '.') continue;
        if (segment === '..') position--;
        else break;
    }
    return (
        fromSegments.slice(0, position).join('/') +
        '/' +
        toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join('/')
    );
}

var NavigationType;
(function (NavigationType) {
    NavigationType["pop"] = "pop";
    NavigationType["push"] = "push";
})(NavigationType || (NavigationType = {}));

const START = '';
function normalizeBase(base) {
    if (!base) {
        if (isBrowser) {
            const baseEl = document.querySelector('base');
            base = (baseEl && baseEl.getAttribute('href')) || '/';
            base = base.replace(/^\w+:\/\/[^\/]+/, '');
        } else {
            base = '/';
        }
    }
    if (base[0] !== '/' && base[0] !== '#') base = '/' + base;
    return removeTrailingSlash(base);
}

function createWebHistory(base) {
    base = normalizeBase(base);
    const historyNavigation = useHistoryStateNavigation(base);
    const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
    function go(delta, triggerListeners = true) {
        if (!triggerListeners) historyListeners.pauseListeners();
        history.go(delta);
    }
    const routerHistory = assign({
        location: '',
        base,
        go,
        createHref: createHref.bind(null, base),
    }, historyNavigation, historyListeners);
    Object.defineProperty(routerHistory, 'location', {
        get: () => historyNavigation.location.value,
    });
    return routerHistory;
}

function createRouter(options) {
    const matcher = createRouterMatcher(options.routes, options);
    let parseQuery = options.parseQuery || parseQuery;
    let stringifyQuery = options.stringifyQuery || stringifyQuery;
    let routerHistory = options.history;
    const beforeGuards = useCallbacks();
    const beforeResolveGuards = useCallbacks();
    const afterGuards = useCallbacks();
    const currentRoute = vue.shallowRef(START_LOCATION_NORMALIZED);
    let pendingLocation = START_LOCATION_NORMALIZED;

    if (isBrowser && options.scrollBehavior && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const normalizeParams = applyToParams.bind(null, paramValue => '' + paramValue);
    const encodeParams = applyToParams.bind(null, encodeParam);
    const decodeParams = applyToParams.bind(null, decode);
    function addRoute(parentOrRoute, route) {
        let parent;
        let record;
        if (isRouteName(parentOrRoute)) {
            parent = matcher.getRecordMatcher(parentOrRoute);
            record = route;
        } else {
            record = parentOrRoute;
        }
        return matcher.addRoute(record, parent);
    }

    function removeRoute(name) {
        let recordMatcher = matcher.getRecordMatcher(name);
        if (recordMatcher) matcher.removeRoute(recordMatcher);
        else warn(`Cannot remove non-existent route "${String(name)}"`);
    }

    function resolve(rawLocation, currentLocation) {
        currentLocation = assign({}, currentLocation || currentRoute.value);
        if (typeof rawLocation === 'string') {
            const locationNormalized = parseURL(parseQuery, rawLocation, currentLocation.path);
            const matchedRoute = matcher.resolve({ path: locationNormalized.path }, currentLocation);
            const href = routerHistory.createHref(locationNormalized.fullPath);
            return assign(locationNormalized, matchedRoute, {
                params: decodeParams(matchedRoute.params),
                hash: decode(locationNormalized.hash),
                redirectedFrom: undefined,
                href,
            });
        }
        let matcherLocation;
        if ('path' in rawLocation) matcherLocation = assign({}, rawLocation, { path: parseURL(parseQuery, rawLocation.path, currentLocation.path).path });
        else matcherLocation = assign({}, rawLocation, { params: encodeParams(rawLocation.params) });

        let matchedRoute = matcher.resolve(matcherLocation, currentLocation);
        const hash = rawLocation.hash || '';
        matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
        const fullPath = stringifyURL(stringifyQuery, assign({}, rawLocation, { hash: encodeHash(hash), path: matchedRoute.path }));
        let href = routerHistory.createHref(fullPath);
        return assign({ fullPath, hash, query: stringifyQuery === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query }, matchedRoute, { redirectedFrom: undefined, href });
    }

    function push(to) {
        return pushWithRedirect(to);
    }

    function replace(to) {
        return push(assign(locationAsObject(to), { replace: true }));
    }

    function pushWithRedirect(to, redirectedFrom) {
        const targetLocation = (pendingLocation = resolve(to));
        const from = currentRoute.value;
        const data = to.state;
        const force = to.force;
        const replace = to.replace === true;
        const shouldRedirect = handleRedirectRecord(targetLocation);
        if (shouldRedirect) return pushWithRedirect(assign(locationAsObject(shouldRedirect), { state: data, force, replace }), redirectedFrom || targetLocation);
        const toLocation = targetLocation;
        toLocation.redirectedFrom = redirectedFrom;
        let failure;
        if (!force && isSameRouteLocation(stringifyQuery, from, targetLocation)) failure = createRouterError(16 /* NAVIGATION_DUPLICATED */, { to: toLocation, from });
        return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
        .catch((error) => isNavigationFailure(error) ? error : triggerError(error))
        .then((failure) => {
            if (failure) {
                if (isNavigationFailure(failure, 2 /* NAVIGATION_GUARD_REDIRECT */)) {
                    return pushWithRedirect(assign(locationAsObject(failure.to), { state: data, force, replace }), redirectedFrom || toLocation);
                }
            } else {
                failure = finalizeNavigation(toLocation, from, true, replace, data);
            }
            triggerAfterEach(toLocation, from, failure);
            return failure;
        });
    }

    function navigate(to, from) {
        const [leavingRecords, updatingRecords, enteringRecords,] = extractChangingRecords(to, from);
        const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
        return (runGuardQueue([])
            .then(() => {
                for (const guard of beforeGuards.list()) runGuardQueue([]);
                runGuardQueue([]);
                return runGuardQueue([]);
            }).then(() => {
                guards = extractComponentsGuards(updatingRecords, 'beforeRouteUpdate', to, from);
                for (const record of updatingRecords) record.updateGuards.forEach(guard => {});
                runGuardQueue([]);
                return runGuardQueue([]);
            })
            .then(() => {
                runGuardQueue([]);
                return runGuardQueue([]);
            })
                .then(() => {
                runGuardQueue([]);
                return runGuardQueue([]);
            })
            // catch any navigation canceled
            .catch(err => isNavigationFailure(err, 8 /* NAVIGATION_CANCELLED */) ? err : Promise.reject(err)));
    }

    function finalizeNavigation(toLocation, from, isPush, replace, data) {
        const error = checkCanceledNavigation(toLocation, from);
        if (error) return error;
        const isFirstNavigation = from === START_LOCATION_NORMALIZED;
        const state = !isBrowser ? {} : history.state;
        if (isPush) {
            if (replace || isFirstNavigation) routerHistory.replace(toLocation.fullPath, assign({ scroll: isFirstNavigation && state && state.scroll }, data));
            else routerHistory.push(toLocation.fullPath, data);
        }
        currentRoute.value = toLocation;
        markAsReady();
    }

    let removeHistoryListener;
    function setupListeners() {
        removeHistoryListener = routerHistory.listen((to, _from, info) => {
            let toLocation = resolve(to);
            const shouldRedirect = handleRedirectRecord(toLocation);
            if (shouldRedirect) {
                pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop);
                return;
            }
            pendingLocation = toLocation;
            const from = currentRoute.value;
            saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
            navigate(toLocation, from)
                .catch((error) => triggerError(error))
                .then((failure) => {
                    failure = failure || finalizeNavigation(toLocation, from, false);
                    triggerAfterEach(toLocation, from, failure);
                })
                .catch(noop);
        });
    }

    let readyHandlers = useCallbacks();
    let errorHandlers = useCallbacks();
    let ready;

    function triggerError(error) {
        markAsReady(error);
        errorHandlers.list().forEach(handler => handler(error));
        return Promise.reject(error);
    }

    function isReady() {
        if (ready && currentRoute.value !== START_LOCATION_NORMALIZED) return Promise.resolve();
        return new Promise((resolve, reject) => {
            readyHandlers.add([resolve, reject]);
        });
    }

    function markAsReady(err) {
        if (ready) return;
        ready = true;
        setupListeners();
        readyHandlers.list().forEach(([resolve, reject]) => err ? reject(err) : resolve());
        readyHandlers.reset();
    }

    const go = (delta) => routerHistory.go(delta);
    let started;
    const installedApps = new Set();
    const router = {
        currentRoute,
        addRoute,
        removeRoute,
        options,
        push,
        replace,
        go,
        back: () => go(-1),
        forward: () => go(1),
        beforeEach: beforeGuards.add,
        beforeResolve: beforeResolveGuards.add,
        afterEach: afterGuards.add,
        onError: errorHandlers.add,
        isReady,
        install(app) {
            const router = this;
            app.component('RouterLink', RouterLink);
            app.component('RouterView', RouterView);
            app.config.globalProperties.$router = router;
            Object.defineProperty(app.config.globalProperties, '$route', {
                get: () => vue.unref(currentRoute),
            });

            if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
                started = true;
                push(routerHistory.location).catch(err => {});
            }
            const reactiveRoute = {};
            for (let key in START_LOCATION_NORMALIZED) {
                reactiveRoute[key] = vue.computed(() => currentRoute.value[key]);
            }
            app.provide(routerKey, router);
            app.provide(routeLocationKey, vue.reactive(reactiveRoute));
            app.provide(routerViewLocationKey, currentRoute);
            let unmountApp = app.unmount;
            installedApps.add(app);
            app.unmount = function () {
                installedApps.delete(app);
                if (installedApps.size < 1) {
                    removeHistoryListener();
                    currentRoute.value = START_LOCATION_NORMALIZED;
                    started = false;
                    ready = false;
                }
                unmountApp.call(this, arguments);
            };
        },
    };
    return router;
}

function runGuardQueue(guards) {
    return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}

exports.RouterLink = RouterLink;
exports.RouterView = RouterView;
exports.START_LOCATION = START_LOCATION_NORMALIZED;
exports.createMemoryHistory = createMemoryHistory;
exports.createRouter = createRouter;
exports.createWebHashHistory = createWebHashHistory;
exports.createWebHistory = createWebHistory;
exports.isNavigationFailure = isNavigationFailure;
exports.onBeforeRouteLeave = onBeforeRouteLeave;
exports.onBeforeRouteUpdate = onBeforeRouteUpdate;
exports.parseQuery = parseQuery;
exports.routerKey = routerKey;
exports.routerViewLocationKey = routerViewLocationKey;
exports.stringifyQuery = stringifyQuery;
exports.useRoute = useRoute;
exports.useRouter = useRouter;
