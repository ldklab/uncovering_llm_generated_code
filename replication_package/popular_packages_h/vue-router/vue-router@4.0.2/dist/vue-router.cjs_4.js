'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const vue = require('vue');  

// Define unique symbols for different internal keys
const hasSymbol = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
const PolySymbol = (name) => hasSymbol ? Symbol(`[vue-router]: ${name}`) : `[vue-router]: ${name}`;

// Internal symbols for various purposes
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

let noop = () => { };

function warn(msg) {
    const args = Array.from(arguments).slice(1);
    console.warn.apply(console, ['[Vue Router warn]: ' + msg].concat(args));
}

const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, '');

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
    if (!base || pathname.toLowerCase().indexOf(base.toLowerCase())) return pathname;
    return pathname.slice(base.length) || '/';
}

function isSameRouteLocation(stringifyQuery, a, b) {
    let aLastIndex = a.matched.length - 1;
    let bLastIndex = b.matched.length - 1;
    return (aLastIndex > -1 &&
        aLastIndex === bLastIndex &&
        isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) &&
        isSameRouteLocationParams(a.params, b.params) &&
        stringifyQuery(a.query) === stringifyQuery(b.query) &&
        a.hash === b.hash);
}

function isSameRouteRecord(a, b) {
    return (a.aliasOf || a) === (b.aliasOf || b);
}

function isSameRouteLocationParams(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (let key in a) {
        if (!isSameRouteLocationParamsValue(a[key], b[key])) return false;
    }
    return true;
}

function isSameRouteLocationParamsValue(a, b) {
    return Array.isArray(a)
        ? isEquivalentArray(a, b)
        : Array.isArray(b)
            ? isEquivalentArray(b, a)
            : a === b;
}

function isEquivalentArray(a, b) {
    return Array.isArray(b)
        ? a.length === b.length && a.every((value, i) => value === b[i])
        : a.length === 1 && a[0] === b;
}

function resolveRelativePath(to, from) {
    if (to.startsWith('/')) return to;
    if (!from.startsWith('/')) {
        warn(`Cannot resolve a relative location without an absolute path. Trying to resolve "${to}" from "${from}". It should look like "/${from}".`);
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

    return (fromSegments.slice(0, position).join('/') +
            '/' +
            toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join('/'));
}
// Symbols for Navigation Type and Direction Enums
var NavigationType = { pop: "pop", push: "push" };
var NavigationDirection = { back: "back", forward: "forward", unknown: "" };

// Starting location for histories
const START = '';

// Normalizes a base by removing any trailing slash
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

// Removes any character before the hash
const BEFORE_HASH_RE = /^[^#]+#/;

function createHref(base, location) {
    return base.replace(BEFORE_HASH_RE, '#') + location;
}

function getElementPosition(el, offset) {
    const docRect = document.documentElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return { behavior: offset.behavior, left: elRect.left - docRect.left - (offset.left || 0), top: elRect.top - docRect.top - (offset.top || 0) };
}

const computeScrollPosition = () => ({ left: window.pageXOffset, top: window.pageYOffset });

function scrollToPosition(position) {
    let scrollToOptions;
    if ('el' in position) {
        let positionEl = position.el;
        const isIdSelector = typeof positionEl === 'string' && positionEl.startsWith('#');

        if (typeof position.el === 'string') {
            if (!isIdSelector || !document.getElementById(position.el.slice(1))) {
                try {
                    let foundEl = document.querySelector(position.el);
                    if (isIdSelector && foundEl) {
                        warn(`The selector "${position.el}" should be passed as "el: document.querySelector('${position.el}')" because it starts with "#".`);
                        return;
                    }
                } catch (err) {
                    warn(`The selector "${position.el}" is invalid. If you are using an id selector, make sure to escape it. You can find more information about escaping characters in selectors at https://mathiasbynens.be/notes/css-escapes or use CSS.escape (https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape).`);
                    return;
                }
            }
        }

        const el = typeof positionEl === 'string'
            ? isIdSelector
                ? document.getElementById(positionEl.slice(1))
                : document.querySelector(positionEl)
            : positionEl;
        if (!el) {
            warn(`Couldn't find element using selector "${position.el}" returned by scrollBehavior.`);
            return;
        }
        scrollToOptions = getElementPosition(el, position);
    } else {
        scrollToOptions = position;
    }

    if ('scrollBehavior' in document.documentElement.style) window.scrollTo(scrollToOptions);
    else window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.pageXOffset, scrollToOptions.top != null ? scrollToOptions.top : window.pageYOffset);
}

function getScrollKey(path, delta) {
    const position = history.state ? history.state.position - delta : -1;
    return position + path;
}

const scrollPositions = new Map();

function saveScrollPosition(key, scrollPosition) {
    scrollPositions.set(key, scrollPosition);
}

function getSavedScrollPosition(key) {
    const scroll = scrollPositions.get(key);
    scrollPositions.delete(key);
    return scroll;
}

let createBaseLocation = () => location.protocol + '//' + location.host;

function createCurrentLocation(base, location) {
    const { pathname, search, hash } = location;
    const hashPos = base.indexOf('#');
    if (hashPos > -1) {
        let pathFromHash = hash.slice(1);
        if (pathFromHash[0] !== '/') pathFromHash = '/' + pathFromHash;
        return stripBase(pathFromHash, '');
    }
    const path = stripBase(pathname, base);
    return path + search + hash;
}

function useHistoryListeners(base, historyState, currentLocation, replace) {
    let listeners = [];
    let teardowns = [];
    let pauseState = null;
    const popStateHandler = ({ state, }) => {
        const to = createCurrentLocation(base, location);
        const from = currentLocation.value;
        const fromState = historyState.value;
        let delta = 0;
        if (state) {
            currentLocation.value = to;
            historyState.value = state;
            if (pauseState && pauseState === from) {
                pauseState = null;
                return;
            }
            delta = fromState ? state.position - fromState.position : 0;
        } else {
            replace(to);
        }

        listeners.forEach(listener => listener(currentLocation.value, from, {
            delta,
            type: NavigationType.pop,
            direction: delta
                ? delta > 0
                    ? NavigationDirection.forward
                    : NavigationDirection.back
                : NavigationDirection.unknown,
        }));
    };
    function pauseListeners() {
        pauseState = currentLocation.value;
    }
    function listen(callback) {
        listeners.push(callback);
        const teardown = () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
        };
        teardowns.push(teardown);
        return teardown;
    }
    function beforeUnloadListener() {
        const { history } = window;
        if (!history.state) return;
        history.replaceState(assign({}, history.state, { scroll: computeScrollPosition() }), '');
    }
    function destroy() {
        for (const teardown of teardowns) teardown();
        teardowns = [];
        window.removeEventListener('popstate', popStateHandler);
        window.removeEventListener('beforeunload', beforeUnloadListener);
    }
    window.addEventListener('popstate', popStateHandler);
    window.addEventListener('beforeunload', beforeUnloadListener);
    return { 
        pauseListeners, 
        listen, 
        destroy 
    };
}

function buildState(back, current, forward, replaced = false, computeScroll = false) {
    return { 
        back, 
        current, 
        forward, 
        replaced, 
        position: window.history.length, 
        scroll: computeScroll ? computeScrollPosition() : null 
    };
}

function useHistoryStateNavigation(base) {
    const { history, location } = window;
    let currentLocation = { value: createCurrentLocation(base, location) };
    let historyState = { value: history.state };

    if (!historyState.value) {
        changeLocation(currentLocation.value, {
            back: null,
            current: currentLocation.value,
            forward: null,
            position: history.length - 1,
            replaced: true,
            scroll: null,
        }, true);
    }

    function changeLocation(to, state, replace) {
        const hashIndex = base.indexOf('#');
        const url = hashIndex > -1
            ? base.slice(hashIndex) + to
            : createBaseLocation() + base + to;
        try {
            history[replace ? 'replaceState' : 'pushState'](state, '', url);
            historyState.value = state;
        } catch (err) {
            warn('Error with push/replace State', err);
            location[replace ? 'replace' : 'assign'](url);
        }
    }

    function replace(to, data) {
        const state = assign({}, history.state, buildState(historyState.value.back, to, historyState.value.forward, true), data, { position: historyState.value.position });
        changeLocation(to, state, true);
        currentLocation.value = to;
    }

    function push(to, data) {
        const currentState = assign({}, historyState.value, history.state, { forward: to, scroll: computeScrollPosition() });
        if (!history.state) {
            warn(`history.state seems to have been manually replaced without preserving the necessary values. Make sure to preserve existing history state if you are manually calling history.replaceState:\n\n` +
                `history.replaceState(history.state, '', url)\n\n` +
                `You can find more information at https://next.router.vuejs.org/guide/migration/#usage-of-history-state.`);
        }
        changeLocation(currentState.current, currentState, true);
        const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
        changeLocation(to, state, false);
        currentLocation.value = to;
    }

    return { 
        location: currentLocation, 
        state: historyState, 
        push, 
        replace 
    };
}

function createWebHistory(base) {
    base = normalizeBase(base);
    const historyNavigation = useHistoryStateNavigation(base);
    const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);

    function go(delta) {
        historyListeners.pauseListeners();
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

    Object.defineProperty(routerHistory, 'state', {
        get: () => historyNavigation.state.value,
    });

    return routerHistory;
}

function createMemoryHistory(base = '') {
    let listeners = [];
    let queue = [START];
    let position = 0;

    function setLocation(location) {
        position++;
        if (position === queue.length) {
            queue.push(location);
        } else {
            queue.splice(position);
            queue.push(location);
        }
    }

    function triggerListeners(to, from, { direction, delta }) {
        const info = { direction, delta, type: NavigationType.pop };
        for (let callback of listeners) callback(to, from, info);
    }

    const routerHistory = {
        location: START,
        state: {},
        base,
        createHref: createHref.bind(null, base),
        replace(to) {
            queue.splice(position--, 1);
            setLocation(to);
        },
        push(to) { setLocation(to); },
        listen(callback) {
            listeners.push(callback);
            return () => {
                const index = listeners.indexOf(callback);
                if (index > -1) listeners.splice(index, 1);
            };
        },
        destroy() { listeners = []; },
        go(delta) {
            const from = this.location;
            const direction = delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
            position = Math.max(0, Math.min(position + delta, queue.length - 1));
            triggerListeners(this.location, from, { direction, delta });
        },
    };

    Object.defineProperty(routerHistory, 'location', {
        get: () => queue[position],
    });

    return routerHistory;
}

function createWebHashHistory(base) {
    base = location.host ? base || location.pathname : '';
    if (base.indexOf('#') < 0) base += '#';

    if (!base.endsWith('#/') && !base.endsWith('#')) {
        warn(`A hash base must end with a "#":\n"${base}" should be "${base.replace(/#.*$/, '#')}".`);
    }

    return createWebHistory(base);
}

function isRouteLocation(route) {
    return typeof route === 'string' || (route && typeof route === 'object');
}

function isRouteName(name) {
    return typeof name === 'string' || typeof name === 'symbol';
}

const START_LOCATION_NORMALIZED = {
    path: '/',
    name: undefined,
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined,
};

const NavigationFailureSymbol = PolySymbol('navigation failure');

(function (NavigationFailureType) {
    NavigationFailureType[NavigationFailureType["aborted"] = 4] = "aborted";
    NavigationFailureType[NavigationFailureType["cancelled"] = 8] = "cancelled";
    NavigationFailureType[NavigationFailureType["duplicated"] = 16] = "duplicated";
})(exports.NavigationFailureType || (exports.NavigationFailureType = {}));

const ErrorTypeMessages = {
    [1 /* MATCHER_NOT_FOUND */]({ location, currentLocation }) {
        return `No match for\n ${JSON.stringify(location)}` +
            `${currentLocation ? '\nwhile being at\n' + JSON.stringify(currentLocation) : ''}`;
    },
    [2 /* NAVIGATION_GUARD_REDIRECT */]({ from, to, }) {
        return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
    },
    [4 /* NAVIGATION_ABORTED */]({ from, to }) {
        return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
    },
    [8 /* NAVIGATION_CANCELLED */]({ from, to }) {
        return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
    },
    [16 /* NAVIGATION_DUPLICATED */]({ from, to }) {
        return `Avoided redundant navigation to current location: "${from.fullPath}".`;
    },
};

function createRouterError(type, params) {
    return assign(new Error(ErrorTypeMessages[type](params)), { type, [NavigationFailureSymbol]: true }, params);
}

function isNavigationFailure(error, type) {
    return (error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type)));
}

const propertiesToLog = ['params', 'query', 'hash'];

function stringifyRoute(to) {
    if (typeof to === 'string') return to;
    if ('path' in to) return to.path;
    const location = {};
    for (const key of propertiesToLog) {
        if (key in to) location[key] = to[key];
    }
    return JSON.stringify(location, null, 2);
}

const BASE_PARAM_PATTERN = '[^/]+?';
const BASE_PATH_PARSER_OPTIONS = { sensitive: false, strict: false, start: true, end: true };
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;

function tokensToParser(segments, extraOptions) {
    const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
    let score = [];
    let pattern = options.start ? '^' : '';
    const keys = [];
    for (const segment of segments) {
        const segmentScores = segment.length ? [] : [90 /* Root */];
        if (options.strict && !segment.length) pattern += '/';
        for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
            const token = segment[tokenIndex];
            let subSegmentScore = 40 /* Segment */ + (options.sensitive ? 0.25 /* BonusCaseSensitive */ : 0);
            if (token.type === 0 /* Static */) {
                if (!tokenIndex) pattern += '/';
                pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
                subSegmentScore += 40 /* Static */;
            } else if (token.type === 1 /* Param */) {
                const { value, repeatable, optional, regexp } = token;
                keys.push({ name: value, repeatable, optional });
                const re = regexp ? regexp : BASE_PARAM_PATTERN;
                if (re !== BASE_PARAM_PATTERN) {
                    subSegmentScore += 10 /* BonusCustomRegExp */;
                    try {
                        new RegExp(`(${re})`);
                    } catch (err) {
                        throw new Error(`Invalid custom RegExp for param "${value}" (${re}): ` + err.message);
                    }
                }
                let subPattern = repeatable ? `((?:${re})(?:/(?:${re}))*)` : `(${re})`;
                if (!tokenIndex) subPattern = optional ? `(?:/${subPattern})` : '/' + subPattern;
                if (optional) subPattern += '?';
                pattern += subPattern;
                subSegmentScore += 20 /* Dynamic */;
                if (optional) subSegmentScore += -8 /* BonusOptional */;
                if (repeatable) subSegmentScore += -20 /* BonusRepeatable */;
                if (re === '.*') subSegmentScore += -50 /* BonusWildcard */;
            }
            segmentScores.push(subSegmentScore);
        }
        score.push(segmentScores);
    }
    if (options.strict && options.end) {
        const i = score.length - 1;
        score[i][score[i].length - 1] += 0.7000000000000001 /* BonusStrict */;
    }
    if (!options.strict) pattern += '/?';
    if (options.end) pattern += '$';
    else if (options.strict) pattern += '(?:/|$)';
    const re = new RegExp(pattern, options.sensitive ? '' : 'i');
    return {
        re,
        score,
        keys,
        parse: (path) => {
            const match = path.match(re);
            const params = {};
            if (!match) return null;
            for (let i = 1; i < match.length; i++) {
                const value = match[i] || '';
                const key = keys[i - 1];
                params[key.name] = value && key.repeatable ? value.split('/') : value;
            }
            return params;
        },
        stringify: (params) => {
            let path = '';
            let avoidDuplicatedSlash = false;
            for (const segment of segments) {
                if (!avoidDuplicatedSlash || !path.endsWith('/')) path += '/';
                avoidDuplicatedSlash = false;
                for (const token of segment) {
                    if (token.type === 0 /* Static */) {
                        path += token.value;
                    } else if (token.type === 1 /* Param */) {
                        const { value, repeatable, optional } = token;
                        const param = value in params ? params[value] : '';
                        const text = Array.isArray(param) ? param.join('/') : param;
                        if (!text) {
                            if (optional) {
                                if (path.endsWith('/')) path = path.slice(0, -1);
                                else avoidDuplicatedSlash = true;
                            } else throw new Error(`Missing required param "${value}"`);
                        }
                        path += text;
                    }
                }
            }
            return path;
        },
    };
}

function compareScoreArray(a, b) {
    let i = 0;
    while (i < a.length && i < b.length) {
        const diff = b[i] - a[i];
        if (diff) return diff;
        i++;
    }
    if (a.length < b.length) return a.length === 1 && a[0] === 40 /* Static */ + 40 /* Segment */ ? -1 : 1;
    else if (a.length > b.length) return b.length === 1 && b[0] === 40 /* Static */ + 40 /* Segment */ ? 1 : -1;
    return 0;
}

function comparePathParserScore(a, b) {
    let i = 0;
    const aScore = a.score;
    const bScore = b.score;
    while (i < aScore.length && i < bScore.length) {
        const comp = compareScoreArray(aScore[i], bScore[i]);
        if (comp) return comp;
        i++;
    }
    return bScore.length - aScore.length;
}

const ROOT_TOKEN = { type: 0, value: '' };
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;

function tokenizePath(path) {
    if (!path) return [[]];
    if (path === '/') return [[ROOT_TOKEN]];
    if (!path.startsWith('/')) throw new Error(`Route paths should start with a "/": "${path}" should be "/${path}".`);
    
    let state = 0;
    let previousState = state;
    const tokens = [];
    let segment;
    function finalizeSegment() {
        if (segment) tokens.push(segment);
        segment = [];
    }
    
    let i = 0;
    let char;
    let buffer = '';
    let customRe = '';
    function consumeBuffer() {
        if (!buffer) return;
        if (state === 0 /* Static */) {
            segment.push({ type: 0 /* Static */, value: buffer });
        } else if (state === 1 /* Param */ || state === 2 /* ParamRegExp */ || state === 3 /* ParamRegExpEnd */) {
            if (segment.length > 1 && (char === '*' || char === '+')) crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
            segment.push({ type: 1 /* Param */, value: buffer, regexp: customRe, repeatable: char === '*' || char === '+', optional: char === '*' || char === '?' });
        } else {
            crash('Invalid state to consume buffer');
        }
        buffer = '';
    }
    
    function addCharToBuffer() {
        buffer += char;
    }
            
    while (i < path.length) {
        char = path[i++];
        if (char === '\\' && state !== 2 /* ParamRegExp */) {
            previousState = state;
            state = 4 /* EscapeNext */;
            continue;
        }
        
        switch (state) {
            case 0 /* Static */:
                if (char === '/') {
                    if (buffer) {
                        consumeBuffer();
                    }
                    finalizeSegment();
                } else if (char === ':') {
                    consumeBuffer();
                    state = 1 /* Param */;
                } else {
                    addCharToBuffer();
                }
                break;
            case 4 /* EscapeNext */:
                addCharToBuffer();
                state = previousState;
                break;
            case 1 /* Param */:
                if (char === '(') {
                    state = 2 /* ParamRegExp */;
                } else if (VALID_PARAM_RE.test(char)) {
                    addCharToBuffer();
                } else {
                    consumeBuffer();
                    state = 0 /* Static */;
                    if (char !== '*' && char !== '?' && char !== '+') i--;
                }
                break;
            case 2 /* ParamRegExp */:
                if (char === ')') {
                    if (customRe[customRe.length - 1] == '\\') customRe = customRe.slice(0, -1) + char;
                    else state = 3 /* ParamRegExpEnd */;
                } else {
                    customRe += char;
                }
                break;
            case 3 /* ParamRegExpEnd */:
                consumeBuffer();
                state = 0 /* Static */;
                if (char !== '*' && char !== '?' && char !== '+') i--;
                customRe = '';
                break;
        }
    }
    if (state === 2 /* ParamRegExp */) crash(`Unfinished custom RegExp for param "${buffer}"`);

    consumeBuffer();
    finalizeSegment();
    return tokens;
}

function createRouteRecordMatcher(record, parent, options) {
    const parser = tokensToParser(tokenizePath(record.path), options);
    {
        const existingKeys = new Set();
        for (const key of parser.keys) {
            if (existingKeys.has(key.name)) warn(`Found duplicated params with name "${key.name}" for path "${record.path}". Only the last one will be available on "$route.params".`);
            existingKeys.add(key.name);
        }
    }
    const matcher = assign(parser, {
        record,
        parent,
        children: [],
        alias: [],
    });
    if (parent) {
        if (!matcher.record.aliasOf === !parent.record.aliasOf) parent.children.push(matcher);
    }
    return matcher;
}

function createRouterMatcher(routes, globalOptions) {
    const matchers = [];
    const matcherMap = new Map();
    globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
    function getRecordMatcher(name) {
        return matcherMap.get(name);
    }
    function addRoute(record, parent, originalRecord) {
        let isRootAdd = !originalRecord;
        let mainNormalizedRecord = normalizeRouteRecord(record);
        mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
        const options = mergeOptions(globalOptions, record);
        const normalizedRecords = [mainNormalizedRecord];
        if ('alias' in record) {
            const aliases = typeof record.alias === 'string' ? [record.alias] : record.alias;
            for (const alias of aliases) {
                normalizedRecords.push(assign({}, mainNormalizedRecord, {
                    components: originalRecord
                        ? originalRecord.record.components
                        : mainNormalizedRecord.components,
                    path: alias,
                    aliasOf: originalRecord
                        ? originalRecord.record
                        : mainNormalizedRecord,
                }));
            }
        }
        let matcher;
        let originalMatcher;
        for (const normalizedRecord of normalizedRecords) {
            let { path } = normalizedRecord;
            if (parent && path[0] !== '/') {
                let parentPath = parent.record.path;
                let connectingSlash = parentPath[parentPath.length - 1] === '/' ? '' : '/';
                normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
            }
            if (normalizedRecord.path === '*') {
                throw new Error('Catch all routes ("*") must now be defined using a param with a custom regexp.\n' +
                    'See more at https://next.router.vuejs.org/guide/migration/#removed-star-or-catch-all-routes.');
            }
            matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
            if (parent && path[0] === '/') checkMissingParamsInAbsolutePath(matcher, parent);
            if (originalRecord) {
                originalRecord.alias.push(matcher);
                {
                    checkSameParams(originalRecord, matcher);
                }
            } else {
                originalMatcher = originalMatcher || matcher;
                if (originalMatcher !== matcher) originalMatcher.alias.push(matcher);
                if (isRootAdd && record.name && !isAliasRecord(matcher)) removeRoute(record.name);
            }
            if ('children' in mainNormalizedRecord) {
                let children = mainNormalizedRecord.children;
                for (let i = 0; i < children.length; i++) {
                    addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
                }
            }
            originalRecord = originalRecord || matcher;
            insertMatcher(matcher);
        }
        return originalMatcher ? () => removeRoute(originalMatcher) : noop;
    }
    function removeRoute(matcherRef) {
        if (isRouteName(matcherRef)) {
            const matcher = matcherMap.get(matcherRef);
            if (matcher) {
                matcherMap.delete(matcherRef);
                matchers.splice(matchers.indexOf(matcher), 1);
                matcher.children.forEach(removeRoute);
                matcher.alias.forEach(removeRoute);
            }
        } else {
            let index = matchers.indexOf(matcherRef);
            if (index > -1) {
                matchers.splice(index, 1);
                if (matcherRef.record.name) matcherMap.delete(matcherRef.record.name);
                matcherRef.children.forEach(removeRoute);
                matcherRef.alias.forEach(removeRoute);
            }
        }
    }
    function getRoutes() {
        return matchers;
    }
    function insertMatcher(matcher) {
        let i = 0;
        while (i < matchers.length && comparePathParserScore(matcher, matchers[i]) >= 0) i++;
        matchers.splice(i, 0, matcher);
        if (matcher.record.name && !isAliasRecord(matcher)) matcherMap.set(matcher.record.name, matcher);
    }
    function resolve(location, currentLocation) {
        let matcher;
        let params = {};
        let path;
        let name;
        if ('name' in location && location.name) {
            matcher = matcherMap.get(location.name);
            if (!matcher) throw createRouterError(1 /* MATCHER_NOT_FOUND */, { location });
            name = matcher.record.name;
            params = assign(paramsFromLocation(currentLocation.params, matcher.keys.filter(k => !k.optional).map(k => k.name)), location.params);
            path = matcher.stringify(params);
        } else if ('path' in location) {
            path = location.path;
            if (!path.startsWith('/')) {
                warn(`The Matcher cannot resolve relative paths but received "${path}". Unless you directly called \`matcher.resolve("${path}")\`, this is probably a bug in vue-router. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/vue-router-next.`);
            }
            matcher = matchers.find(m => m.re.test(path));
            if (matcher) {
                params = matcher.parse(path);
                name = matcher.record.name;
            }
        } else {
            matcher = currentLocation.name
            ? matcherMap.get(currentLocation.name)
            : matchers.find(m => m.re.test(currentLocation.path));
            if (!matcher) throw createRouterError(1 /* MATCHER_NOT_FOUND */, { location, currentLocation });
            name = matcher.record.name;
            params = assign({}, currentLocation.params, location.params);
            path = matcher.stringify(params);
        }
        const matched = [];
        let parentMatcher = matcher;
        while (parentMatcher) {
            matched.unshift(parentMatcher.record);
            parentMatcher = parentMatcher.parent;
        }
        return { 
            name, 
            path, 
            params, 
            matched, 
            meta: mergeMetaFields(matched) 
        };
    }
    routes.forEach(route => addRoute(route));
    return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher };
}

function paramsFromLocation(params, keys) {
    let newParams = {};
    for (let key of keys) {
        if (key in params) newParams[key] = params[key];
    }
    return newParams;
}

function normalizeRouteRecord(record) {
    return {
        path: record.path,
        redirect: record.redirect,
        name: record.name,
        meta: record.meta || {},
        aliasOf: undefined,
        beforeEnter: record.beforeEnter,
        props: normalizeRecordProps(record),
        children: record.children || [],
        instances: {},
        leaveGuards: new Set(),
        updateGuards: new Set(),
        enterCallbacks: {},
        components: 'components' in record
            ? record.components || {}
            : { default: record.component },
    };
}

function normalizeRecordProps(record) {
    const propsObject = {};
    const props = record.props || false;
    if ('component' in record) {
        propsObject.default = props;
    } else {
        for (let name in record.components) propsObject[name] = typeof props === 'boolean' ? props : props[name];
    }
    return propsObject;
}

function isAliasRecord(record) {
    while (record) {
        if (record.record.aliasOf) return true;
        record = record.parent;
    }
    return false;
}

function mergeMetaFields(matched) {
    return matched.reduce((meta, record) => assign(meta, record.meta), {});
}

function mergeOptions(defaults, partialOptions) {
    let options = {};
    for (let key in defaults) {
        options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
    }
    return options;
}

function isSameParam(a, b) {
    return a.name === b.name && a.optional === b.optional && a.repeatable === b.repeatable;
}

function checkSameParams(a, b) {
    for (let key of a.keys) {
        if (!b.keys.find(isSameParam.bind(null, key))) return warn(`Alias "${b.record.path}" and the original record: "${a.record.path}" should have the exact same param named "${key.name}"`);
    }
    for (let key of b.keys) {
        if (!a.keys.find(isSameParam.bind(null, key))) return warn(`Alias "${b.record.path}" and the original record: "${a.record.path}" should have the exact same param named "${key.name}"`);
    }
}

function checkMissingParamsInAbsolutePath(record, parent) {
    for (let key of parent.keys) {
        if (!record.keys.find(isSameParam.bind(null, key))) return warn(`Absolute path "${record.record.path}" should have the exact same param named "${key.name}" as its parent "${parent.record.path}".`);
    }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;

const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;

function commonEncode(text) {
    return encodeURI('' + text)
        .replace(ENC_PIPE_RE, '|')
        .replace(ENC_BRACKET_OPEN_RE, '[')
        .replace(ENC_BRACKET_CLOSE_RE, ']');
}

function encodeHash(text) {
    return commonEncode(text)
        .replace(ENC_CURLY_OPEN_RE, '{')
        .replace(ENC_CURLY_CLOSE_RE, '}')
        .replace(ENC_CARET_RE, '^');
}

function encodeQueryValue(text) {
    return (commonEncode(text)
        .replace(PLUS_RE, '%2B')
        .replace(ENC_SPACE_RE, '+')
        .replace(HASH_RE, '%23')
        .replace(AMPERSAND_RE, '%26')
        .replace(ENC_BACKTICK_RE, '`')
        .replace(ENC_CURLY_OPEN_RE, '{')
        .replace(ENC_CURLY_CLOSE_RE, '}')
        .replace(ENC_CARET_RE, '^'));
}

function encodeQueryKey(text) {
    return encodeQueryValue(text).replace(EQUAL_RE, '%3D');
}

function encodePath(text) {
    return commonEncode(text).replace(HASH_RE, '%23').replace(IM_RE, '%3F');
}

function encodeParam(text) {
    return encodePath(text).replace(SLASH_RE, '%2F');
}

function decode(text) {
    try {
        return decodeURIComponent('' + text);
    } catch (err) {
        warn(`Error decoding "${text}". Using original value`);
    }
    return '' + text;
}

function parseQuery(search) {
    const query = {};
    if (search === '' || search === '?') return query;
    const hasLeadingIM = search[0] === '?';
    const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&');
    for (let i = 0; i < searchParams.length; ++i) {
        const searchParam = searchParams[i].replace(PLUS_RE, ' ');
        let eqPos = searchParam.indexOf('=');
        let key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
        let value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
        if (key in query) {
            let currentValue = query[key];
            if (!Array.isArray(currentValue)) currentValue = query[key] = [currentValue];
            currentValue.push(value);
        } else {
            query[key] = value;
        }
    }
    return query;
}

function stringifyQuery(query) {
    let search = '';
    for (let key in query) {
        if (search.length) search += '&';
        const value = query[key];
        key = encodeQueryKey(key);
        if (value == null) {
            if (value !== undefined) search += key;
            continue;
        }
        let values = Array.isArray(value)
            ? value.map(v => v && encodeQueryValue(v))
            : [value && encodeQueryValue(value)];
        for (let i = 0; i < values.length; i++) {
            search += (i ? '&' : '') + key;
            if (values[i] != null) search += ('=' + values[i]);
        }
    }
    return search;
}

function normalizeQuery(query) {
    const normalizedQuery = {};
    for (let key in query) {
        let value = query[key];
        if (value !== undefined) {
            normalizedQuery[key] = Array.isArray(value)
                ? value.map(v => (v == null ? null : '' + v))
                : value == null ? value : '' + value;
        }
    }
    return normalizedQuery;
}

function useCallbacks() {
    let handlers = [];
    function add(handler) {
        handlers.push(handler);
        return () => {
            const i = handlers.indexOf(handler);
            if (i > -1) handlers.splice(i, 1);
        };
    }
    function reset() {
        handlers = [];
    }
    return { 
        add, 
        list: () => handlers, 
        reset 
    };
}

function registerGuard(record, name, guard) {
    const removeFromList = () => {
        record[name].delete(guard);
    };
    vue.onUnmounted(removeFromList);
    vue.onDeactivated(removeFromList);
    vue.onActivated(() => { record[name].add(guard); });
    record[name].add(guard);
}

function onBeforeRouteLeave(leaveGuard) {
    if (!vue.getCurrentInstance()) {
        warn('onBeforeRouteLeave must be called at the top of a setup function');
        return;
    }
    const activeRecord = vue.inject(matchedRouteKey, {}).value;
    if (!activeRecord) {
        warn('onBeforeRouteLeave must be called at the top of a setup function');
        return;
    }
    registerGuard(activeRecord, 'leaveGuards', leaveGuard);
}

function onBeforeRouteUpdate(updateGuard) {
    if (!vue.getCurrentInstance()) {
        warn('onBeforeRouteUpdate must be called at the top of a setup function');
        return;
    }
    const activeRecord = vue.inject(matchedRouteKey, {}).value;
    if (!activeRecord) {
        warn('onBeforeRouteUpdate must be called at the top of a setup function');
        return;
    }
    registerGuard(activeRecord, 'updateGuards', updateGuard);
}

function guardToPromiseFn(guard, to, from, record, name) {
    const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
    return () => new Promise((resolve, reject) => {
        const next = (valid) => {
            if (valid === false) reject(createRouterError(4 /* NAVIGATION_ABORTED */, { from, to }));
            else if (valid instanceof Error) {
                reject(valid);
            } else if (isRouteLocation(valid)) {
                reject(createRouterError(2 /* NAVIGATION_GUARD_REDIRECT */, { from: to, to: valid }));
            } else {
                if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === 'function') enterCallbackArray.push(valid);
                resolve();
            }
        };
        const guardReturn = guard.call(record && record.instances[name], to, from, canOnlyBeCalledOnce(next, to, from));
        let guardCall = Promise.resolve(guardReturn);
        if (guard.length < 3) guardCall = guardCall.then(next);
        if (guard.length > 2) {
            const message = `The "next" callback was never called inside of ${guard.name ? '"' + guard.name + '"' : ''}:\n${guard.toString()}\n. If you are returning a value instead of calling "next", make sure to remove the "next" parameter from your function.`;
            if (typeof guardReturn === 'object' && 'then' in guardReturn) {
                guardCall = guardCall.then(resolvedValue => {
                    if (!next._called) {
                        warn(message);
                        return Promise.reject(new Error('Invalid navigation guard'));
                    }
                    return resolvedValue;
                });
            } else if (guardReturn !== undefined) {
                if (!next._called) {
                    warn(message);
                    reject(new Error('Invalid navigation guard'));
                    return;
                }
            }
        }
        guardCall.catch(err => reject(err));
    });
}

function canOnlyBeCalledOnce(next, to, from) {
    let called = 0;
    return function () {
        if (called++ === 1) warn(`The "next" callback was called more than once in one navigation guard when going from "${from.fullPath}" to "${to.fullPath}". It should be called exactly one time in each navigation guard. This will fail in production.`);
        next._called = true;
        if (called === 1) next.apply(null, arguments);
    };
}

function extractComponentsGuards(matched, guardType, to, from) {
    const guards = [];
    for (const record of matched) {
        for (const name in record.components) {
            let rawComponent = record.components[name];
            {
                if (!rawComponent || (typeof rawComponent !== 'object' && typeof rawComponent !== 'function')) {
                    warn(`Component "${name}" in record with path "${record.path}" is not a valid component. Received "${String(rawComponent)}".`);
                    throw new Error('Invalid route component');
                } else if ('then' in rawComponent) {
                    warn(`Component "${name}" in record with path "${record.path}" is a Promise instead of a function that returns a Promise. Did you write "import('./MyPage.vue')" instead of "import('./MyPage.vue')" ? This will break in production if not fixed.`);
                    let promise = rawComponent;
                    rawComponent = () => promise;
                }
            }
            if (guardType !== 'beforeRouteEnter' && !record.instances[name]) continue;
            if (isRouteComponent(rawComponent)) {
                let options = rawComponent.__vccOpts || rawComponent;
                const guard = options[guardType];
                guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
            } else {
                let componentPromise = rawComponent();
                if (!('catch' in componentPromise)) {
                    warn(`Component "${name}" in record with path "${record.path}" is a function that does not return a Promise. If you were passing a functional component, make sure to add a "displayName" to the component. This will break in production.`);
                    componentPromise = Promise.resolve(componentPromise);
                } else {
                    componentPromise = componentPromise.catch(err => err && warn(err));
                }
                guards.push(() => componentPromise.then(resolved => {
                    if (!resolved) return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
                    const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
                    record.components[name] = resolvedComponent;
                    const guard = resolvedComponent[guardType];
                    return guard && guardToPromiseFn(guard, to, from, record, name)();
                }));
            }
        }
    }
    return guards;
}

function isRouteComponent(component) {
    return (typeof component === 'object' || 'displayName' in component || 'props' in component || '__vccOpts' in component);
}

function useLink(props) {
    const router = vue.inject(routerKey);
    const currentRoute = vue.inject(routeLocationKey);
    const route = vue.computed(() => router.resolve(vue.unref(props.to)));
    const activeRecordIndex = vue.computed(() => {
        let { matched } = route.value;
        let { length } = matched;
        const routeMatched = matched[length - 1];
        let currentMatched = currentRoute.matched;
        if (!routeMatched || !currentMatched.length) return -1;
        let index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
        if (index > -1) return index;
        let parentRecordPath = getOriginalPath(matched[length - 2]);
        return (length > 1 && getOriginalPath(routeMatched) === parentRecordPath &&
            currentMatched[currentMatched.length - 1].path !== parentRecordPath
            ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2]))
            : index);
    });
    const isActive = vue.computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
    const isExactActive = vue.computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));

    function navigate(e = {}) {
        if (guardEvent(e)) return router[vue.unref(props.replace) ? 'replace' : 'push'](vue.unref(props.to));
        return Promise.resolve();
    }

    return { route, href: vue.computed(() => route.value.href), isActive, isExactActive, navigate };
}

const RouterLinkImpl = vue.defineComponent({
    name: 'RouterLink',
    props: {
        to: { type: [String, Object], required: true },
        activeClass: String,
        exactActiveClass: String,
        custom: Boolean,
        ariaCurrentValue: { type: String, default: 'page' },
    },
    setup(props, { slots, attrs }) {
        const link = vue.reactive(useLink(props));
        const { options } = vue.inject(routerKey);
        const elClass = vue.computed(() => ({
            [getLinkClass(props.activeClass, options.linkActiveClass, 'router-link-active')]: link.isActive,
            [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, 'router-link-exact-active')]: link.isExactActive,
        }));
        return () => {
            const children = slots.default && slots.default(link);
            return props.custom ? children : vue.h('a', assign({
                'aria-current': link.isExactActive ? props.ariaCurrentValue : null,
                onClick: link.navigate,
                href: link.href,
            }, attrs, { class: elClass.value }), children);
        };
    },
});

const RouterLink = RouterLinkImpl;

function guardEvent(e) {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.currentTarget && e.currentTarget.getAttribute) {
        const target = e.currentTarget.getAttribute('target');
        if (/\b_blank\b/i.test(target)) return;
    }
    if (e.preventDefault) e.preventDefault();
    return true;
}

function includesParams(outer, inner) {
    for (let key in inner) {
        let innerValue = inner[key];
        let outerValue = outer[key];
        if (typeof innerValue === 'string') {
            if (innerValue !== outerValue) return false;
        } else {
            if (!Array.isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i])) return false;
        }
    }
    return true;
}

function getOriginalPath(record) {
    return record ? (record.aliasOf ? record.aliasOf.path : record.path) : '';
}

const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;

const RouterViewImpl = vue.defineComponent({
    name: 'RouterView',
    inheritAttrs: false,
    props: {
        name: { type: String, default: 'default' },
        route: Object,
    },
    setup(props, { attrs, slots }) {
        warnDeprecatedUsage();
        const injectedRoute = vue.inject(routerViewLocationKey);
        const routeToDisplay = vue.computed(() => props.route || injectedRoute.value);
        const depth = vue.inject(viewDepthKey, 0);
        const matchedRouteRef = vue.computed(() => routeToDisplay.value.matched[depth]);
        vue.provide(viewDepthKey, depth + 1);
        vue.provide(matchedRouteKey, matchedRouteRef);
        vue.provide(routerViewLocationKey, routeToDisplay);
        const viewRef = vue.ref();

        vue.watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
            if (to) {
                to.instances[name] = instance;
                if (from && from !== to && instance && instance === oldInstance) {
                    to.leaveGuards = from.leaveGuards;
                    to.updateGuards = from.updateGuards;
                }
            }
            if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
                (to.enterCallbacks[name] || []).forEach(callback => callback(instance));
            }
        }, { flush: 'post' });

        return () => {
            const route = routeToDisplay.value;
            const matchedRoute = matchedRouteRef.value;
            const ViewComponent = matchedRoute && matchedRoute.components[props.name];

            const currentName = props.name;
            if (!ViewComponent) {
                return normalizeSlot(slots.default, { Component: ViewComponent, route });
            }

            const routePropsOption = matchedRoute.props[props.name];
            const routeProps = routePropsOption
                ? routePropsOption === true
                    ? route.params
                    : typeof routePropsOption === 'function'
                        ? routePropsOption(route)
                        : routePropsOption
                : null;

            const onVnodeUnmounted = vnode => {
                if (vnode.component.isUnmounted) {
                    matchedRoute.instances[currentName] = null;
                }
            };

            const component = vue.h(ViewComponent, assign({}, routeProps, attrs, {
                onVnodeUnmounted,
                ref: viewRef,
            }));

            return normalizeSlot(slots.default, { Component: component, route }) || component;
        };
    },
});

function normalizeSlot(slot, data) {
    if (!slot) return null;
    const slotContent = slot(data);
    return slotContent.length === 1 ? slotContent[0] : slotContent;
}

const RouterView = RouterViewImpl;

function warnDeprecatedUsage() {
    const instance = vue.getCurrentInstance();
    const parentName = instance.parent && instance.parent.type.name;
    if (parentName && (parentName === 'KeepAlive' || parentName.includes('Transition'))) {
        const comp = parentName === 'KeepAlive' ? 'keep-alive' : 'transition';
        warn(`<router-view> can no longer be used directly inside <transition> or <keep-alive>.\n` +
            `Use slot props instead:\n\n` +
            `<router-view v-slot="{ Component }">\n` +
            `  <${comp}>\n` +
            `    <component :is="Component" />\n` +
            `  </${comp}>\n` +
            `</router-view>`);
    }
}

function createRouter(options) {
    const matcher = createRouterMatcher(options.routes, options);
    let parseQuery$1 = options.parseQuery || parseQuery;
    let stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
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
        if (recordMatcher) {
            matcher.removeRoute(recordMatcher);
        } else {
            warn(`Cannot remove non-existent route "${String(name)}"`);
        }
    }

    function getRoutes() {
        return matcher.getRoutes().map(routeMatcher => routeMatcher.record);
    }

    function hasRoute(name) {
        return !!matcher.getRecordMatcher(name);
    }

    function resolve(rawLocation, currentLocation) {
        currentLocation = assign({}, currentLocation || currentRoute.value);
        if (typeof rawLocation === 'string') {
            let locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
            let matchedRoute = matcher.resolve({ path: locationNormalized.path }, currentLocation);
            let href = routerHistory.createHref(locationNormalized.fullPath);
            if (href.startsWith('//')) warn(`Location "${rawLocation}" resolved to "${href}". A resolved location cannot start with multiple slashes.`);
            else if (!matchedRoute.matched.length) {
                warn(`No match found for location with path "${rawLocation}"`);
            }
            return assign(locationNormalized, matchedRoute, {
                params: decodeParams(matchedRoute.params),
                hash: decode(locationNormalized.hash),
                redirectedFrom: undefined, href,
            });
        }
        let matcherLocation;

        if ('path' in rawLocation) {
            if ('params' in rawLocation && !('name' in rawLocation) && Object.keys(rawLocation.params).length) {
                warn(`Path "${rawLocation.path}" was passed with params but they will be ignored. Use a named route alongside params instead.`);
            }
            matcherLocation = assign({}, rawLocation, {
                path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path,
            });
        } else {
            matcherLocation = assign({}, rawLocation, { params: encodeParams(rawLocation.params), });
            currentLocation.params = encodeParams(currentLocation.params);
        }

        let matchedRoute = matcher.resolve(matcherLocation, currentLocation);
        const hash = rawLocation.hash || '';
        if (hash && !hash.startsWith('#')) {
            warn(`A \`hash\` should always start with the character "#". Replace "${hash}" with "#${hash}".`);
        }
        matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
        const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, { hash: encodeHash(hash), path: matchedRoute.path, }));
        let href = routerHistory.createHref(fullPath);
        if (href.startsWith('//')) {
            warn(`Location "${rawLocation}" resolved to "${href}". A resolved location cannot start with multiple slashes.`);
        } else if (!matchedRoute.matched.length) {
            warn(`No match found for location with path "${'path' in rawLocation ? rawLocation.path : rawLocation}"`);
        }
        return assign({
            fullPath,
            hash,
            query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query,
        }, matchedRoute, { redirectedFrom: undefined, href, });
    }

    function locationAsObject(to) {
        return typeof to === 'string' ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
    }

    function checkCanceledNavigation(to, from) {
        if (pendingLocation !== to) {
            return createRouterError(8 /* NAVIGATION_CANCELLED */, { from, to });
        }
    }

    function push(to) {
        return pushWithRedirect(to);
    }

    function replace(to) {
        return push(assign(locationAsObject(to), { replace: true }));
    }

    function handleRedirectRecord(to) {
        const lastMatched = to.matched[to.matched.length - 1];
        if (lastMatched && lastMatched.redirect) {
            const { redirect } = lastMatched;
            let newTargetLocation = typeof redirect === 'function' ? redirect(to) : redirect;
            if (typeof newTargetLocation === 'string') {
                newTargetLocation = newTargetLocation.indexOf('?') > -1 || newTargetLocation.indexOf('#') > -1
                    ? (newTargetLocation = locationAsObject(newTargetLocation))
                    : { path: newTargetLocation };
            }
            if (!('path' in newTargetLocation) && !('name' in newTargetLocation)) {
                warn(`Invalid redirect found:\n${JSON.stringify(newTargetLocation, null, 2)}\n when navigating to "${to.fullPath}". A redirect must contain a name or path. This will break in production.`);
                throw new Error('Invalid redirect');
            }
            return assign({ query: to.query, hash: to.hash, params: to.params, }, newTargetLocation);
        }
    }

    function pushWithRedirect(to, redirectedFrom) {
        const targetLocation = (pendingLocation = resolve(to));
        const from = currentRoute.value;
        const data = to.state;
        const force = to.force;
        const replace = to.replace === true;

        const shouldRedirect = handleRedirectRecord(targetLocation);
        if (shouldRedirect) return pushWithRedirect(assign(locationAsObject(shouldRedirect), { state: data, force, replace, }), redirectedFrom || targetLocation);

        const toLocation = targetLocation;
        toLocation.redirectedFrom = redirectedFrom;
        let failure;
        if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
            failure = createRouterError(16 /* NAVIGATION_DUPLICATED */, { to: toLocation, from });
            handleScroll(from, from, true, false);
        }

        return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
            .catch((error) => isNavigationFailure(error)
            ? error
            : triggerError(error))
            .then((failure) => {
            if (failure) {
                if (isNavigationFailure(failure, 2 /* NAVIGATION_GUARD_REDIRECT */)) {
                    if (isSameRouteLocation(stringifyQuery$1, resolve(failure.to), toLocation) && redirectedFrom && (redirectedFrom._count = redirectedFrom._count ? redirectedFrom._count + 1 : 1) > 10) {
                        warn(`Detected an infinite redirection in a navigation guard when going from "${from.fullPath}" to "${toLocation.fullPath}". Aborting to avoid a Stack Overflow.`);
                        return Promise.reject(new Error('Infinite redirect in navigation guard'));
                    }
                    return pushWithRedirect(assign(locationAsObject(failure.to), { state: data, force, replace, }), redirectedFrom || toLocation);
                }
            } else {
                failure = finalizeNavigation(toLocation, from, true, replace, data);
            }
            triggerAfterEach(toLocation, from, failure);
            return failure;
        });
    }

    function checkCanceledNavigationAndReject(to, from) {
        const error = checkCanceledNavigation(to, from);
        return error ? Promise.reject(error) : Promise.resolve();
    }

    function navigate(to, from) {
        let guards;
        const [leavingRecords, updatingRecords, enteringRecords,] = extractChangingRecords(to, from);

        guards = extractComponentsGuards(leavingRecords.reverse(), 'beforeRouteLeave', to, from);

        for (const record of leavingRecords) {
            record.leaveGuards.forEach(guard => {
                guards.push(guardToPromiseFn(guard, to, from));
            });
        }
        const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
        guards.push(canceledNavigationCheck);

        return (runGuardQueue(guards)
            .then(() => {
            guards = [];
            for (const guard of beforeGuards.list()) {
                guards.push(guardToPromiseFn(guard, to, from));
            }
            guards.push(canceledNavigationCheck);
            return runGuardQueue(guards);
        })
            .then(() => {
            guards = extractComponentsGuards(updatingRecords, 'beforeRouteUpdate', to, from);
            for (const record of updatingRecords) {
                record.updateGuards.forEach(guard => {
                    guards.push(guardToPromiseFn(guard, to, from));
                });
            }
            guards.push(canceledNavigationCheck);
            return runGuardQueue(guards);
        })
            .then(() => {
            guards = [];
            for (const record of to.matched) {
                if (record.beforeEnter && from.matched.indexOf(record) < 0) {
                    if (Array.isArray(record.beforeEnter)) {
                        for (const beforeEnter of record.beforeEnter) guards.push(guardToPromiseFn(beforeEnter, to, from));
                    } else {
                        guards.push(guardToPromiseFn(record.beforeEnter, to, from));
                    }
                }
            }
            guards.push(canceledNavigationCheck);
            return runGuardQueue(guards);
        })
            .then(() => {
            to.matched.forEach(record => (record.enterCallbacks = {}));
            guards = extractComponentsGuards(enteringRecords, 'beforeRouteEnter', to, from);
            guards.push(canceledNavigationCheck);
            return runGuardQueue(guards);
        })
            .then(() => {
            guards = [];
            for (const guard of beforeResolveGuards.list()) {
                guards.push(guardToPromiseFn(guard, to, from));
            }
            guards.push(canceledNavigationCheck);
            return runGuardQueue(guards);
        })
            .catch(err => isNavigationFailure(err, 8 /* NAVIGATION_CANCELLED */)
            ? err
            : Promise.reject(err)));
    }

    function triggerAfterEach(to, from, failure) {
        for (const guard of afterGuards.list()) guard(to, from, failure);
    }

    function finalizeNavigation(toLocation, from, isPush, replace, data) {
        const error = checkCanceledNavigation(toLocation, from);
        if (error) return error;

        const isFirstNavigation = from === START_LOCATION_NORMALIZED;
        const state = !isBrowser ? {} : history.state;

        if (isPush) {
            if (replace || isFirstNavigation) routerHistory.replace(toLocation.fullPath, assign({ scroll: isFirstNavigation && state && state.scroll, }, data));
            else routerHistory.push(toLocation.fullPath, data);
        }

        currentRoute.value = toLocation;
        handleScroll(toLocation, from, isPush, isFirstNavigation);
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
            if (isBrowser) {
                saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
            }
            navigate(toLocation, from)
                .catch((error) => {
                if (isNavigationFailure(error, 4 /* NAVIGATION_ABORTED */ | 8 /* NAVIGATION_CANCELLED */)) return error;
                if (isNavigationFailure(error, 2 /* NAVIGATION_GUARD_REDIRECT */)) {
                    pushWithRedirect(error.to, toLocation).catch(noop);
                    return Promise.reject();
                }
                if (info.delta) routerHistory.go(-info.delta, false);
                return triggerError(error);
            })
                .then((failure) => {
                failure =
                    failure ||
                        finalizeNavigation(toLocation, from, false);
                if (failure && info.delta) routerHistory.go(-info.delta, false);
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
        readyHandlers.list().forEach(([resolve, reject]) => (err ? reject(err) : resolve()));
        readyHandlers.reset();
    }

    function handleScroll(to, from, isPush, isFirstNavigation) {
        const { scrollBehavior } = options;
        if (!isBrowser || !scrollBehavior) return Promise.resolve();
        let scrollPosition = (!isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0))) ||
            ((isFirstNavigation || !isPush) && history.state && history.state.scroll) ||
            null;
        return vue.nextTick()
            .then(() => scrollBehavior(to, from, scrollPosition))
            .then(position => position && scrollToPosition(position))
            .catch(triggerError);
    }

    const go = (delta) => routerHistory.go(delta);
    let started;
    const installedApps = new Set();
    const router = {
        currentRoute,
        addRoute,
        removeRoute,
        hasRoute,
        getRoutes,
        resolve,
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
            Object.defineProperty(app.config.globalProperties, '$route', { get: () => vue.unref(currentRoute), });
            if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
                started = true;
                push(routerHistory.location).catch(err => {
                    warn('Unexpected error when starting the router:', err);
                });
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

function extractChangingRecords(to, from) {
    const leavingRecords = [];
    const updatingRecords = [];
    const enteringRecords = [];
    const len = Math.max(from.matched.length, to.matched.length);
    for (let i = 0; i < len; i++) {
        const recordFrom = from.matched[i];
        if (recordFrom) {
            if (to.matched.indexOf(recordFrom) < 0) leavingRecords.push(recordFrom);
            else updatingRecords.push(recordFrom);
        }
        const recordTo = to.matched[i];
        if (recordTo) {
            if (from.matched.indexOf(recordTo) < 0) enteringRecords.push(recordTo);
        }
    }
    return [leavingRecords, updatingRecords, enteringRecords];
}

function useRouter() {
    return vue.inject(routerKey);
}

function useRoute() {
    return vue.inject(routeLocationKey);
}

exports.RouterLink = RouterLink;
exports.RouterView = RouterView;
exports.START_LOCATION = START_LOCATION_NORMALIZED;
exports.createMemoryHistory = createMemoryHistory;
exports.createRouter = createRouter;
exports.createRouterMatcher = createRouterMatcher;
exports.createWebHashHistory = createWebHashHistory;
exports.createWebHistory = createWebHistory;
exports.isNavigationFailure = isNavigationFailure;
exports.matchedRouteKey = matchedRouteKey;
exports.onBeforeRouteLeave = onBeforeRouteLeave;
exports.onBeforeRouteUpdate = onBeforeRouteUpdate;
exports.parseQuery = parseQuery;
exports.routeLocationKey = routeLocationKey;
exports.routerKey = routerKey;
exports.routerViewLocationKey = routerViewLocationKey;
exports.stringifyQuery = stringifyQuery;
exports.useLink = useLink;
exports.useRoute = useRoute;
exports.useRouter = useRouter;
exports.viewDepthKey = viewDepthKey;
