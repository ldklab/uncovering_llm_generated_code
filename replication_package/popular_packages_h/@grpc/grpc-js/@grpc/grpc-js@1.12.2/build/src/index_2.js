"use strict";

const callCredentialsModule = require("./call-credentials");
const channelModule = require("./channel");
const compressionAlgorithmsModule = require("./compression-algorithms");
const connectivityStateModule = require("./connectivity-state");
const channelCredentialsModule = require("./channel-credentials");
const clientModule = require("./client");
const constantsModule = require("./constants");
const logging = require("./logging");
const makeClientModule = require("./make-client");
const metadataModule = require("./metadata");
const serverModule = require("./server");
const serverCredentialsModule = require("./server-credentials");
const statusBuilderModule = require("./status-builder");
const clientInterceptorsModule = require("./client-interceptors");
const channelzModule = require("./channelz");
const adminModule = require("./admin");
const serverInterceptorsModule = require("./server-interceptors");
const experimental = require("./experimental");
const resolverDns = require("./resolver-dns");
const resolverUds = require("./resolver-uds");
const resolverIp = require("./resolver-ip");
const pickFirstBalancer = require("./load-balancer-pick-first");
const roundRobinBalancer = require("./load-balancer-round-robin");
const outlierDetectionBalancer = require("./load-balancer-outlier-detection");

Object.defineProperty(exports, "CallCredentials", {
    enumerable: true,
    get: function () { return callCredentialsModule.CallCredentials; }
});

Object.defineProperty(exports, "Channel", {
    enumerable: true,
    get: function () { return channelModule.ChannelImplementation; }
});

Object.defineProperty(exports, "compressionAlgorithms", {
    enumerable: true,
    get: function () { return compressionAlgorithmsModule.CompressionAlgorithms; }
});

Object.defineProperty(exports, "connectivityState", {
    enumerable: true,
    get: function () { return connectivityStateModule.ConnectivityState; }
});

Object.defineProperty(exports, "ChannelCredentials", {
    enumerable: true,
    get: function () { return channelCredentialsModule.ChannelCredentials; }
});

Object.defineProperty(exports, "Client", {
    enumerable: true,
    get: function () { return clientModule.Client; }
});

Object.defineProperty(exports, "logVerbosity", {
    enumerable: true,
    get: function () { return constantsModule.LogVerbosity; }
});

Object.defineProperty(exports, "status", {
    enumerable: true,
    get: function () { return constantsModule.Status; }
});

Object.defineProperty(exports, "propagate", {
    enumerable: true,
    get: function () { return constantsModule.Propagate; }
});

Object.defineProperty(exports, "loadPackageDefinition", {
    enumerable: true,
    get: function () { return makeClientModule.loadPackageDefinition; }
});

Object.defineProperty(exports, "makeClientConstructor", {
    enumerable: true,
    get: function () { return makeClientModule.makeClientConstructor; }
});

Object.defineProperty(exports, "makeGenericClientConstructor", {
    enumerable: true,
    get: function () { return makeClientModule.makeGenericClientConstructor; }
});

Object.defineProperty(exports, "Metadata", {
    enumerable: true,
    get: function () { return metadataModule.Metadata; }
});

Object.defineProperty(exports, "Server", {
    enumerable: true,
    get: function () { return serverModule.Server; }
});

Object.defineProperty(exports, "ServerCredentials", {
    enumerable: true,
    get: function () { return serverCredentialsModule.ServerCredentials; }
});

Object.defineProperty(exports, "StatusBuilder", {
    enumerable: true,
    get: function () { return statusBuilderModule.StatusBuilder; }
});

// Client Credentials
exports.credentials = {
    combineChannelCredentials: (channelCredentials, ...callCredentials) => {
        return callCredentials.reduce((acc, other) => acc.compose(other), channelCredentials);
    },
    combineCallCredentials: (first, ...additional) => {
        return additional.reduce((acc, other) => acc.compose(other), first);
    },
    createInsecure: channelCredentialsModule.ChannelCredentials.createInsecure,
    createSsl: channelCredentialsModule.ChannelCredentials.createSsl,
    createFromSecureContext: channelCredentialsModule.ChannelCredentials.createFromSecureContext,
    createFromMetadataGenerator: callCredentialsModule.CallCredentials.createFromMetadataGenerator,
    createFromGoogleCredential: callCredentialsModule.CallCredentials.createFromGoogleCredential,
    createEmpty: callCredentialsModule.CallCredentials.createEmpty,
};

// Client utilities
const closeClient = (client) => client.close();
exports.closeClient = closeClient;

const waitForClientReady = (client, deadline, callback) => client.waitForReady(deadline, callback);
exports.waitForClientReady = waitForClientReady;

// Unimplemented function stubs
const loadObject = (value, options) => {
    throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};
exports.loadObject = loadObject;

const load = (filename, format, options) => {
    throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};
exports.load = load;

// Logger configuration
const setLogger = (logger) => {
    logging.setLogger(logger);
};
exports.setLogger = setLogger;

const setLogVerbosity = (verbosity) => {
    logging.setLoggerVerbosity(verbosity);
};
exports.setLogVerbosity = setLogVerbosity;

const getClientChannel = (client) => clientModule.Client.prototype.getChannel.call(client);
exports.getClientChannel = getClientChannel;

// Interceptors and Channelz
Object.defineProperty(exports, "ListenerBuilder", {
    enumerable: true,
    get: function () { return clientInterceptorsModule.ListenerBuilder; }
});

Object.defineProperty(exports, "RequesterBuilder", {
    enumerable: true,
    get: function () { return clientInterceptorsModule.RequesterBuilder; }
});

Object.defineProperty(exports, "InterceptingCall", {
    enumerable: true,
    get: function () { return clientInterceptorsModule.InterceptingCall; }
});

Object.defineProperty(exports, "InterceptorConfigurationError", {
    enumerable: true,
    get: function () { return clientInterceptorsModule.InterceptorConfigurationError; }
});

Object.defineProperty(exports, "getChannelzServiceDefinition", {
    enumerable: true,
    get: function () { return channelzModule.getChannelzServiceDefinition; }
});

Object.defineProperty(exports, "getChannelzHandlers", {
    enumerable: true,
    get: function () { return channelzModule.getChannelzHandlers; }
});

// Admin and Server Interceptors
Object.defineProperty(exports, "addAdminServicesToServer", {
    enumerable: true,
    get: function () { return adminModule.addAdminServicesToServer; }
});

Object.defineProperty(exports, "ServerListenerBuilder", {
    enumerable: true,
    get: function () { return serverInterceptorsModule.ServerListenerBuilder; }
});

Object.defineProperty(exports, "ResponderBuilder", {
    enumerable: true,
    get: function () { return serverInterceptorsModule.ResponderBuilder; }
});

Object.defineProperty(exports, "ServerInterceptingCall", {
    enumerable: true,
    get: function () { return serverInterceptorsModule.ServerInterceptingCall; }
});

exports.experimental = experimental;

// Setup resolvers and load balancers
(() => {
    resolverDns.setup();
    resolverUds.setup();
    resolverIp.setup();
    pickFirstBalancer.setup();
    roundRobinBalancer.setup();
    outlierDetectionBalancer.setup();
    channelzModule.setup();
})();
