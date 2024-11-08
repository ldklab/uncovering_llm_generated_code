'use strict';

const reactIs = require('react-is');

const REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};

const KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};

const FORWARD_REF_STATICS = {
  '$$typeof': true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};

const MEMO_STATICS = {
  '$$typeof': true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};

const TYPE_STATICS = {
  [reactIs.ForwardRef]: FORWARD_REF_STATICS,
  [reactIs.Memo]: MEMO_STATICS
};

const getStatics = (component) => {
  if (reactIs.isMemo(component)) {
    return MEMO_STATICS;
  }

  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
};

function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  if (typeof sourceComponent !== 'string') {
    const objectPrototype = Object.prototype;
    const getPrototypeOf = Object.getPrototypeOf;
    const getOwnPropertyNames = Object.getOwnPropertyNames;
    const getOwnPropertySymbols = Object.getOwnPropertySymbols;
    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    const defineProperty = Object.defineProperty;

    if (objectPrototype) {
      const inheritedComponent = getPrototypeOf(sourceComponent);

      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }

    let keys = getOwnPropertyNames(sourceComponent);

    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }

    const targetStatics = getStatics(targetComponent);
    const sourceStatics = getStatics(sourceComponent);

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];

      if (!KNOWN_STATICS[key] &&
          !(blacklist && blacklist[key]) &&
          !(sourceStatics && sourceStatics[key]) &&
          !(targetStatics && targetStatics[key])) {
        const descriptor = getOwnPropertyDescriptor(sourceComponent, key);

        try {
          defineProperty(targetComponent, key, descriptor);
        } catch (e) {}
      }
    }
  }

  return targetComponent;
}

module.exports = hoistNonReactStatics;
