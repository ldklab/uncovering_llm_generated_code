"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "renderToHTMLOrFlight", {
    enumerable: true,
    get: function() {
        return renderToHTMLOrFlight;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_default(require("react"));
const _renderresult = /*#__PURE__*/ _interop_require_default(require("../render-result"));
const _nodewebstreamshelper = require("../stream-utils/node-web-streams-helper");
const _matchsegments = require("../../client/components/match-segments");
const _internalutils = require("../internal-utils");
const _approuterheaders = require("../../client/components/app-router-headers");
const _metadata = require("../../lib/metadata/metadata");
const _requestasyncstoragewrapper = require("../async-storage/request-async-storage-wrapper");
const _staticgenerationasyncstoragewrapper = require("../async-storage/static-generation-async-storage-wrapper");
const _notfound = require("../../client/components/not-found");
const _redirect = require("../../client/components/redirect");
const _patchfetch = require("../lib/patch-fetch");
const _constants = require("../lib/trace/constants");
const _tracer = require("../lib/trace/tracer");
const _flightrenderresult = require("./flight-render-result");
const _createerrorhandler = require("./create-error-handler");
const _getshortdynamicparamtype = require("./get-short-dynamic-param-type");
const _getsegmentparam = require("./get-segment-param");
const _getscriptnoncefromheader = require("./get-script-nonce-from-header");
const _parseandvalidateflightrouterstate = require("./parse-and-validate-flight-router-state");
const _validateurl = require("./validate-url");
const _createflightrouterstatefromloadertree = require("./create-flight-router-state-from-loader-tree");
const _actionhandler = require("./action-handler");
const _bailouttocsr = require("../../shared/lib/lazy-dynamic/bailout-to-csr");
const _log = require("../../build/output/log");
const _requestcookies = require("../web/spec-extension/adapters/request-cookies");
const _serverinsertedhtml = require("./server-inserted-html");
const _requiredscripts = require("./required-scripts");
const _addpathprefix = require("../../shared/lib/router/utils/add-path-prefix");
const _makegetserverinsertedhtml = require("./make-get-server-inserted-html");
const _walktreewithflightrouterstate = require("./walk-tree-with-flight-router-state");
const _createcomponenttree = require("./create-component-tree");
const _getassetquerystring = require("./get-asset-query-string");
const _encryptionutils = require("./encryption-utils");
const _staticrenderer = require("./static/static-renderer");
const _hooksservercontext = require("../../client/components/hooks-server-context");
const _useflightresponse = require("./use-flight-response");
const _staticgenerationbailout = require("../../client/components/static-generation-bailout");
const _interceptionroutes = require("../future/helpers/interception-routes");
const _formatservererror = require("../../lib/format-server-error");
const _dynamicrendering = require("./dynamic-rendering");
const _clientcomponentrendererlogger = require("../client-component-renderer-logger");
const _actionutils = require("./action-utils");
const _routeregex = require("../../shared/lib/router/utils/route-regex");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function createNotFoundLoaderTree(loaderTree) {
    // Align the segment with parallel-route-default in next-app-loader
    return [
        "",
        {},
        loaderTree[2]
    ];
}
/* This method is important for intercepted routes to function:
 * when a route is intercepted, e.g. /blog/[slug], it will be rendered
 * with the layout of the previous page, e.g. /profile/[id]. The problem is
 * that the loader tree needs to know the dynamic param in order to render (id and slug in the example).
 * Normally they are read from the path but since we are intercepting the route, the path would not contain id,
 * so we need to read it from the router state.
 */ function findDynamicParamFromRouterState(flightRouterState, segment) {
    if (!flightRouterState) {
        return null;
    }
    const treeSegment = flightRouterState[0];
    if ((0, _matchsegments.canSegmentBeOverridden)(segment, treeSegment)) {
        if (!Array.isArray(treeSegment) || Array.isArray(segment)) {
            return null;
        }
        return {
            param: treeSegment[0],
            value: treeSegment[1],
            treeSegment: treeSegment,
            type: treeSegment[2]
        };
    }
    for (const parallelRouterState of Object.values(flightRouterState[1])){
        const maybeDynamicParam = findDynamicParamFromRouterState(parallelRouterState, segment);
        if (maybeDynamicParam) {
            return maybeDynamicParam;
        }
    }
    return null;
}
/**
 * Returns a function that parses the dynamic segment and return the associated value.
 */ function makeGetDynamicParamFromSegment(params, pagePath, flightRouterState) {
    return function getDynamicParamFromSegment(// [slug] / [[slug]] / [...slug]
    segment) {
        const segmentParam = (0, _getsegmentparam.getSegmentParam)(segment);
        if (!segmentParam) {
            return null;
        }
        const key = segmentParam.param;
        let value = params[key];
        // this is a special marker that will be present for interception routes
        if (value === "__NEXT_EMPTY_PARAM__") {
            value = undefined;
        }
        if (Array.isArray(value)) {
            value = value.map((i)=>encodeURIComponent(i));
        } else if (typeof value === "string") {
            value = encodeURIComponent(value);
        }
        if (!value) {
            const isCatchall = segmentParam.type === "catchall";
            const isOptionalCatchall = segmentParam.type === "optional-catchall";
            if (isCatchall || isOptionalCatchall) {
                const dynamicParamType = _getshortdynamicparamtype.dynamicParamTypes[segmentParam.type];
                // handle the case where an optional catchall does not have a value,
                // e.g. `/dashboard/[[...slug]]` when requesting `/dashboard`
                if (isOptionalCatchall) {
                    return {
                        param: key,
                        value: null,
                        type: dynamicParamType,
                        treeSegment: [
                            key,
                            "",
                            dynamicParamType
                        ]
                    };
                }
                // handle the case where a catchall or optional catchall does not have a value,
                // e.g. `/foo/bar/hello` and `@slot/[...catchall]` or `@slot/[[...catchall]]` is matched
                value = pagePath.split("/")// remove the first empty string
                .slice(1)// replace any dynamic params with the actual values
                .map((pathSegment)=>{
                    const param = (0, _routeregex.parseParameter)(pathSegment);
                    // if the segment matches a param, return the param value
                    // otherwise, it's a static segment, so just return that
                    return params[param.key] ?? param.key;
                });
                return {
                    param: key,
                    value,
                    type: dynamicParamType,
                    // This value always has to be a string.
                    treeSegment: [
                        key,
                        value.join("/"),
                        dynamicParamType
                    ]
                };
            }
            return findDynamicParamFromRouterState(flightRouterState, segment);
        }
        const type = (0, _getshortdynamicparamtype.getShortDynamicParamType)(segmentParam.type);
        return {
            param: key,
            // The value that is passed to user code.
            value: value,
            // The value that is rendered in the router tree.
            treeSegment: [
                key,
                Array.isArray(value) ? value.join("/") : value,
                type
            ],
            type: type
        };
    };
}
function NonIndex({ ctx }) {
    const is404Page = ctx.pagePath === "/404";
    const isInvalidStatusCode = typeof ctx.res.statusCode === "number" && ctx.res.statusCode > 400;
    if (is404Page || isInvalidStatusCode) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
            name: "robots",
            content: "noindex"
        });
    }
    return null;
}
// Handle Flight render request. This is only used when client-side navigating. E.g. when you `router.push('/dashboard')` or `router.reload()`.
async function generateFlight(ctx, options) {
    // Flight data that is going to be passed to the browser.
    // Currently a single item array but in the future multiple patches might be combined in a single request.
    let flightData = null;
    const { componentMod: { tree: loaderTree, renderToReadableStream, createDynamicallyTrackedSearchParams }, getDynamicParamFromSegment, appUsingSizeAdjustment, staticGenerationStore: { urlPathname }, query, requestId, flightRouterState } = ctx;
    if (!(options == null ? void 0 : options.skipFlight)) {
        const [MetadataTree, MetadataOutlet] = (0, _metadata.createMetadataComponents)({
            tree: loaderTree,
            query,
            metadataContext: (0, _metadata.createMetadataContext)(urlPathname, ctx.renderOpts),
            getDynamicParamFromSegment,
            appUsingSizeAdjustment,
            createDynamicallyTrackedSearchParams
        });
        flightData = (await (0, _walktreewithflightrouterstate.walkTreeWithFlightRouterState)({
            ctx,
            createSegmentPath: (child)=>child,
            loaderTreeToFilter: loaderTree,
            parentParams: {},
            flightRouterState,
            isFirst: true,
            // For flight, render metadata inside leaf page
            // NOTE: in 14.2, fragment doesn't work well with React, using array instead
            rscPayloadHead: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)(MetadataTree, {}, requestId),
                /*#__PURE__*/ (0, _jsxruntime.jsx)(NonIndex, {
                    ctx: ctx
                }, "noindex")
            ],
            injectedCSS: new Set(),
            injectedJS: new Set(),
            injectedFontPreloadTags: new Set(),
            rootLayoutIncluded: false,
            asNotFound: ctx.isNotFoundPath || (options == null ? void 0 : options.asNotFound),
            metadataOutlet: /*#__PURE__*/ (0, _jsxruntime.jsx)(MetadataOutlet, {})
        })).map((path)=>path.slice(1)) // remove the '' (root) segment
        ;
    }
    const buildIdFlightDataPair = [
        ctx.renderOpts.buildId,
        flightData
    ];
    // For app dir, use the bundled version of Flight server renderer (renderToReadableStream)
    // which contains the subset React.
    const flightReadableStream = renderToReadableStream(options ? [
        options.actionResult,
        buildIdFlightDataPair
    ] : buildIdFlightDataPair, ctx.clientReferenceManifest.clientModules, {
        onError: ctx.flightDataRendererErrorHandler
    });
    const resultOptions = {
        metadata: {}
    };
    if (ctx.staticGenerationStore.pendingRevalidates || ctx.staticGenerationStore.revalidatedTags) {
        var _ctx_staticGenerationStore_incrementalCache;
        resultOptions.waitUntil = Promise.all([
            (_ctx_staticGenerationStore_incrementalCache = ctx.staticGenerationStore.incrementalCache) == null ? void 0 : _ctx_staticGenerationStore_incrementalCache.revalidateTag(ctx.staticGenerationStore.revalidatedTags || []),
            ...Object.values(ctx.staticGenerationStore.pendingRevalidates || {})
        ]);
    }
    return new _flightrenderresult.FlightRenderResult(flightReadableStream, resultOptions);
}
/**
 * Creates a resolver that eagerly generates a flight payload that is then
 * resolved when the resolver is called.
 */ function createFlightDataResolver(ctx) {
    // Generate the flight data and as soon as it can, convert it into a string.
    const promise = generateFlight(ctx).then(async (result)=>({
            flightData: await result.toUnchunkedString(true)
        }))// Otherwise if it errored, return the error.
    .catch((err)=>({
            err
        }));
    return async ()=>{
        // Resolve the promise to get the flight data or error.
        const result = await promise;
        // If the flight data failed to render due to an error, re-throw the error
        // here.
        if ("err" in result) {
            throw result.err;
        }
        // Otherwise, return the flight data.
        return result.flightData;
    };
}
/**
 * Crawlers will inadvertently think the canonicalUrl in the RSC payload should be crawled
 * when our intention is to just seed the router state with the current URL.
 * This function splits up the pathname so that we can later join it on
 * when we're ready to consume the path.
 */ function prepareInitialCanonicalUrl(pathname) {
    return pathname.split("/");
}
// This is the root component that runs in the RSC context
async function ReactServerApp({ tree, ctx, asNotFound }) {
    // Create full component tree from root to leaf.
    const injectedCSS = new Set();
    const injectedJS = new Set();
    const injectedFontPreloadTags = new Set();
    const missingSlots = new Set();
    const { getDynamicParamFromSegment, query, appUsingSizeAdjustment, componentMod: { AppRouter, GlobalError, createDynamicallyTrackedSearchParams }, staticGenerationStore: { urlPathname } } = ctx;
    const initialTree = (0, _createflightrouterstatefromloadertree.createFlightRouterStateFromLoaderTree)(tree, getDynamicParamFromSegment, query);
    const [MetadataTree, MetadataOutlet] = (0, _metadata.createMetadataComponents)({
        tree,
        errorType: asNotFound ? "not-found" : undefined,
        query,
        metadataContext: (0, _metadata.createMetadataContext)(urlPathname, ctx.renderOpts),
        getDynamicParamFromSegment: getDynamicParamFromSegment,
        appUsingSizeAdjustment: appUsingSizeAdjustment,
        createDynamicallyTrackedSearchParams
    });
    const seedData = await (0, _createcomponenttree.createComponentTree)({
        ctx,
        createSegmentPath: (child)=>child,
        loaderTree: tree,
        parentParams: {},
        firstItem: true,
        injectedCSS,
        injectedJS,
        injectedFontPreloadTags,
        rootLayoutIncluded: false,
        asNotFound: asNotFound,
        metadataOutlet: /*#__PURE__*/ (0, _jsxruntime.jsx)(MetadataOutlet, {}),
        missingSlots
    });
    // When the `vary` response header is present with `Next-URL`, that means there's a chance
    // it could respond differently if there's an interception route. We provide this information
    // to `AppRouter` so that it can properly seed the prefetch cache with a prefix, if needed.
    const varyHeader = ctx.res.getHeader("vary");
    const couldBeIntercepted = typeof varyHeader === "string" && varyHeader.includes(_approuterheaders.NEXT_URL);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(AppRouter, {
        buildId: ctx.renderOpts.buildId,
        assetPrefix: ctx.assetPrefix,
        urlParts: prepareInitialCanonicalUrl(urlPathname),
        // This is the router state tree.
        initialTree: initialTree,
        // This is the tree of React nodes that are seeded into the cache
        initialSeedData: seedData,
        couldBeIntercepted: couldBeIntercepted,
        initialHead: /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)(NonIndex, {
                    ctx: ctx
                }),
                /*#__PURE__*/ (0, _jsxruntime.jsx)(MetadataTree, {}, ctx.requestId)
            ]
        }),
        globalErrorComponent: GlobalError,
        // This is used to provide debug information (when in development mode)
        // about which slots were not filled by page components while creating the component tree.
        missingSlots: missingSlots
    });
}
// This is the root component that runs in the RSC context
async function ReactServerError({ tree, ctx, errorType }) {
    const { getDynamicParamFromSegment, query, appUsingSizeAdjustment, componentMod: { AppRouter, GlobalError, createDynamicallyTrackedSearchParams }, staticGenerationStore: { urlPathname }, requestId } = ctx;
    const [MetadataTree] = (0, _metadata.createMetadataComponents)({
        tree,
        metadataContext: (0, _metadata.createMetadataContext)(urlPathname, ctx.renderOpts),
        errorType,
        query,
        getDynamicParamFromSegment,
        appUsingSizeAdjustment,
        createDynamicallyTrackedSearchParams
    });
    const head = /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(MetadataTree, {}, requestId),
            process.env.NODE_ENV === "development" && /*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
                name: "next-error",
                content: "not-found"
            }),
            /*#__PURE__*/ (0, _jsxruntime.jsx)(NonIndex, {
                ctx: ctx
            })
        ]
    });
    const initialTree = (0, _createflightrouterstatefromloadertree.createFlightRouterStateFromLoaderTree)(tree, getDynamicParamFromSegment, query);
    // For metadata notFound error there's no global not found boundary on top
    // so we create a not found page with AppRouter
    const initialSeedData = [
        initialTree[0],
        {},
        /*#__PURE__*/ (0, _jsxruntime.jsxs)("html", {
            id: "__next_error__",
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)("head", {}),
                /*#__PURE__*/ (0, _jsxruntime.jsx)("body", {})
            ]
        }),
        null
    ];
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(AppRouter, {
        buildId: ctx.renderOpts.buildId,
        assetPrefix: ctx.assetPrefix,
        urlParts: prepareInitialCanonicalUrl(urlPathname),
        initialTree: initialTree,
        initialHead: head,
        globalErrorComponent: GlobalError,
        initialSeedData: initialSeedData,
        missingSlots: new Set()
    });
}
// This component must run in an SSR context. It will render the RSC root component
function ReactServerEntrypoint({ reactServerStream, preinitScripts, clientReferenceManifest, nonce }) {
    preinitScripts();
    const response = (0, _useflightresponse.useFlightStream)(reactServerStream, clientReferenceManifest, nonce);
    return _react.default.use(response);
}
async function renderToHTMLOrFlightImpl(req, res, pagePath, query, renderOpts, baseCtx, requestEndedState) {
    var _getTracer_getRootSpanAttributes, _staticGenerationStore_prerenderState;
    const isNotFoundPath = pagePath === "/404";
    // A unique request timestamp used by development to ensure that it's
    // consistent and won't change during this request. This is important to
    // avoid that resources can be deduped by React Float if the same resource is
    // rendered or preloaded multiple times: `<link href="a.css?v={Date.now()}"/>`.
    const requestTimestamp = Date.now();
    const { buildManifest, subresourceIntegrityManifest, serverActionsManifest, ComponentMod, dev, nextFontManifest, supportsDynamicResponse, serverActions, appDirDevErrorLogger, assetPrefix = "", enableTainting } = renderOpts;
    // We need to expose the bundled `require` API globally for
    // react-server-dom-webpack. This is a hack until we find a better way.
    if (ComponentMod.__next_app__) {
        const instrumented = (0, _clientcomponentrendererlogger.wrapClientComponentLoader)(ComponentMod);
        // @ts-ignore
        globalThis.__next_require__ = instrumented.require;
        // @ts-ignore
        globalThis.__next_chunk_load__ = instrumented.loadChunk;
    }
    if (typeof req.on === "function") {
        req.on("end", ()=>{
            requestEndedState.ended = true;
            if ("performance" in globalThis) {
                const metrics = (0, _clientcomponentrendererlogger.getClientComponentLoaderMetrics)({
                    reset: true
                });
                if (metrics) {
                    (0, _tracer.getTracer)().startSpan(_constants.NextNodeServerSpan.clientComponentLoading, {
                        startTime: metrics.clientComponentLoadStart,
                        attributes: {
                            "next.clientComponentLoadCount": metrics.clientComponentLoadCount
                        }
                    }).end(metrics.clientComponentLoadStart + metrics.clientComponentLoadTimes);
                }
            }
        });
    }
    const metadata = {};
    const appUsingSizeAdjustment = !!(nextFontManifest == null ? void 0 : nextFontManifest.appUsingSizeAdjust);
    // TODO: fix this typescript
    const clientReferenceManifest = renderOpts.clientReferenceManifest;
    const serverModuleMap = (0, _actionutils.createServerModuleMap)({
        serverActionsManifest,
        pageName: renderOpts.page
    });
    (0, _encryptionutils.setReferenceManifestsSingleton)({
        clientReferenceManifest,
        serverActionsManifest,
        serverModuleMap
    });
    const digestErrorsMap = new Map();
    const allCapturedErrors = [];
    const isNextExport = !!renderOpts.nextExport;
    const { staticGenerationStore, requestStore } = baseCtx;
    const { isStaticGeneration } = staticGenerationStore;
    // when static generation fails during PPR, we log the errors separately. We intentionally
    // silence the error logger in this case to avoid double logging.
    const silenceStaticGenerationErrors = renderOpts.experimental.ppr && isStaticGeneration;
    const serverComponentsErrorHandler = (0, _createerrorhandler.createErrorHandler)({
        source: _createerrorhandler.ErrorHandlerSource.serverComponents,
        dev,
        isNextExport,
        errorLogger: appDirDevErrorLogger,
        digestErrorsMap,
        silenceLogger: silenceStaticGenerationErrors
    });
    const flightDataRendererErrorHandler = (0, _createerrorhandler.createErrorHandler)({
        source: _createerrorhandler.ErrorHandlerSource.flightData,
        dev,
        isNextExport,
        errorLogger: appDirDevErrorLogger,
        digestErrorsMap,
        silenceLogger: silenceStaticGenerationErrors
    });
    const htmlRendererErrorHandler = (0, _createerrorhandler.createErrorHandler)({
        source: _createerrorhandler.ErrorHandlerSource.html,
        dev,
        isNextExport,
        errorLogger: appDirDevErrorLogger,
        digestErrorsMap,
        allCapturedErrors,
        silenceLogger: silenceStaticGenerationErrors
    });
    ComponentMod.patchFetch();
    /**
   * Rules of Static & Dynamic HTML:
   *
   *    1.) We must generate static HTML unless the caller explicitly opts
   *        in to dynamic HTML support.
   *
   *    2.) If dynamic HTML support is requested, we must honor that request
   *        or throw an error. It is the sole responsibility of the caller to
   *        ensure they aren't e.g. requesting dynamic HTML for an AMP page.
   *
   * These rules help ensure that other existing features like request caching,
   * coalescing, and ISR continue working as intended.
   */ const generateStaticHTML = supportsDynamicResponse !== true;
    // Pull out the hooks/references from the component.
    const { tree: loaderTree, taintObjectReference } = ComponentMod;
    if (enableTainting) {
        taintObjectReference("Do not pass process.env to client components since it will leak sensitive data", process.env);
    }
    staticGenerationStore.fetchMetrics = [];
    metadata.fetchMetrics = staticGenerationStore.fetchMetrics;
    // don't modify original query object
    query = {
        ...query
    };
    (0, _internalutils.stripInternalQueries)(query);
    const isRSCRequest = req.headers[_approuterheaders.RSC_HEADER.toLowerCase()] !== undefined;
    const isPrefetchRSCRequest = isRSCRequest && req.headers[_approuterheaders.NEXT_ROUTER_PREFETCH_HEADER.toLowerCase()] !== undefined;
    /**
   * Router state provided from the client-side router. Used to handle rendering
   * from the common layout down. This value will be undefined if the request
   * is not a client-side navigation request or if the request is a prefetch
   * request (except when it's a prefetch request for an interception route
   * which is always dynamic).
   */ const shouldProvideFlightRouterState = isRSCRequest && (!isPrefetchRSCRequest || !renderOpts.experimental.ppr || // Interception routes currently depend on the flight router state to
    // extract dynamic params.
    (0, _interceptionroutes.isInterceptionRouteAppPath)(pagePath));
    const parsedFlightRouterState = (0, _parseandvalidateflightrouterstate.parseAndValidateFlightRouterState)(req.headers[_approuterheaders.NEXT_ROUTER_STATE_TREE.toLowerCase()]);
    /**
   * The metadata items array created in next-app-loader with all relevant information
   * that we need to resolve the final metadata.
   */ let requestId;
    if (process.env.NEXT_RUNTIME === "edge") {
        requestId = crypto.randomUUID();
    } else {
        requestId = require("next/dist/compiled/nanoid").nanoid();
    }
    /**
   * Dynamic parameters. E.g. when you visit `/dashboard/vercel` which is rendered by `/dashboard/[slug]` the value will be {"slug": "vercel"}.
   */ const params = renderOpts.params ?? {};
    const getDynamicParamFromSegment = makeGetDynamicParamFromSegment(params, pagePath, // `FlightRouterState` is unconditionally provided here because this method uses it
    // to extract dynamic params as a fallback if they're not present in the path.
    parsedFlightRouterState);
    const ctx = {
        ...baseCtx,
        getDynamicParamFromSegment,
        query,
        isPrefetch: isPrefetchRSCRequest,
        requestTimestamp,
        appUsingSizeAdjustment,
        flightRouterState: shouldProvideFlightRouterState ? parsedFlightRouterState : undefined,
        requestId,
        defaultRevalidate: false,
        pagePath,
        clientReferenceManifest,
        assetPrefix,
        flightDataRendererErrorHandler,
        serverComponentsErrorHandler,
        isNotFoundPath,
        res
    };
    if (isRSCRequest && !isStaticGeneration) {
        return generateFlight(ctx);
    }
    // Create the resolver that can get the flight payload when it's ready or
    // throw the error if it occurred. If we are not generating static HTML, we
    // don't need to generate the flight payload because it's a dynamic request
    // which means we're either getting the flight payload only or just the
    // regular HTML.
    const flightDataResolver = isStaticGeneration ? createFlightDataResolver(ctx) : null;
    // Get the nonce from the incoming request if it has one.
    const csp = req.headers["content-security-policy"] || req.headers["content-security-policy-report-only"];
    let nonce;
    if (csp && typeof csp === "string") {
        nonce = (0, _getscriptnoncefromheader.getScriptNonceFromHeader)(csp);
    }
    const validateRootLayout = dev;
    const { HeadManagerContext } = require("../../shared/lib/head-manager-context.shared-runtime");
    // On each render, create a new `ServerInsertedHTML` context to capture
    // injected nodes from user code (`useServerInsertedHTML`).
    const { ServerInsertedHTMLProvider, renderServerInsertedHTML } = (0, _serverinsertedhtml.createServerInsertedHTML)();
    (_getTracer_getRootSpanAttributes = (0, _tracer.getTracer)().getRootSpanAttributes()) == null ? void 0 : _getTracer_getRootSpanAttributes.set("next.route", pagePath);
    const renderToStream = (0, _tracer.getTracer)().wrap(_constants.AppRenderSpan.getBodyResult, {
        spanName: `render route (app) ${pagePath}`,
        attributes: {
            "next.route": pagePath
        }
    }, async ({ asNotFound, tree, formState })=>{
        const polyfills = buildManifest.polyfillFiles.filter((polyfill)=>polyfill.endsWith(".js") && !polyfill.endsWith(".module.js")).map((polyfill)=>({
                src: `${assetPrefix}/_next/${polyfill}${(0, _getassetquerystring.getAssetQueryString)(ctx, false)}`,
                integrity: subresourceIntegrityManifest == null ? void 0 : subresourceIntegrityManifest[polyfill],
                crossOrigin: renderOpts.crossOrigin,
                noModule: true,
                nonce
            }));
        const [preinitScripts, bootstrapScript] = (0, _requiredscripts.getRequiredScripts)(buildManifest, assetPrefix, renderOpts.crossOrigin, subresourceIntegrityManifest, (0, _getassetquerystring.getAssetQueryString)(ctx, true), nonce);
        // We kick off the Flight Request (render) here. It is ok to initiate the render in an arbitrary
        // place however it is critical that we only construct the Flight Response inside the SSR
        // render so that directives like preloads are correctly piped through
        const serverStream = ComponentMod.renderToReadableStream(/*#__PURE__*/ (0, _jsxruntime.jsx)(ReactServerApp, {
            tree: tree,
            ctx: ctx,
            asNotFound: asNotFound
        }), clientReferenceManifest.clientModules, {
            onError: serverComponentsErrorHandler
        });
        // We are going to consume this render both for SSR and for inlining the flight data
        let [renderStream, dataStream] = serverStream.tee();
        const children = /*#__PURE__*/ (0, _jsxruntime.jsx)(HeadManagerContext.Provider, {
            value: {
                appDir: true,
                nonce
            },
            children: /*#__PURE__*/ (0, _jsxruntime.jsx)(ServerInsertedHTMLProvider, {
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(ReactServerEntrypoint, {
                    reactServerStream: renderStream,
                    preinitScripts: preinitScripts,
                    clientReferenceManifest: clientReferenceManifest,
                    nonce: nonce
                })
            })
        });
        const isResume = !!renderOpts.postponed;
        const onHeaders = staticGenerationStore.prerenderState ? (headers)=>{
            headers.forEach((value, key)=>{
                metadata.headers ??= {};
                metadata.headers[key] = value;
            });
        } : isStaticGeneration || isResume ? // ask React to emit headers. For Resume this is just not supported
        // For static generation we know there will be an entire HTML document
        // output and so moving from tag to header for preloading can only
        // server to alter preloading priorities in unwanted ways
        undefined : // early headers to the response
        (headers)=>{
            headers.forEach((value, key)=>{
                res.appendHeader(key, value);
            });
        };
        const getServerInsertedHTML = (0, _makegetserverinsertedhtml.makeGetServerInsertedHTML)({
            polyfills,
            renderServerInsertedHTML,
            serverCapturedErrors: allCapturedErrors,
            basePath: renderOpts.basePath
        });
        const renderer = (0, _staticrenderer.createStaticRenderer)({
            ppr: renderOpts.experimental.ppr,
            isStaticGeneration,
            // If provided, the postpone state should be parsed as JSON so it can be
            // provided to React.
            postponed: typeof renderOpts.postponed === "string" ? JSON.parse(renderOpts.postponed) : null,
            streamOptions: {
                onError: htmlRendererErrorHandler,
                onHeaders,
                maxHeadersLength: 600,
                nonce,
                bootstrapScripts: [
                    bootstrapScript
                ],
                formState
            }
        });
        try {
            let { stream, postponed, resumed } = await renderer.render(children);
            const prerenderState = staticGenerationStore.prerenderState;
            if (prerenderState) {
                /**
           * When prerendering there are three outcomes to consider
           *
           *   Dynamic HTML:      The prerender has dynamic holes (caused by using Next.js Dynamic Rendering APIs)
           *                      We will need to resume this result when requests are handled and we don't include
           *                      any server inserted HTML or inlined flight data in the static HTML
           *
           *   Dynamic Data:      The prerender has no dynamic holes but dynamic APIs were used. We will not
           *                      resume this render when requests are handled but we will generate new inlined
           *                      flight data since it is dynamic and differences may end up reconciling on the client
           *
           *   Static:            The prerender has no dynamic holes and no dynamic APIs were used. We statically encode
           *                      all server inserted HTML and flight data
           */ // First we check if we have any dynamic holes in our HTML prerender
                if ((0, _dynamicrendering.usedDynamicAPIs)(prerenderState)) {
                    if (postponed != null) {
                        // This is the Dynamic HTML case.
                        metadata.postponed = JSON.stringify((0, _staticrenderer.getDynamicHTMLPostponedState)(postponed));
                    } else {
                        // This is the Dynamic Data case
                        metadata.postponed = JSON.stringify((0, _staticrenderer.getDynamicDataPostponedState)());
                    }
                    // Regardless of whether this is the Dynamic HTML or Dynamic Data case we need to ensure we include
                    // server inserted html in the static response because the html that is part of the prerender may depend on it
                    // It is possible in the set of stream transforms for Dynamic HTML vs Dynamic Data may differ but currently both states
                    // require the same set so we unify the code path here
                    return {
                        stream: await (0, _nodewebstreamshelper.continueDynamicPrerender)(stream, {
                            getServerInsertedHTML
                        })
                    };
                } else {
                    // We may still be rendering the RSC stream even though the HTML is finished.
                    // We wait for the RSC stream to complete and check again if dynamic was used
                    const [original, flightSpy] = dataStream.tee();
                    dataStream = original;
                    await (0, _useflightresponse.flightRenderComplete)(flightSpy);
                    if ((0, _dynamicrendering.usedDynamicAPIs)(prerenderState)) {
                        // This is the same logic above just repeated after ensuring the RSC stream itself has completed
                        if (postponed != null) {
                            // This is the Dynamic HTML case.
                            metadata.postponed = JSON.stringify((0, _staticrenderer.getDynamicHTMLPostponedState)(postponed));
                        } else {
                            // This is the Dynamic Data case
                            metadata.postponed = JSON.stringify((0, _staticrenderer.getDynamicDataPostponedState)());
                        }
                        // Regardless of whether this is the Dynamic HTML or Dynamic Data case we need to ensure we include
                        // server inserted html in the static response because the html that is part of the prerender may depend on it
                        // It is possible in the set of stream transforms for Dynamic HTML vs Dynamic Data may differ but currently both states
                        // require the same set so we unify the code path here
                        return {
                            stream: await (0, _nodewebstreamshelper.continueDynamicPrerender)(stream, {
                                getServerInsertedHTML
                            })
                        };
                    } else {
                        // This is the Static case
                        // We still have not used any dynamic APIs. At this point we can produce an entirely static prerender response
                        let renderedHTMLStream = stream;
                        if (staticGenerationStore.forceDynamic) {
                            throw new _staticgenerationbailout.StaticGenBailoutError('Invariant: a Page with `dynamic = "force-dynamic"` did not trigger the dynamic pathway. This is a bug in Next.js');
                        }
                        if (postponed != null) {
                            // We postponed but nothing dynamic was used. We resume the render now and immediately abort it
                            // so we can set all the postponed boundaries to client render mode before we store the HTML response
                            const resumeRenderer = (0, _staticrenderer.createStaticRenderer)({
                                ppr: true,
                                isStaticGeneration: false,
                                postponed: (0, _staticrenderer.getDynamicHTMLPostponedState)(postponed),
                                streamOptions: {
                                    signal: (0, _dynamicrendering.createPostponedAbortSignal)("static prerender resume"),
                                    onError: htmlRendererErrorHandler,
                                    nonce
                                }
                            });
                            // We don't actually want to render anything so we just pass a stream
                            // that never resolves. The resume call is going to abort immediately anyway
                            const foreverStream = new ReadableStream();
                            const resumeChildren = /*#__PURE__*/ (0, _jsxruntime.jsx)(HeadManagerContext.Provider, {
                                value: {
                                    appDir: true,
                                    nonce
                                },
                                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(ServerInsertedHTMLProvider, {
                                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)(ReactServerEntrypoint, {
                                        reactServerStream: foreverStream,
                                        preinitScripts: ()=>{},
                                        clientReferenceManifest: clientReferenceManifest,
                                        nonce: nonce
                                    })
                                })
                            });
                            const { stream: resumeStream } = await resumeRenderer.render(resumeChildren);
                            // First we write everything from the prerender, then we write everything from the aborted resume render
                            renderedHTMLStream = (0, _nodewebstreamshelper.chainStreams)(stream, resumeStream);
                        }
                        return {
                            stream: await (0, _nodewebstreamshelper.continueStaticPrerender)(renderedHTMLStream, {
                                inlinedDataStream: (0, _useflightresponse.createInlinedDataReadableStream)(dataStream, nonce, formState),
                                getServerInsertedHTML
                            })
                        };
                    }
                }
            } else if (renderOpts.postponed) {
                // This is a continuation of either an Incomplete or Dynamic Data Prerender.
                const inlinedDataStream = (0, _useflightresponse.createInlinedDataReadableStream)(dataStream, nonce, formState);
                if (resumed) {
                    // We have new HTML to stream and we also need to include server inserted HTML
                    return {
                        stream: await (0, _nodewebstreamshelper.continueDynamicHTMLResume)(stream, {
                            inlinedDataStream,
                            getServerInsertedHTML
                        })
                    };
                } else {
                    // We are continuing a Dynamic Data Prerender and simply need to append new inlined flight data
                    return {
                        stream: await (0, _nodewebstreamshelper.continueDynamicDataResume)(stream, {
                            inlinedDataStream
                        })
                    };
                }
            } else {
                // This may be a static render or a dynamic render
                // @TODO factor this further to make the render types more clearly defined and remove
                // the deluge of optional params that passed to configure the various behaviors
                return {
                    stream: await (0, _nodewebstreamshelper.continueFizzStream)(stream, {
                        inlinedDataStream: (0, _useflightresponse.createInlinedDataReadableStream)(dataStream, nonce, formState),
                        isStaticGeneration: isStaticGeneration || generateStaticHTML,
                        getServerInsertedHTML,
                        serverInsertedHTMLToHead: true,
                        validateRootLayout
                    })
                };
            }
        } catch (err) {
            if ((0, _staticgenerationbailout.isStaticGenBailoutError)(err) || typeof err === "object" && err !== null && "message" in err && typeof err.message === "string" && err.message.includes("https://nextjs.org/docs/advanced-features/static-html-export")) {
                // Ensure that "next dev" prints the red error overlay
                throw err;
            }
            // If this is a static generation error, we need to throw it so that it
            // can be handled by the caller if we're in static generation mode.
            if (isStaticGeneration && (0, _hooksservercontext.isDynamicServerError)(err)) {
                throw err;
            }
            // If a bailout made it to this point, it means it wasn't wrapped inside
            // a suspense boundary.
            const shouldBailoutToCSR = (0, _bailouttocsr.isBailoutToCSRError)(err);
            if (shouldBailoutToCSR) {
                const stack = (0, _formatservererror.getStackWithoutErrorMessage)(err);
                if (renderOpts.experimental.missingSuspenseWithCSRBailout) {
                    (0, _log.error)(`${err.reason} should be wrapped in a suspense boundary at page "${pagePath}". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout\n${stack}`);
                    throw err;
                }
                (0, _log.warn)(`Entire page "${pagePath}" deopted into client-side rendering due to "${err.reason}". Read more: https://nextjs.org/docs/messages/deopted-into-client-rendering\n${stack}`);
            }
            if ((0, _notfound.isNotFoundError)(err)) {
                res.statusCode = 404;
            }
            let hasRedirectError = false;
            if ((0, _redirect.isRedirectError)(err)) {
                hasRedirectError = true;
                res.statusCode = (0, _redirect.getRedirectStatusCodeFromError)(err);
                if (err.mutableCookies) {
                    const headers = new Headers();
                    // If there were mutable cookies set, we need to set them on the
                    // response.
                    if ((0, _requestcookies.appendMutableCookies)(headers, err.mutableCookies)) {
                        res.setHeader("set-cookie", Array.from(headers.values()));
                    }
                }
                const redirectUrl = (0, _addpathprefix.addPathPrefix)((0, _redirect.getURLFromRedirectError)(err), renderOpts.basePath);
                res.setHeader("Location", redirectUrl);
            }
            const is404 = ctx.res.statusCode === 404;
            if (!is404 && !hasRedirectError && !shouldBailoutToCSR) {
                res.statusCode = 500;
            }
            const errorType = is404 ? "not-found" : hasRedirectError ? "redirect" : undefined;
            const [errorPreinitScripts, errorBootstrapScript] = (0, _requiredscripts.getRequiredScripts)(buildManifest, assetPrefix, renderOpts.crossOrigin, subresourceIntegrityManifest, (0, _getassetquerystring.getAssetQueryString)(ctx, false), nonce);
            const errorServerStream = ComponentMod.renderToReadableStream(/*#__PURE__*/ (0, _jsxruntime.jsx)(ReactServerError, {
                tree: tree,
                ctx: ctx,
                errorType: errorType
            }), clientReferenceManifest.clientModules, {
                onError: serverComponentsErrorHandler
            });
            try {
                const fizzStream = await (0, _nodewebstreamshelper.renderToInitialFizzStream)({
                    ReactDOMServer: require("react-dom/server.edge"),
                    element: /*#__PURE__*/ (0, _jsxruntime.jsx)(ReactServerEntrypoint, {
                        reactServerStream: errorServerStream,
                        preinitScripts: errorPreinitScripts,
                        clientReferenceManifest: clientReferenceManifest,
                        nonce: nonce
                    }),
                    streamOptions: {
                        nonce,
                        // Include hydration scripts in the HTML
                        bootstrapScripts: [
                            errorBootstrapScript
                        ],
                        formState
                    }
                });
                return {
                    // Returning the error that was thrown so it can be used to handle
                    // the response in the caller.
                    err,
                    stream: await (0, _nodewebstreamshelper.continueFizzStream)(fizzStream, {
                        inlinedDataStream: (0, _useflightresponse.createInlinedDataReadableStream)(// This is intentionally using the readable datastream from the
                        // main render rather than the flight data from the error page
                        // render
                        dataStream, nonce, formState),
                        isStaticGeneration,
                        getServerInsertedHTML: (0, _makegetserverinsertedhtml.makeGetServerInsertedHTML)({
                            polyfills,
                            renderServerInsertedHTML,
                            serverCapturedErrors: [],
                            basePath: renderOpts.basePath
                        }),
                        serverInsertedHTMLToHead: true,
                        validateRootLayout
                    })
                };
            } catch (finalErr) {
                if (process.env.NODE_ENV === "development" && (0, _notfound.isNotFoundError)(finalErr)) {
                    const bailOnNotFound = require("../../client/components/dev-root-not-found-boundary").bailOnNotFound;
                    bailOnNotFound();
                }
                throw finalErr;
            }
        }
    });
    // For action requests, we handle them differently with a special render result.
    const actionRequestResult = await (0, _actionhandler.handleAction)({
        req,
        res,
        ComponentMod,
        serverModuleMap,
        generateFlight,
        staticGenerationStore,
        requestStore,
        serverActions,
        ctx
    });
    let formState = null;
    if (actionRequestResult) {
        if (actionRequestResult.type === "not-found") {
            const notFoundLoaderTree = createNotFoundLoaderTree(loaderTree);
            const response = await renderToStream({
                asNotFound: true,
                tree: notFoundLoaderTree,
                formState
            });
            return new _renderresult.default(response.stream, {
                metadata
            });
        } else if (actionRequestResult.type === "done") {
            if (actionRequestResult.result) {
                actionRequestResult.result.assignMetadata(metadata);
                return actionRequestResult.result;
            } else if (actionRequestResult.formState) {
                formState = actionRequestResult.formState;
            }
        }
    }
    const options = {
        metadata
    };
    let response = await renderToStream({
        asNotFound: isNotFoundPath,
        tree: loaderTree,
        formState
    });
    // If we have pending revalidates, wait until they are all resolved.
    if (staticGenerationStore.pendingRevalidates || staticGenerationStore.revalidatedTags) {
        var _staticGenerationStore_incrementalCache;
        options.waitUntil = Promise.all([
            (_staticGenerationStore_incrementalCache = staticGenerationStore.incrementalCache) == null ? void 0 : _staticGenerationStore_incrementalCache.revalidateTag(staticGenerationStore.revalidatedTags || []),
            ...Object.values(staticGenerationStore.pendingRevalidates || {})
        ]);
    }
    (0, _patchfetch.addImplicitTags)(staticGenerationStore);
    if (staticGenerationStore.tags) {
        metadata.fetchTags = staticGenerationStore.tags.join(",");
    }
    // Create the new render result for the response.
    const result = new _renderresult.default(response.stream, options);
    // If we aren't performing static generation, we can return the result now.
    if (!isStaticGeneration) {
        return result;
    }
    // If this is static generation, we should read this in now rather than
    // sending it back to be sent to the client.
    response.stream = await result.toUnchunkedString(true);
    const buildFailingError = digestErrorsMap.size > 0 ? digestErrorsMap.values().next().value : null;
    // If we're debugging partial prerendering, print all the dynamic API accesses
    // that occurred during the render.
    if (staticGenerationStore.prerenderState && (0, _dynamicrendering.usedDynamicAPIs)(staticGenerationStore.prerenderState) && ((_staticGenerationStore_prerenderState = staticGenerationStore.prerenderState) == null ? void 0 : _staticGenerationStore_prerenderState.isDebugSkeleton)) {
        (0, _log.warn)("The following dynamic usage was detected:");
        for (const access of (0, _dynamicrendering.formatDynamicAPIAccesses)(staticGenerationStore.prerenderState)){
            (0, _log.warn)(access);
        }
    }
    if (!flightDataResolver) {
        throw new Error("Invariant: Flight data resolver is missing when generating static HTML");
    }
    // If we encountered any unexpected errors during build we fail the
    // prerendering phase and the build.
    if (buildFailingError) {
        throw buildFailingError;
    }
    // Wait for and collect the flight payload data if we don't have it
    // already
    const flightData = await flightDataResolver();
    if (flightData) {
        metadata.flightData = flightData;
    }
    // If force static is specifically set to false, we should not revalidate
    // the page.
    if (staticGenerationStore.forceStatic === false) {
        staticGenerationStore.revalidate = 0;
    }
    // Copy the revalidation value onto the render result metadata.
    metadata.revalidate = staticGenerationStore.revalidate ?? ctx.defaultRevalidate;
    // provide bailout info for debugging
    if (metadata.revalidate === 0) {
        metadata.staticBailoutInfo = {
            description: staticGenerationStore.dynamicUsageDescription,
            stack: staticGenerationStore.dynamicUsageStack
        };
    }
    return new _renderresult.default(response.stream, options);
}
const renderToHTMLOrFlight = (req, res, pagePath, query, renderOpts)=>{
    // TODO: this includes query string, should it?
    const pathname = (0, _validateurl.validateURL)(req.url);
    return _requestasyncstoragewrapper.RequestAsyncStorageWrapper.wrap(renderOpts.ComponentMod.requestAsyncStorage, {
        req,
        res,
        renderOpts
    }, (requestStore)=>_staticgenerationasyncstoragewrapper.StaticGenerationAsyncStorageWrapper.wrap(renderOpts.ComponentMod.staticGenerationAsyncStorage, {
            urlPathname: pathname,
            renderOpts,
            requestEndedState: {
                ended: false
            }
        }, (staticGenerationStore)=>renderToHTMLOrFlightImpl(req, res, pagePath, query, renderOpts, {
                requestStore,
                staticGenerationStore,
                componentMod: renderOpts.ComponentMod,
                renderOpts
            }, staticGenerationStore.requestEndedState || {})));
};

//# sourceMappingURL=app-render.js.map