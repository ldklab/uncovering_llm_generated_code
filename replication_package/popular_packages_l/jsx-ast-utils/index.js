// utils.js

// Utility function to check if a prop exists on a JSX element
function hasProp(props, prop, options = { ignoreCase: true, spreadStrict: true }) {
  return props.some(attribute => {
    if (attribute.type === 'JSXAttribute') {
      const attributeName = attribute.name.name;
      return options.ignoreCase ? attributeName.toLowerCase() === prop.toLowerCase() : attributeName === prop;
    }
    return false;
  });
}

// Utility function to check if any from a list of props exist on a JSX element
function hasAnyProp(props, propList, options = { ignoreCase: true, spreadStrict: true }) {
  return propList.some(prop => hasProp(props, prop, options));
}

// Utility function to check if all given props exist on a JSX element
function hasEveryProp(props, propList, options = { ignoreCase: true, spreadStrict: true }) {
  return propList.every(prop => hasProp(props, prop, options));
}

// Retrieve the prop as a JSXAttribute object if it exists
function getProp(props, prop, options = { ignoreCase: true }) {
  return props.find(attribute => {
    if (attribute.type === 'JSXAttribute') {
      const attributeName = attribute.name.name;
      return options.ignoreCase ? attributeName.toLowerCase() === prop.toLowerCase() : attributeName === prop;
    }
    return false;
  });
}

// Get the element type (tag name) of a JSX element
function elementType(node) {
  return node.openingElement.name.name;
}

// Get the value of a specific prop
function getPropValue(prop) {
  if (prop && prop.value) {
    return prop.value.expression ? prop.value.expression.value : prop.value.value;
  }
  return undefined;
}

// Get literal value of a prop
function getLiteralPropValue(prop) {
  if (!prop || !prop.value) return undefined;
  if (prop.value.type === 'Literal') return prop.value.value;
  if (prop.value.type === 'JSXExpressionContainer' && prop.value.expression.type === 'Literal') {
    return prop.value.expression.value;
  }
  return undefined;
}

// Get the name of a prop
function propName(prop) {
  return prop.name ? prop.name.name : undefined;
}

// Common event handler names used in JSX
const eventHandlers = [
  'onCopy', 'onCut', 'onPaste', 'onCompositionEnd', 'onCompositionStart', 'onCompositionUpdate',
  'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus', 'onBlur', 'onChange', 'onInput', 'onSubmit',
  'onClick', 'onContextMenu', 'onDblClick', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter',
  'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter',
  'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', 'onSelect', 'onTouchCancel',
  'onTouchEnd', 'onTouchMove', 'onTouchStart', 'onScroll', 'onWheel', 'onAbort', 'onCanPlay',
  'onCanPlayThrough', 'onDurationChange', 'onEmptied', 'onEncrypted', 'onEnded', 'onError',
  'onLoadedData', 'onLoadedMetadata', 'onLoadStart', 'onPause', 'onPlay', 'onPlaying',
  'onProgress', 'onRateChange', 'onSeeked', 'onSeeking', 'onStalled', 'onSuspend', 'onTimeUpdate',
  'onVolumeChange', 'onWaiting', 'onLoad', 'onError', 'onAnimationStart', 'onAnimationEnd',
  'onAnimationIteration', 'onTransitionEnd'
];

const eventHandlersByType = {
  clipboard: ['onCopy', 'onCut', 'onPaste'],
  composition: ['onCompositionEnd', 'onCompositionStart', 'onCompositionUpdate'],
  keyboard: ['onKeyDown', 'onKeyPress', 'onKeyUp'],
  focus: ['onFocus', 'onBlur'],
  form: ['onChange', 'onInput', 'onSubmit'],
  mouse: [
    'onClick', 'onContextMenu', 'onDblClick', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter',
    'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter',
    'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp'
  ],
  selection: ['onSelect'],
  touch: ['onTouchCancel', 'onTouchEnd', 'onTouchMove', 'onTouchStart'],
  ui: ['onScroll'],
  wheel: ['onWheel'],
  media: [
    'onAbort', 'onCanPlay', 'onCanPlayThrough', 'onDurationChange', 'onEmptied', 'onEncrypted',
    'onEnded', 'onError', 'onLoadedData', 'onLoadedMetadata', 'onLoadStart', 'onPause', 'onPlay',
    'onPlaying', 'onProgress', 'onRateChange', 'onSeeked', 'onSeeking', 'onStalled', 'onSuspend',
    'onTimeUpdate', 'onVolumeChange', 'onWaiting'
  ],
  image: ['onLoad', 'onError'],
  animation: ['onAnimationStart', 'onAnimationEnd', 'onAnimationIteration'],
  transition: ['onTransitionEnd'],
};

module.exports = {
  hasProp,
  hasAnyProp,
  hasEveryProp,
  getProp,
  elementType,
  getPropValue,
  getLiteralPropValue,
  propName,
  eventHandlers,
  eventHandlersByType
};
