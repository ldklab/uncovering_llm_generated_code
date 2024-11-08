typescript
"use strict";
import * as crossPlatformSha256 from "./crossPlatformSha256";
export * from "./crossPlatformSha256";

import { Sha256 as WebCryptoSha256 } from "./webCryptoSha256";
export { WebCryptoSha256 };
