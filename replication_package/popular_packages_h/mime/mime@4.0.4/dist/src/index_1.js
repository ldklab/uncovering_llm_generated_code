import otherTypes from '../types/other.js';
import standardTypes from '../types/standard.js';
import Mime from './Mime.js';

export { default as Mime } from './Mime.js';

const mimeInstance = new Mime(standardTypes, otherTypes);
const frozenMimeInstance = mimeInstance._freeze();

export default frozenMimeInstance;
//# sourceMappingURL=index.js.map
