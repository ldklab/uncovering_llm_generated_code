"use strict";
/*
 * Copyright 2019 gRPC authors.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Object.defineProperty(exports, "__esModule", { value: true });

const {
  CallCredentials,
  createFromMetadataGenerator,
  createFromGoogleCredential,
  createEmpty
} = require("./call-credentials");
const { ChannelImplementation: Channel } = require("./channel");
const { CompressionAlgorithms: compressionAlgorithms } = require("./compression-algorithms");
const { ConnectivityState: connectivityState } = require("./connectivity-state");
const {
  ChannelCredentials,
  createInsecure,
  createSsl,
  createFromSecureContext
} = require("./channel-credentials");
const { Client } = require("./client");
const {
  LogVerbosity: logVerbosity,
  Status: status,
  Propagate: propagate
} = require("./constants");
const logging = require("./logging");
const {
  loadPackageDefinition,
  makeClientConstructor
} = require("./make-client");
const { Metadata } = require("./metadata");
const { Server } = require("./server");
const { ServerCredentials } = require("./server-credentials");
const { StatusBuilder } = require("./status-builder");
const {
  ListenerBuilder,
  RequesterBuilder,
  InterceptingCall,
  InterceptorConfigurationError
} = require("./client-interceptors");
const { 
  getChannelzServiceDefinition, 
  getChannelzHandlers 
} = require("./channelz");
const { addAdminServicesToServer } = require("./admin");
const {
  ServerListenerBuilder,
  ResponderBuilder,
  ServerInterceptingCall
} = require("./server-interceptors");
const experimental = require("./experimental");

const resolver_dns = require("./resolver-dns");
const resolver_uds = require("./resolver-uds");
const resolver_ip = require("./resolver-ip");
const load_balancer_pick_first = require("./load-balancer-pick-first");
const load_balancer_round_robin = require("./load-balancer-round-robin");
const load_balancer_outlier_detection = require("./load-balancer-outlier-detection");
const channelz = require("./channelz");

// Export paths
exports.CallCredentials = CallCredentials;
exports.Channel = Channel;
exports.compressionAlgorithms = compressionAlgorithms;
exports.connectivityState = connectivityState;
exports.ChannelCredentials = ChannelCredentials;
exports.Client = Client;
exports.logVerbosity = logVerbosity;
exports.status = status;
exports.propagate = propagate;
exports.loadPackageDefinition = loadPackageDefinition;
exports.makeClientConstructor = makeClientConstructor;
exports.Metadata = Metadata;
exports.Server = Server;
exports.ServerCredentials = ServerCredentials;
exports.StatusBuilder = StatusBuilder;
exports.ListenerBuilder = ListenerBuilder;
exports.RequesterBuilder = RequesterBuilder;
exports.InterceptingCall = InterceptingCall;
exports.InterceptorConfigurationError = InterceptorConfigurationError;
exports.getChannelzServiceDefinition = getChannelzServiceDefinition;
exports.getChannelzHandlers = getChannelzHandlers;
exports.addAdminServicesToServer = addAdminServicesToServer;
exports.ServerListenerBuilder = ServerListenerBuilder;
exports.ResponderBuilder = ResponderBuilder;
exports.ServerInterceptingCall = ServerInterceptingCall;
exports.experimental = experimental;

// Credentials exports
exports.credentials = {
  combineChannelCredentials: (channelCredentials, ...callCredentials) => {
    return callCredentials.reduce((acc, other) => acc.compose(other), channelCredentials);
  },
  combineCallCredentials: (first, ...additional) => {
    return additional.reduce((acc, other) => acc.compose(other), first);
  },
  createInsecure,
  createSsl,
  createFromSecureContext,
  createFromMetadataGenerator,
  createFromGoogleCredential,
  createEmpty,
};

// Client utility functions
const closeClient = client => client.close();
exports.closeClient = closeClient;

const waitForClientReady = (client, deadline, callback) => {
  client.waitForReady(deadline, callback);
};
exports.waitForClientReady = waitForClientReady;

// Unavailable functions
const loadObject = () => {
  throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};
exports.loadObject = loadObject;

const load = () => {
  throw new Error('Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead');
};
exports.load = load;

// Logger configuration
const setLogger = logger => {
  logging.setLogger(logger);
};
exports.setLogger = setLogger;

const setLogVerbosity = verbosity => {
  logging.setLoggerVerbosity(verbosity);
};
exports.setLogVerbosity = setLogVerbosity;

// Client channel retrieval
const getClientChannel = client => {
  return Client.prototype.getChannel.call(client);
};
exports.getClientChannel = getClientChannel;

// Run setup functions on module initialization
(() => {
  resolver_dns.setup();
  resolver_uds.setup();
  resolver_ip.setup();
  load_balancer_pick_first.setup();
  load_balancer_round_robin.setup();
  load_balancer_outlier_detection.setup();
  channelz.setup();
})();
