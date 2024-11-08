"use strict";

// gRPC module setup with license header, version validation, and exports

Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");

// Dependencies and internal modules
const callCredentials = require("./call-credentials");
const channel = require("./channel");
const channelCredentials = require("./channel-credentials");
const client = require("./client");
const constants = require("./constants");
const logging = require("./logging");
const makeClient = require("./make-client");
const metadata = require("./metadata");
const server = require("./server");
const serverCredentials = require("./server-credentials");
const statusBuilder = require("./status-builder");
const clientInterceptors = require("./client-interceptors");
const experimental = require("./experimental");
const resolver = require("./resolver");
const loadBalancer = require("./load-balancer");

const supportedNodeVersions = require('../../package.json').engines.node;
if (!semver.satisfies(process.version, supportedNodeVersions)) {
    throw new Error(`@grpc/grpc-js only works on Node ${supportedNodeVersions}`);
}

// Exported gRPC components and utilities
exports.CallCredentials = callCredentials.CallCredentials;
exports.connectivityState = channel.ConnectivityState;
exports.Channel = channel.ChannelImplementation;
exports.ChannelCredentials = channelCredentials.ChannelCredentials;
exports.Client = client.Client;
exports.logVerbosity = constants.LogVerbosity;
exports.status = constants.Status;
exports.propagate = constants.Propagate;
exports.loadPackageDefinition = makeClient.loadPackageDefinition;
exports.makeClientConstructor = makeClient.makeClientConstructor;
exports.makeGenericClientConstructor = makeClient.makeClientConstructor;
exports.Metadata = metadata.Metadata;
exports.Server = server.Server;
exports.ServerCredentials = serverCredentials.ServerCredentials;
exports.StatusBuilder = statusBuilder.StatusBuilder;
exports.experimental = experimental;

// Client credentials utilities
exports.credentials = {
    combineChannelCredentials: (channelCredentials, ...callCredentials) => 
        callCredentials.reduce((acc, other) => acc.compose(other), channelCredentials),
    combineCallCredentials: (first, ...additional) => 
        additional.reduce((acc, other) => acc.compose(other), first),
    createInsecure: channelCredentials.ChannelCredentials.createInsecure,
    createSsl: channelCredentials.ChannelCredentials.createSsl,
    createFromMetadataGenerator: callCredentials.CallCredentials.createFromMetadataGenerator,
    createFromGoogleCredential: callCredentials.CallCredentials.createFromGoogleCredential,
    createEmpty: callCredentials.CallCredentials.createEmpty,
};

// Client operations
exports.closeClient = (client) => client.close();
exports.waitForClientReady = (client, deadline, callback) => 
    client.waitForReady(deadline, callback);

// Logging configuration
exports.setLogger = (logger) => logging.setLogger(logger);
exports.setLogVerbosity = (verbosity) => logging.setLoggerVerbosity(verbosity);

// Other exports
exports.getClientChannel = (client) => client.Client.prototype.getChannel.call(client);
exports.ListenerBuilder = clientInterceptors.ListenerBuilder;
exports.RequesterBuilder = clientInterceptors.RequesterBuilder;
exports.InterceptingCall = clientInterceptors.InterceptingCall;
exports.InterceptorConfigurationError = clientInterceptors.InterceptorConfigurationError;

// Initialization of resolver and load balancer mechanisms
(() => {
    resolver.registerAll();
    loadBalancer.registerAll();
})();
