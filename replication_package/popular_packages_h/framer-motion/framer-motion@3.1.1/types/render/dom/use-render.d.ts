/// <reference types="react" />
import { MotionProps } from "../../motion/types";
import { HTMLVisualElement } from "./HTMLVisualElement";
import { SVGVisualElement } from "./SVGVisualElement";
export declare function useRender<Props>(Component: string | React.ComponentType<Props>, props: MotionProps, visualElement: HTMLVisualElement | SVGVisualElement): import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>;
