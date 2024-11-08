"use strict";

const semver = require("semver");
const { CallCredentials } = require("./call-credentials");
const { ConnectivityState, ChannelImplementation } = require("./channel");
const { ChannelCredentials } = require("./channel-credentials");
const { Client } = require("./client");
const { LogVerbosity, Status, Propagate } = require("./constants");
const logging = require("./logging");
const { loadPackageDefinition, makeClientConstructor } = require("./make-client");
const { Metadata } = require("./metadata");
const { Server } = require("./server");
const { ServerCredentials } = require("./server-credentials");
const { StatusBuilder } = require("./status-builder");
const supportedNodeVersions = require('../../package.json').engines.node;
const { ListenerBuilder, RequesterBuilder, InterceptingCall, InterceptorConfigurationError } = require("./client-interceptors");
const experimental = require("./experimental");
const resolver = require("./resolver");
const load_balancer = require("./load-balancer");

if (!semver.satisfies(process.version, supportedNodeVersions)) {
    throw new Error(`@grpc/grpc-js only works on Node ${supportedNodeVersions}`);
}

exports.connectivityState = ConnectivityState;
exports.Channel = ChannelImplementation;
exports.credentials = {
    combineChannelCredentials: (channelCredentials, ...callCredentials) => 
        callCredentials.reduce((acc, other) => acc.compose(other), channelCredentials),
    combineCallCredentials: (first, ...additional) => 
        additional.reduce((acc, other) => acc.compose(other), first),
    createInsecure: ChannelCredentials.createInsecure,
    createSsl: ChannelCredentials.createSsl,
    createFromMetadataGenerator: CallCredentials.createFromMetadataGenerator,
    createFromGoogleCredential: CallCredentials.createFromGoogleCredential,
    createEmpty: CallCredentials.createEmpty,
};

exports.logVerbosity = LogVerbosity;
exports.status = Status;
exports.propagate = Propagate;
exports.Client = Client;
exports.loadPackageDefinition = loadPackageDefinition;
exports.makeClientConstructor = makeClientConstructor;
exports.makeGenericClientConstructor = makeClientConstructor; 
exports.Metadata = Metadata;
exports.Server = Server;
exports.ServerCredentials = ServerCredentials;
exports.StatusBuilder = StatusBuilder;

exports.closeClient = (client) => client.close();
exports.waitForClientReady = (client, deadline, callback) => client.waitForReady(deadline, callback);

exports.loadObject = (value, options) => {
    throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};
exports.load = (filename, format, options) => {
    throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};

exports.setLogger = (logger) => logging.setLogger(logger);
exports.setLogVerbosity = (verbosity) => logging.setLoggerVerbosity(verbosity);

exports.getClientChannel = (client) => Client.prototype.getChannel.call(client);

exports.ListenerBuilder = ListenerBuilder;
exports.RequesterBuilder = RequesterBuilder;
exports.InterceptingCall = InterceptingCall;
exports.InterceptorConfigurationError = InterceptorConfigurationError;

exports.experimental = experimental;

(() => {
    resolver.registerAll();
    load_balancer.registerAll();
})();
