// for-each.js
function forEach(collection, callback) {
  if (Array.isArray(collection)) {
    collection.forEach((item, index) => callback(item, index, collection));
  } else if (collection && typeof collection === 'object') {
    Object.keys(collection).forEach((key) => {
      callback(collection[key], key, collection);
    });
  }
}

module.exports = forEach;
