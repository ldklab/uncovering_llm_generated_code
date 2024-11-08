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
  return reactIs.isMemo(component) ? MEMO_STATICS :
         TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
}

const defineProperty = Object.defineProperty;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const getOwnPropertySymbols = Object.getOwnPropertySymbols || (() => []);
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getPrototypeOf = Object.getPrototypeOf;
const objectPrototype = Object.prototype;

function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  if (typeof sourceComponent !== 'string' && objectPrototype) {
    let inheritedComponent = getPrototypeOf(sourceComponent);
    if (inheritedComponent && inheritedComponent !== objectPrototype) {
      hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
    }

    let keys = getOwnPropertyNames(sourceComponent).concat(getOwnPropertySymbols(sourceComponent));
    let targetStatics = getStatics(targetComponent);
    let sourceStatics = getStatics(sourceComponent);

    keys.forEach(key => {
      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && 
          !(sourceStatics && sourceStatics[key]) && 
          !(targetStatics && targetStatics[key])) {
        const descriptor = getOwnPropertyDescriptor(sourceComponent, key);
        try {
          defineProperty(targetComponent, key, descriptor);
        } catch (e) { }
      }
    });
  }

  return targetComponent;
}

module.exports = hoistNonReactStatics;
