// setsPrototypeOf.js

function setPrototypeOf(obj, proto) {
  if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(obj, proto);
  } else if (typeof obj.__proto__ === 'object') {
    obj.__proto__ = proto;
  } else {
    const ownProps = Object.getOwnPropertyNames(proto);
    ownProps.forEach(prop => {
      if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
        obj[prop] = proto[prop];
      }
    });
    
    const existingProto = Object.getPrototypeOf(obj);
    if (existingProto !== Object.prototype) {
      const existingProps = Object.getOwnPropertyNames(existingProto);
      existingProps.forEach(prop => {
        if (!Object.prototype.hasOwnProperty.call(obj, prop) && !ownProps.includes(prop)) {
          obj[prop] = existingProto[prop];
        }
      });
    }
  }
  return obj;
}

module.exports = setPrototypeOf;
