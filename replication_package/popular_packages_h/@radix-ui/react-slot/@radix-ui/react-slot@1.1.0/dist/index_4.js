"use strict";
const { create: __create, defineProperty: __defProp, getOwnPropertyDescriptor: __getOwnPropDesc, getOwnPropertyNames: __getOwnPropNames, getPrototypeOf: __getProtoOf } = Object;
const { hasOwnProperty: __hasOwnProp } = Object.prototype;

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const __toESM = (mod, isNodeMode, target = mod != null ? __create(__getProtoOf(mod)) : {}) => {
  return __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  );
};

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const src_exports = {};
__export(src_exports, {
  Root: () => Root,
  Slot: () => Slot,
  Slottable: () => Slottable
});
module.exports = __toCommonJS(src_exports);

const React = __toESM(require("react"));
const { composeRefs } = require("@radix-ui/react-compose-refs");
const { jsx: _jsx, Fragment: _Fragment } = require("react/jsx-runtime");

const Slot = React.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = React.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) =>
      child === slottable
        ? React.isValidElement(newElement) && React.Children.count(newElement) <= 1
          ? newElement.props.children
          : null
        : child
    );

    return _jsx(SlotClone, {
      ...slotProps,
      ref: forwardedRef,
      children: React.isValidElement(newElement) ? React.cloneElement(newElement, undefined, newChildren) : null,
    });
  }

  return _jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
});

Slot.displayName = "Slot";

const SlotClone = React.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;

  if (React.isValidElement(children)) {
    const childrenRef = getElementRef(children);

    return React.cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      ref: forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef,
    });
  }

  return React.Children.count(children) > 1 ? React.Children.only(null) : null;
});

SlotClone.displayName = "SlotClone";

const Slottable = ({ children }) => _jsx(_Fragment, { children });

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
  const propDesc = Object.getOwnPropertyDescriptor(element.props, "ref");
  const mayWarn = propDesc?.get && "isReactWarning" in propDesc.get && propDesc.get.isReactWarning;

  if (mayWarn) {
    return element.ref;
  }

  const elemDesc = Object.getOwnPropertyDescriptor(element, "ref");
  const elemMayWarn = elemDesc?.get && "isReactWarning" in elemDesc.get && elemDesc.get.isReactWarning;

  if (elemMayWarn) {
    return element.props.ref;
  }

  return element.props.ref || element.ref;
}

const Root = Slot;
//# sourceMappingURL=index.js.map
