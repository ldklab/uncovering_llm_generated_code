'use strict';

const getDay = Date.prototype.getDay;
const toStr = Object.prototype.toString;
const dateClass = '[object Date]';
const hasToStringTag = require('has-tostringtag/shams')();

function tryDateGetDayCall(value) {
  try {
    getDay.call(value);
    return true;
  } catch (e) {
    return false;
  }
}

function isDateObject(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return hasToStringTag ? tryDateGetDayCall(value) : toStr.call(value) === dateClass;
}

module.exports = isDateObject;
