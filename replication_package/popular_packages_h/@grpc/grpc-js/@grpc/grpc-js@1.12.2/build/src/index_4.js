"use strict";

/*
 * Copyright 2019 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

Object.defineProperty(exports, "__esModule", { value: true });

// Import and export from call-credentials
const { CallCredentials } = require("./call-credentials");
exports.CallCredentials = CallCredentials;

// Import and export from channel
const { ChannelImplementation: Channel } = require("./channel");
exports.Channel = Channel;

// Other imports and exports
const { CompressionAlgorithms } = require("./compression-algorithms");
exports.compressionAlgorithms = CompressionAlgorithms;

const { ConnectivityState } = require("./connectivity-state");
exports.connectivityState = ConnectivityState;

const { ChannelCredentials } = require("./channel-credentials");
exports.ChannelCredentials = ChannelCredentials;

const { Client } = require("./client");
exports.Client = Client;

const { LogVerbosity, Status, Propagate } = require("./constants");
exports.logVerbosity = LogVerbosity;
exports.status = Status;
exports.propagate = Propagate;

const logging = require("./logging");
const { loadPackageDefinition, makeClientConstructor } = require("./make-client");
exports.loadPackageDefinition = loadPackageDefinition;
exports.makeClientConstructor = makeClientConstructor;
exports.makeGenericClientConstructor = makeClientConstructor;

const { Metadata } = require("./metadata");
exports.Metadata = Metadata;

const { Server } = require("./server");
exports.Server = Server;

const { ServerCredentials } = require("./server-credentials");
exports.ServerCredentials = ServerCredentials;

const { StatusBuilder } = require("./status-builder");
exports.StatusBuilder = StatusBuilder;

// Credentials manipulation and creation functions
exports.credentials = {
    combineChannelCredentials: (channelCredentials, ...callCredentials) => {
        return callCredentials.reduce((acc, other) => acc.compose(other), channelCredentials);
    },
    combineCallCredentials: (first, ...additional) => {
        return additional.reduce((acc, other) => acc.compose(other), first);
    },
    createInsecure: ChannelCredentials.createInsecure,
    createSsl: ChannelCredentials.createSsl,
    createFromSecureContext: ChannelCredentials.createFromSecureContext,
    createFromMetadataGenerator: CallCredentials.createFromMetadataGenerator,
    createFromGoogleCredential: CallCredentials.createFromGoogleCredential,
    createEmpty: CallCredentials.createEmpty,
};

// Client operations
exports.closeClient = (client) => client.close();
exports.waitForClientReady = (client, deadline, callback) => client.waitForReady(deadline, callback);

// Unimplemented stubs
exports.loadObject = (value, options) => {
    throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};
exports.load = (filename, format, options) => {
    throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};

// Logger and Verbosity
exports.setLogger = (logger) => logging.setLogger(logger);
exports.setLogVerbosity = (verbosity) => logging.setLoggerVerbosity(verbosity);

// Retrieve Client Channel
exports.getClientChannel = (client) => {
    return Client.prototype.getChannel.call(client);
};

// Interceptors export
const { ListenerBuilder, RequesterBuilder, InterceptingCall, InterceptorConfigurationError } = require("./client-interceptors");
exports.ListenerBuilder = ListenerBuilder;
exports.RequesterBuilder = RequesterBuilder;
exports.InterceptingCall = InterceptingCall;
exports.InterceptorConfigurationError = InterceptorConfigurationError;

// Channelz-related exports
const { getChannelzServiceDefinition, getChannelzHandlers } = require("./channelz");
exports.getChannelzServiceDefinition = getChannelzServiceDefinition;
exports.getChannelzHandlers = getChannelzHandlers;

// Admin services
const { addAdminServicesToServer } = require("./admin");
exports.addAdminServicesToServer = addAdminServicesToServer;

// Server interceptors export
const { ServerListenerBuilder, ResponderBuilder, ServerInterceptingCall } = require("./server-interceptors");
exports.ServerListenerBuilder = ServerListenerBuilder;
exports.ResponderBuilder = ResponderBuilder;
exports.ServerInterceptingCall = ServerInterceptingCall;

// Experimental features
const experimental = require("./experimental");
exports.experimental = experimental;

// Internal resolver and load balancer setup
const resolver_dns = require("./resolver-dns");
const resolver_uds = require("./resolver-uds");
const resolver_ip = require("./resolver-ip");
const load_balancer_pick_first = require("./load-balancer-pick-first");
const load_balancer_round_robin = require("./load-balancer-round-robin");
const load_balancer_outlier_detection = require("./load-balancer-outlier-detection");
const channelz = require("./channelz");

(() => {
    resolver_dns.setup();
    resolver_uds.setup();
    resolver_ip.setup();
    load_balancer_pick_first.setup();
    load_balancer_round_robin.setup();
    load_balancer_outlier_detection.setup();
    channelz.setup();
})();