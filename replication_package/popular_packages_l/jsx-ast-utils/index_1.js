// utils.js

// Utility function to check if a property exists on a JSX element's attributes
function hasProp(props, prop, { ignoreCase = true } = {}) {
  return props.some(attribute => 
    attribute.type === 'JSXAttribute' &&
    (ignoreCase 
      ? attribute.name.name.toLowerCase() === prop.toLowerCase() 
      : attribute.name.name === prop)
  );
}

// Utility function to check if any property from a list exists on a JSX element's attributes
function hasAnyProp(props, propList, options) {
  return propList.some(prop => hasProp(props, prop, options));
}

// Utility function to check if every property from a list exists on a JSX element's attributes
function hasEveryProp(props, propList, options) {
  return propList.every(prop => hasProp(props, prop, options));
}

// Retrieve a property's JSXAttribute object if it exists
function getProp(props, prop, { ignoreCase = true } = {}) {
  return props.find(attribute => 
    attribute.type === 'JSXAttribute' &&
    (ignoreCase 
      ? attribute.name.name.toLowerCase() === prop.toLowerCase() 
      : attribute.name.name === prop)
  );
}

// Retrieve the tag name of a JSX element
function elementType(node) {
  return node.openingElement.name.name;
}

// Get the value of a specific property
function getPropValue(prop) {
  return prop && prop.value ? (prop.value.expression ? prop.value.expression.value : prop.value.value) : undefined;
}

// Get the literal value of a property
function getLiteralPropValue(prop) {
  if (!prop || !prop.value) return undefined;
  if (prop.value.type === 'Literal') return prop.value.value;
  if (prop.value.type === 'JSXExpressionContainer' && prop.value.expression.type === 'Literal') {
    return prop.value.expression.value;
  }
  return undefined;
}

// Get the name of a property
function propName(prop) {
  return prop.name ? prop.name.name : undefined;
}

// Common event handler names for JSX
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

// Event handler functions categorized by type
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
  transition: ['onTransitionEnd']
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
