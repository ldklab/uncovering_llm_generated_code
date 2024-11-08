"use strict";

/**
 * @license
 * 
 * This code handles the management and serialization/deserialization of gRPC Protocol Buffers.
 * It's specifically tailored for loading Protocol Buffer definitions, creating gRPC service and method definitions,
 * and converting Protocol Buffers to and from JavaScript objects.
 */

const camelCase = require("lodash.camelcase");
const Protobuf = require("protobufjs");
const descriptor = require("protobufjs/ext/descriptor");
const util = require("./util");

// Validates if an object has a '@type' string indicating it's an extended protobuf
function isAnyExtension(obj) {
    return ('@type' in obj) && (typeof obj['@type'] === 'string');
}
exports.isAnyExtension = isAnyExtension;

// Options for converting descriptor to objects
const descriptorOptions = {
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
    oneofs: true,
    json: true,
};

// Concatenates or constructs full object names for protobuf definitions
function joinName(baseName, name) {
    return baseName === '' ? name : `${baseName}.${name}`;
}

// Checks if an object is a reflection object that can be handled
function isHandledReflectionObject(obj) {
    return (obj instanceof Protobuf.Service ||
            obj instanceof Protobuf.Type ||
            obj instanceof Protobuf.Enum);
}

// Verifies if an object is a Namespace or Root, which can contain nested definitions
function isNamespaceBase(obj) {
    return obj instanceof Protobuf.Namespace || obj instanceof Protobuf.Root;
}

// Recursively retrieves all reflection objects that are handled
function getAllHandledReflectionObjects(obj, parentName) {
    const objName = joinName(parentName, obj.name);
    if (isHandledReflectionObject(obj)) {
        return [[objName, obj]];
    } else if (isNamespaceBase(obj) && obj.nested) {
        return Object.keys(obj.nested)
            .flatMap(name => getAllHandledReflectionObjects(obj.nested[name], objName));
    }
    return [];
}

// Returns a function to deserialize a Buffer into a specific message class instance
function createDeserializer(cls, options) {
    return (argBuf) => cls.toObject(cls.decode(argBuf), options);
}

// Returns a function to serialize a specific message class object into a Buffer
function createSerializer(cls) {
    return (arg) => cls.encode(cls.fromObject(arg)).finish();
}

// Creates a gRPC method definition, including paths, types, and serialization/parser functions
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

// Generates method definitions for a given service within the gRPC framework
function createServiceDefinition(service, name, options, fileDescriptors) {
    const def = {};
    for (const method of service.methodsArray) {
        def[method.name] = createMethodDefinition(method, name, options, fileDescriptors);
    }
    return def;
}

// Generates a message definition object for a protobuf message
function createMessageDefinition(message, fileDescriptors) {
    const messageDescriptor = message.toDescriptor('proto3');
    
    return {
        format: 'Protocol Buffer 3 DescriptorProto',
        type: messageDescriptor.$type.toObject(messageDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

// Generates an enum definition object for a protobuf enum
function createEnumDefinition(enumType, fileDescriptors) {
    const enumDescriptor = enumType.toDescriptor('proto3');
    
    return {
        format: 'Protocol Buffer 3 EnumDescriptorProto',
        type: enumDescriptor.$type.toObject(enumDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

// Determines definition creation based on the object type (Service, Type, Enum)
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

// Constructs package definitions by resolving and converting all associated objects in a root
function createPackageDefinition(root, options) {
    root.resolveAll();
    
    const descriptorList = root.toDescriptor('proto3').file;
    const bufferList = descriptorList.map(value => Buffer.from(
        descriptor.FileDescriptorProto.encode(value).finish()));

    const def = {};
    for (const [name, obj] of getAllHandledReflectionObjects(root, '')) {
        def[name] = createDefinition(obj, name, options, bufferList);
    }
    
    return def;
}

// Asynchronously loads .proto files, resolves them, and returns a package definition
function load(filename, options) {
    return util.loadProtosWithOptions(filename, options)
        .then(loadedRoot => createPackageDefinition(loadedRoot, options));
}
exports.load = load;

// Synchronously loads .proto files, resolves them, and returns a package definition
function loadSync(filename, options) {
    const loadedRoot = util.loadProtosWithOptionsSync(filename, options);
    return createPackageDefinition(loadedRoot, options);
}
exports.loadSync = loadSync;

// Adds common protobuf files to the environment
util.addCommonProtos();
