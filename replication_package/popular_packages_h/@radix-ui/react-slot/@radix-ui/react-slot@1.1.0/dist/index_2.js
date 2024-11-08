import React, { forwardRef, Children, isValidElement, cloneElement, Fragment } from 'react';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { jsx as _jsx } from 'react/jsx-runtime';

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
    } else if (propName === 'style') {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ');
    }
  }
  return { ...slotProps, ...overrideProps };
}

function getElementRef(element) {
  const ref = element.props.ref || element.ref;
  let getter = Object.getOwnPropertyDescriptor(element.props, 'ref')?.get;
  let mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  if (mayWarn) return ref;

  getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
  mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
  if (mayWarn) return ref;

  return ref;
}

const Slottable = ({ children }) => _jsx(Fragment, { children });

const Slot = forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = Children.toArray(children);
  const slottable = childrenArray.find(child => isValidElement(child) && child.type === Slottable);

  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map(child => {
      if (child === slottable) {
        if (Children.count(newElement) > 1) return Children.only(null);
        return isValidElement(newElement) ? newElement.props.children : null;
      } else {
        return child;
      }
    });

    return _jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: isValidElement(newElement) ? cloneElement(newElement, undefined, newChildren) : null });
  }

  return _jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
});
Slot.displayName = 'Slot';

const SlotClone = forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (isValidElement(children)) {
    const childrenRef = getElementRef(children);
    return cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      ref: forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef
    });
  }
  return Children.count(children) > 1 ? Children.only(null) : null;
});
SlotClone.displayName = 'SlotClone';

const Root = Slot;

export { Slot, Slottable, Root };
