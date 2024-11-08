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

function getStatics(component) {
  return reactIs.isMemo(component) ? MEMO_STATICS : TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
}

function hoistNonReactStatics(targetComponent, sourceComponent, blacklist = {}) {
  if (typeof sourceComponent !== 'string') {
    const inheritedComponent = Object.getPrototypeOf(sourceComponent);
    if (inheritedComponent && inheritedComponent !== Object.prototype) {
      hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
    }

    let keys = Object.getOwnPropertyNames(sourceComponent);

    if (Object.getOwnPropertySymbols) {
      keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
    }

    const targetStatics = getStatics(targetComponent);
    const sourceStatics = getStatics(sourceComponent);

    keys.forEach((key) => {
      if (!KNOWN_STATICS[key] && !blacklist[key] && !sourceStatics[key] && !targetStatics[key]) {
        const descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
        try {
          Object.defineProperty(targetComponent, key, descriptor);
        } catch (e) {}
      }
    });
  }

  return targetComponent;
}

module.exports = hoistNonReactStatics;
