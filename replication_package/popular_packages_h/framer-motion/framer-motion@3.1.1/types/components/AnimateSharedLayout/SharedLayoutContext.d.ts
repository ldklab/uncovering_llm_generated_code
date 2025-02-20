/// <reference types="react" />
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement";
/**
 * Handlers for batching sync layout lifecycles. We batches these processes to cut
 * down on layout thrashing
 */
export interface SyncLayoutLifecycles {
    measureLayout: (child: HTMLVisualElement) => void;
    layoutReady: (child: HTMLVisualElement) => void;
    parent?: HTMLVisualElement;
}
/**
 * The exposed API for children to add themselves to the batcher and to flush it.
 */
export interface SyncLayoutBatcher {
    add: (child: HTMLVisualElement) => void;
    flush: (handler?: SyncLayoutLifecycles) => void;
}
/**
 * Extra API methods available to children if they're a descendant of AnimateSharedLayout
 */
export interface SharedLayoutSyncMethods extends SyncLayoutBatcher {
    syncUpdate: (force?: boolean) => void;
    forceUpdate: () => void;
    register: (child: HTMLVisualElement) => void;
    remove: (child: HTMLVisualElement) => void;
}
/**
 * Create a batcher to process VisualElements
 */
export declare function createBatcher(): SyncLayoutBatcher;
export declare function isSharedLayout(context: SyncLayoutBatcher | SharedLayoutSyncMethods): context is SharedLayoutSyncMethods;
export declare const SharedLayoutContext: import("react").Context<SyncLayoutBatcher | SharedLayoutSyncMethods>;
/**
 * @internal
 */
export declare const FramerTreeLayoutContext: import("react").Context<SyncLayoutBatcher | SharedLayoutSyncMethods>;
