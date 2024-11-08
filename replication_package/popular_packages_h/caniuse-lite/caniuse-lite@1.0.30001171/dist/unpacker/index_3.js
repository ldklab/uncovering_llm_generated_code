'use strict';

import { agents } from './agents';
import featureDefault from './feature';
import { features } from './features';
import regionDefault from './region';

Object.defineProperty(exports, "__esModule", {
  value: true
});

Object.defineProperty(exports, 'agents', {
  enumerable: true,
  get: function () {
    return agents;
  }
});

Object.defineProperty(exports, 'feature', {
  enumerable: true,
  get: function () {
    return featureDefault;
  }
});

Object.defineProperty(exports, 'features', {
  enumerable: true,
  get: function () {
    return features;
  }
});

Object.defineProperty(exports, 'region', {
  enumerable: true,
  get: function () {
    return regionDefault;
  }
});
