"use strict";

// Utilities for module exports and imports
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, exports) => {
  for (var name in exports)
    __defProp(target, name, { get: exports[name], enumerable: true });
};

var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// React Slot Module Exports
var src_exports = {};
__export(src_exports, {
  Root: () => Root,
  Slot: () => Slot,
  Slottable: () => Slottable
});
module.exports = __toCommonJS(src_exports);

// Import necessary modules
var React = __toESM(require("react"));
var { composeRefs } = require("@radix-ui/react-compose-refs");
var { jsx: _jsx } = require("react/jsx-runtime");

// Slot Component
var Slot = React.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = React.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) =>
      child === slottable
        ? React.isValidElement(newElement) ? newElement.props.children : null
        : child
    );

    return _jsx(SlotClone, {
      ...slotProps,
      ref: forwardedRef,
      children: React.isValidElement(newElement)
        ? React.cloneElement(newElement, void 0, newChildren)
        : null
    });
  }
  return _jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
});
Slot.displayName = "Slot";

// SlotClone Component
var SlotClone = React.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (React.isValidElement(children)) {
    const childrenRef = getElementRef(children);
    return React.cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      // @ts-ignore
      ref: forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef
    });
  }
  return React.Children.count(children) > 1 ? React.Children.only(null) : null;
});
SlotClone.displayName = "SlotClone";

// Slottable Component
var Slottable = ({ children }) => _jsx(_jsx.Fragment, { children });

// Utility Functions
function isSlottable(child) {
  return React.isValidElement(child) && child.type === Slottable;
}

function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);

    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}

function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

// Aliasing Slot as Root
var Root = Slot;
