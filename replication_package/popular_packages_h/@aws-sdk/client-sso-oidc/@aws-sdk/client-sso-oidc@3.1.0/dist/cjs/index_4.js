"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

require("./SSOOIDCClient");
require("./SSOOIDC");
require("./commands/CreateTokenCommand");
require("./commands/RegisterClientCommand");
require("./commands/StartDeviceAuthorizationCommand");
require("./models/index");

exports = Object.assign(
    {},
    require("./SSOOIDCClient"),
    require("./SSOOIDC"),
    require("./commands/CreateTokenCommand"),
    require("./commands/RegisterClientCommand"),
    require("./commands/StartDeviceAuthorizationCommand"),
    require("./models/index")
);

//# sourceMappingURL=index.js.map
