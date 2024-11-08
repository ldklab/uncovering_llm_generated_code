/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { ComponentType } from 'react';
import { UrlObject } from 'url';
import { ManifestItem } from '../server/load-components';
import { NextRouter } from './router/router';
import { Env } from '@next/env';
import { BuildManifest } from '../server/get-page-files';
import { DomainLocales } from '../server/config';
/**
 * Types used by both next and next-server
 */
export declare type NextComponentType<C extends BaseContext = NextPageContext, IP = {}, P = {}> = ComponentType<P> & {
    /**
     * Used for initial page load data population. Data returned from `getInitialProps` is serialized when server rendered.
     * Make sure to return plain `Object` without using `Date`, `Map`, `Set`.
     * @param ctx Context of `page`
     */
    getInitialProps?(context: C): IP | Promise<IP>;
};
export declare type DocumentType = NextComponentType<DocumentContext, DocumentInitialProps, DocumentProps> & {
    renderDocument(Document: DocumentType, props: DocumentProps): React.ReactElement;
};
export declare type AppType = NextComponentType<AppContextType, AppInitialProps, AppPropsType>;
export declare type AppTreeType = ComponentType<AppInitialProps & {
    [name: string]: any;
}>;
/**
 * Web vitals provided to _app.reportWebVitals by Core Web Vitals plugin developed by Google Chrome team.
 * https://nextjs.org/blog/next-9-4#integrated-web-vitals-reporting
 */
export declare type NextWebVitalsMetric = {
    id: string;
    label: string;
    name: string;
    startTime: number;
    value: number;
};
export declare type Enhancer<C> = (Component: C) => C;
export declare type ComponentsEnhancer = {
    enhanceApp?: Enhancer<AppType>;
    enhanceComponent?: Enhancer<NextComponentType>;
} | Enhancer<NextComponentType>;
export declare type RenderPageResult = {
    html: string;
    head?: Array<JSX.Element | null>;
};
export declare type RenderPage = (options?: ComponentsEnhancer) => RenderPageResult | Promise<RenderPageResult>;
export declare type BaseContext = {
    res?: ServerResponse;
    [k: string]: any;
};
export declare type NEXT_DATA = {
    props: Record<string, any>;
    page: string;
    query: ParsedUrlQuery;
    buildId: string;
    assetPrefix?: string;
    runtimeConfig?: {
        [key: string]: any;
    };
    nextExport?: boolean;
    autoExport?: boolean;
    isFallback?: boolean;
    dynamicIds?: string[];
    err?: Error & {
        statusCode?: number;
    };
    gsp?: boolean;
    gssp?: boolean;
    customServer?: boolean;
    gip?: boolean;
    appGip?: boolean;
    locale?: string;
    locales?: string[];
    defaultLocale?: string;
    domainLocales?: DomainLocales;
};
/**
 * `Next` context
 */
export interface NextPageContext {
    /**
     * Error object if encountered during rendering
     */
    err?: (Error & {
        statusCode?: number;
    }) | null;
    /**
     * `HTTP` request object.
     */
    req?: IncomingMessage;
    /**
     * `HTTP` response object.
     */
    res?: ServerResponse;
    /**
     * Path section of `URL`.
     */
    pathname: string;
    /**
     * Query string section of `URL` parsed as an object.
     */
    query: ParsedUrlQuery;
    /**
     * `String` of the actual path including query.
     */
    asPath?: string;
    /**
     * `Component` the tree of the App to use if needing to render separately
     */
    AppTree: AppTreeType;
}
export declare type AppContextType<R extends NextRouter = NextRouter> = {
    Component: NextComponentType<NextPageContext>;
    AppTree: AppTreeType;
    ctx: NextPageContext;
    router: R;
};
export declare type AppInitialProps = {
    pageProps: any;
};
export declare type AppPropsType<R extends NextRouter = NextRouter, P = {}> = AppInitialProps & {
    Component: NextComponentType<NextPageContext, any, P>;
    router: R;
    __N_SSG?: boolean;
    __N_SSP?: boolean;
};
export declare type DocumentContext = NextPageContext & {
    renderPage: RenderPage;
};
export declare type DocumentInitialProps = RenderPageResult & {
    styles?: React.ReactElement[] | React.ReactFragment;
};
export declare type DocumentProps = DocumentInitialProps & {
    __NEXT_DATA__: NEXT_DATA;
    dangerousAsPath: string;
    docComponentsRendered: {
        Html?: boolean;
        Main?: boolean;
        Head?: boolean;
        NextScript?: boolean;
    };
    buildManifest: BuildManifest;
    ampPath: string;
    inAmpMode: boolean;
    hybridAmp: boolean;
    isDevelopment: boolean;
    dynamicImports: ManifestItem[];
    assetPrefix?: string;
    canonicalBase: string;
    headTags: any[];
    unstable_runtimeJS?: false;
    devOnlyCacheBusterQueryString: string;
    scriptLoader: {
        defer?: string[];
        eager?: any[];
    };
    locale?: string;
};
/**
 * Next `API` route request
 */
export interface NextApiRequest extends IncomingMessage {
    /**
     * Object of `query` values from url
     */
    query: {
        [key: string]: string | string[];
    };
    /**
     * Object of `cookies` from header
     */
    cookies: {
        [key: string]: string;
    };
    body: any;
    env: Env;
    preview?: boolean;
    /**
     * Preview data set on the request, if any
     * */
    previewData?: any;
}
/**
 * Send body of response
 */
declare type Send<T> = (body: T) => void;
/**
 * Next `API` route response
 */
export declare type NextApiResponse<T = any> = ServerResponse & {
    /**
     * Send data `any` data in response
     */
    send: Send<T>;
    /**
     * Send data `json` data in response
     */
    json: Send<T>;
    status: (statusCode: number) => NextApiResponse<T>;
    redirect(url: string): NextApiResponse<T>;
    redirect(status: number, url: string): NextApiResponse<T>;
    /**
     * Set preview data for Next.js' prerender mode
     */
    setPreviewData: (data: object | string, options?: {
        /**
         * Specifies the number (in seconds) for the preview session to last for.
         * The given number will be converted to an integer by rounding down.
         * By default, no maximum age is set and the preview session finishes
         * when the client shuts down (browser is closed).
         */
        maxAge?: number;
    }) => NextApiResponse<T>;
    clearPreviewData: () => NextApiResponse<T>;
};
/**
 * Next `API` route handler
 */
export declare type NextApiHandler<T = any> = (req: NextApiRequest, res: NextApiResponse<T>) => void | Promise<void>;
/**
 * Utils
 */
export declare function execOnce<T extends (...args: any[]) => ReturnType<T>>(fn: T): T;
export declare function getLocationOrigin(): string;
export declare function getURL(): string;
export declare function getDisplayName<P>(Component: ComponentType<P>): string;
export declare function isResSent(res: ServerResponse): boolean;
export declare function loadGetInitialProps<C extends BaseContext, IP = {}, P = {}>(App: NextComponentType<C, IP, P>, ctx: C): Promise<IP>;
export declare const urlObjectKeys: string[];
export declare function formatWithValidation(url: UrlObject): string;
export declare const SP: boolean;
export declare const ST: boolean;
export {};
