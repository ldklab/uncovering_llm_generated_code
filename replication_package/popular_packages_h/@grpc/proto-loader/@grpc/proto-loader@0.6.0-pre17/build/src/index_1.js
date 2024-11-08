"use strict";

const camelCase = require("lodash.camelcase");
const Protobuf = require("protobufjs");
const descriptor = require("protobufjs/ext/descriptor");
const { loadProtosWithOptions, loadProtosWithOptionsSync, addCommonProtos } = require("./util");

// Function to check if an object is an "Any" extension
function isAnyExtension(obj) {
    return ('@type' in obj) && (typeof obj['@type'] === 'string');
}
exports.isAnyExtension = isAnyExtension;

// Options for the descriptor
const descriptorOptions = {
    longs: String, enums: String, bytes: String,
    defaults: true, oneofs: true, json: true,
};

// Utility function to join protobuf names
function joinName(baseName, name) {
    return baseName ? `${baseName}.${name}` : name;
}

// Check if object is a handled Protobuf reflection type
function isHandledReflectionObject(obj) {
    return (obj instanceof Protobuf.Service ||
            obj instanceof Protobuf.Type ||
            obj instanceof Protobuf.Enum);
}

// Check if object is a base namespace
function isNamespaceBase(obj) {
    return obj instanceof Protobuf.Namespace || obj instanceof Protobuf.Root;
}

// Recursively collect all handled reflection objects
function getAllHandledReflectionObjects(obj, parentName) {
    const objName = joinName(parentName, obj.name);
    if (isHandledReflectionObject(obj)) {
        return [[objName, obj]];
    } else if (isNamespaceBase(obj) && obj.nested) {
        return Object.values(obj.nested)
            .flatMap(nestedObj => getAllHandledReflectionObjects(nestedObj, objName));
    }
    return [];
}

// Create deserializer function for a class
function createDeserializer(cls, options) {
    return argBuf => cls.toObject(cls.decode(argBuf), options);
}

// Create serializer function for a class
function createSerializer(cls) {
    return arg => cls.encode(cls.fromObject(arg)).finish();
}

// Create method definition for gRPC service
function createMethodDefinition(method, serviceName, options, fileDescriptors) {
    const requestType = method.resolvedRequestType;
    const responseType = method.resolvedResponseType;
    return {
        path: `/${serviceName}/${method.name}`,
        requestStream: !!method.requestStream,
        responseStream: !!method.responseStream,
        requestSerialize: createSerializer(requestType),
        requestDeserialize: createDeserializer(requestType, options),
        responseSerialize: createSerializer(responseType),
        responseDeserialize: createDeserializer(responseType, options),
        originalName: camelCase(method.name),
        requestType: createMessageDefinition(requestType, fileDescriptors),
        responseType: createMessageDefinition(responseType, fileDescriptors),
    };
}

// Create service definition from Protobuf Service object
function createServiceDefinition(service, name, options, fileDescriptors) {
    return Object.fromEntries(service.methodsArray.map(method => [
        method.name, createMethodDefinition(method, name, options, fileDescriptors)
    ]));
}

// Create message definition from Protobuf Type object
function createMessageDefinition(message, fileDescriptors) {
    const messageDescriptor = message.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 DescriptorProto',
        type: messageDescriptor.$type.toObject(messageDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

// Create enum definition from Protobuf Enum object
function createEnumDefinition(enumType, fileDescriptors) {
    const enumDescriptor = enumType.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 EnumDescriptorProto',
        type: enumDescriptor.$type.toObject(enumDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

// Create definition of a Protobuf reflection object
function createDefinition(obj, name, options, fileDescriptors) {
    if (obj instanceof Protobuf.Service) {
        return createServiceDefinition(obj, name, options, fileDescriptors);
    } else if (obj instanceof Protobuf.Type) {
        return createMessageDefinition(obj, fileDescriptors);
    } else if (obj instanceof Protobuf.Enum) {
        return createEnumDefinition(obj, fileDescriptors);
    } else {
        throw new Error('Type mismatch in reflection object handling');
    }
}

// Create package definition from Protobuf Root object
function createPackageDefinition(root, options) {
    const def = {};
    root.resolveAll();
    const descriptorList = root.toDescriptor('proto3').file;
    const bufferList = descriptorList.map(value => Buffer.from(descriptor.FileDescriptorProto.encode(value).finish()));
    for (const [name, obj] of getAllHandledReflectionObjects(root, '')) {
        def[name] = createDefinition(obj, name, options, bufferList);
    }
    return def;
}

// Load a .proto file asynchronously with the given options
function load(filename, options) {
    return loadProtosWithOptions(filename, options).then(loadedRoot =>
        createPackageDefinition(loadedRoot, options)
    );
}
exports.load = load;

// Load a .proto file synchronously with the given options
function loadSync(filename, options) {
    const loadedRoot = loadProtosWithOptionsSync(filename, options);
    return createPackageDefinition(loadedRoot, options);
}
exports.loadSync = loadSync;

// Add common Protos
addCommonProtos();
