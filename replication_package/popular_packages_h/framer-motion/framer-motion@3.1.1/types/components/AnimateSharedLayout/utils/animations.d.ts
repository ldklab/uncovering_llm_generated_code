import { SharedLayoutAnimationConfig } from "../types";
import { LayoutStack } from "./stack";
import { HTMLVisualElement } from "../../../render/dom/HTMLVisualElement";
export declare function createSwitchAnimation(child: HTMLVisualElement, stack?: LayoutStack): SharedLayoutAnimationConfig;
export declare function createCrossfadeAnimation(child: HTMLVisualElement, stack?: LayoutStack): SharedLayoutAnimationConfig;
