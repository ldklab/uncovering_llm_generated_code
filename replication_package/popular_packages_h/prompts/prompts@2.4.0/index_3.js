function isNodeLT(target) {
  target = Array.isArray(target) ? target.map(Number) : target.split('.').map(Number);
  const nodeVersion = process.versions.node.split('.').map(Number);

  for (let i = 0; i < target.length; i++) {
    if (nodeVersion[i] > target[i]) return false;
    if (target[i] > nodeVersion[i]) return true;
  }
  return false;
}

module.exports = isNodeLT('8.6.0')
  ? require('./dist/index.js')
  : require('./lib/index.js');
