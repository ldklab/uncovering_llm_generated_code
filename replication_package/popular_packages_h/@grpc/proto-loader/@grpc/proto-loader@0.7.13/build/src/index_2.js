"use strict";

// Import required libraries
const camelCase = require("lodash.camelcase");
const Protobuf = require("protobufjs");
const descriptor = require("protobufjs/ext/descriptor");
const util_1 = require("./util");
const Long = require("long");

// Exporting the Long module
exports.Long = Long;

// Function to check if an object is an any-typed extension
function isAnyExtension(obj) {
    return ('@type' in obj) && (typeof obj['@type'] === 'string');
}
exports.isAnyExtension = isAnyExtension;

// Define IdempotencyLevel enumeration
var IdempotencyLevel;
(function (IdempotencyLevel) {
    IdempotencyLevel["IDEMPOTENCY_UNKNOWN"] = "IDEMPOTENCY_UNKNOWN";
    IdempotencyLevel["NO_SIDE_EFFECTS"] = "NO_SIDE_EFFECTS";
    IdempotencyLevel["IDEMPOTENT"] = "IDEMPOTENT";
})(IdempotencyLevel = exports.IdempotencyLevel || (exports.IdempotencyLevel = {}));

// Define descriptor options for converting Protocol Buffers objects
const descriptorOptions = {
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
    oneofs: true,
    json: true,
};

// Helper function to join names with a period
function joinName(baseName, name) {
    return baseName === '' ? name : `${baseName}.${name}`;
}

// Determine if the given object is a recognized Protobuf object
function isHandledReflectionObject(obj) {
    return (obj instanceof Protobuf.Service ||
            obj instanceof Protobuf.Type ||
            obj instanceof Protobuf.Enum);
}

// Determine if the given object is a namespace or root
function isNamespaceBase(obj) {
    return obj instanceof Protobuf.Namespace || obj instanceof Protobuf.Root;
}

// Recursively gather all handled reflection objects from a namespace or root object
function getAllHandledReflectionObjects(obj, parentName) {
    const objName = joinName(parentName, obj.name);
    if (isHandledReflectionObject(obj)) {
        return [[objName, obj]];
    } else if (isNamespaceBase(obj) && obj.nested) {
        return Object.keys(obj.nested)
            .map(name => getAllHandledReflectionObjects(obj.nested[name], objName))
            .reduce((acc, val) => acc.concat(val), []);
    }
    return [];
}

// Create a deserializer for a given protobuf type and options
function createDeserializer(cls, options) {
    return function deserialize(argBuf) {
        return cls.toObject(cls.decode(argBuf), options);
    };
}

// Create a serializer for a given protobuf type
function createSerializer(cls) {
    return function serialize(arg) {
        if (Array.isArray(arg)) {
            throw new Error(`Failed to serialize message: expected object with ${cls.name} structure, got array instead`);
        }
        const message = cls.fromObject(arg);
        return cls.encode(message).finish();
    };
}

// Map options from protobuf method options
function mapMethodOptions(options) {
    return (options || []).reduce((obj, item) => {
        for (const [key, value] of Object.entries(item)) {
            if (key === 'uninterpreted_option') {
                obj.uninterpreted_option.push(item.uninterpreted_option);
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }, {
        deprecated: false,
        idempotency_level: IdempotencyLevel.IDEMPOTENCY_UNKNOWN,
        uninterpreted_option: [],
    });
}

// Create method definition from protobuf service method
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
        options: mapMethodOptions(method.parsedOptions),
    };
}

// Create a service definition from a protobuf service
function createServiceDefinition(service, name, options, fileDescriptors) {
    const def = {};
    for (const method of service.methodsArray) {
        def[method.name] = createMethodDefinition(method, name, options, fileDescriptors);
    }
    return def;
}

// Create a message type definition from a protobuf message
function createMessageDefinition(message, fileDescriptors) {
    const messageDescriptor = message.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 DescriptorProto',
        type: messageDescriptor.$type.toObject(messageDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

// Create an enum type definition from a protobuf enum
function createEnumDefinition(enumType, fileDescriptors) {
    const enumDescriptor = enumType.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 EnumDescriptorProto',
        type: enumDescriptor.$type.toObject(enumDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

// Create a definition for a given protobuf object
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

// Create a package definition from a protobuf root object
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

// Create a package definition from a decoded file descriptor set
function createPackageDefinitionFromDescriptorSet(decodedDescriptorSet, options) {
    options = options || {};
    const root = Protobuf.Root.fromDescriptor(decodedDescriptorSet);
    root.resolveAll();
    return createPackageDefinition(root, options);
}

// Load a .proto file asynchronously with specified options
function load(filename, options) {
    return (0, util_1.loadProtosWithOptions)(filename, options).then(loadedRoot => {
        return createPackageDefinition(loadedRoot, options);
    });
}
exports.load = load;

// Load a .proto file synchronously with specified options
function loadSync(filename, options) {
    const loadedRoot = (0, util_1.loadProtosWithOptionsSync)(filename, options);
    return createPackageDefinition(loadedRoot, options);
}
exports.loadSync = loadSync;

// Create a package definition from JSON
function fromJSON(json, options) {
    options = options || {};
    const loadedRoot = Protobuf.Root.fromJSON(json);
    loadedRoot.resolveAll();
    return createPackageDefinition(loadedRoot, options);
}
exports.fromJSON = fromJSON;

// Load a descriptor set from buffer and create a package definition
function loadFileDescriptorSetFromBuffer(descriptorSet, options) {
    const decodedDescriptorSet = descriptor.FileDescriptorSet.decode(descriptorSet);
    return createPackageDefinitionFromDescriptorSet(decodedDescriptorSet, options);
}
exports.loadFileDescriptorSetFromBuffer = loadFileDescriptorSetFromBuffer;

// Load a descriptor set from an object and create a package definition
function loadFileDescriptorSetFromObject(descriptorSet, options) {
    const decodedDescriptorSet = descriptor.FileDescriptorSet.fromObject(descriptorSet);
    return createPackageDefinitionFromDescriptorSet(decodedDescriptorSet, options);
}
exports.loadFileDescriptorSetFromObject = loadFileDescriptorSetFromObject;

// Add common protobuf types to the registry
(0, util_1.addCommonProtos)();
