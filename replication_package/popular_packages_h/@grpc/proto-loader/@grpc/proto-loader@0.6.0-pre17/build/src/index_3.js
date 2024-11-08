"use strict";

const camelCase = require("lodash.camelcase");
const Protobuf = require("protobufjs");
const descriptor = require("protobufjs/ext/descriptor");
const { loadProtosWithOptions, loadProtosWithOptionsSync, addCommonProtos } = require("./util");

Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Check if an object is a protobuf type extension.
 * @param {object} obj Target object to check.
 * @returns {boolean} True if object contains '@type' string property.
 */
function isAnyExtension(obj) {
    return ('@type' in obj) && (typeof obj['@type'] === 'string');
}
exports.isAnyExtension = isAnyExtension;

/**
 * Options for protobuf descriptor to object conversion.
 */
const descriptorOptions = {
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
    oneofs: true,
    json: true,
};

/**
 * Join base name and name with a '.' separating them.
 * @param {string} baseName Base name string.
 * @param {string} name Name string to append.
 * @returns {string} Combined name with dot separation.
 */
function joinName(baseName, name) {
    return baseName ? `${baseName}.${name}` : name;
}

/**
 * Determine if an object is a protobuf handled type (Service, Type, or Enum).
 * @param {object} obj Protobuf reflection object.
 * @returns {boolean} True if object is handled reflection.
 */
function isHandledReflectionObject(obj) {
    return (obj instanceof Protobuf.Service ||
            obj instanceof Protobuf.Type ||
            obj instanceof Protobuf.Enum);
}

/**
 * Check if an object is a Namespace or Root protobuf object.
 * @param {object} obj Protobuf object.
 * @returns {boolean} True if object is Namespace or Root.
 */
function isNamespaceBase(obj) {
    return obj instanceof Protobuf.Namespace || obj instanceof Protobuf.Root;
}

/**
 * Get all protobuf reflection objects from the root, including nested objects.
 * @param {object} obj Protobuf object.
 * @param {string} parentName The parent path name.
 * @returns {Array} Array of tuples with object names and objects.
 */
function getAllHandledReflectionObjects(obj, parentName) {
    const objName = joinName(parentName, obj.name);
    if (isHandledReflectionObject(obj)) {
        return [[objName, obj]];
    } else if (isNamespaceBase(obj) && obj.nested) {
        return Object.keys(obj.nested)
            .map(name => getAllHandledReflectionObjects(obj.nested[name], objName))
            .reduce((acc, curr) => acc.concat(curr), []);
    }
    return [];
}

/**
 * Create a deserializer function for a protobuf class.
 * @param {class} cls Protobuf class.
 * @param {object} options Protobuf options.
 * @returns {function} Deserializer function to convert buffer to object.
 */
function createDeserializer(cls, options) {
    return function deserialize(argBuf) {
        return cls.toObject(cls.decode(argBuf), options);
    };
}

/**
 * Create a serializer function for a protobuf class.
 * @param {class} cls Protobuf class.
 * @returns {function} Serializer function to convert object to buffer.
 */
function createSerializer(cls) {
    return function serialize(arg) {
        return cls.encode(cls.fromObject(arg)).finish();
    };
}

/**
 * Create a gRPC method definition based on protobuf method.
 * @param {object} method Protobuf method.
 * @param {string} serviceName Service name.
 * @param {object} options Serialization options.
 * @param {Array} fileDescriptors Protobuf file descriptors.
 * @returns {object} Method definition object.
 */
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

/**
 * Create a gRPC service definition from a protobuf service.
 * @param {object} service Protobuf service.
 * @param {string} name Service name.
 * @param {object} options Serialization options.
 * @param {Array} fileDescriptors Protobuf file descriptors.
 * @returns {object} Service definition object.
 */
function createServiceDefinition(service, name, options, fileDescriptors) {
    const def = {};
    for (const method of service.methodsArray) {
        def[method.name] = createMethodDefinition(method, name, options, fileDescriptors);
    }
    return def;
}

/**
 * Create a message definition object from a protobuf message.
 * @param {object} message Protobuf message.
 * @param {Array} fileDescriptors Protobuf file descriptors.
 * @returns {object} Message definition object.
 */
function createMessageDefinition(message, fileDescriptors) {
    const messageDescriptor = message.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 DescriptorProto',
        type: messageDescriptor.$type.toObject(messageDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

/**
 * Create an enum definition object from a protobuf enum.
 * @param {object} enumType Protobuf enum.
 * @param {Array} fileDescriptors Protobuf file descriptors.
 * @returns {object} Enum definition object.
 */
function createEnumDefinition(enumType, fileDescriptors) {
    const enumDescriptor = enumType.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 EnumDescriptorProto',
        type: enumDescriptor.$type.toObject(enumDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

/**
 * Create definitions based on protobuf object type (Service, Type, Enum).
 * @param {object} obj Protobuf object (Service, Type, Enum).
 * @param {string} name Object name.
 * @param {object} options Serialization options.
 * @param {Array} fileDescriptors Protobuf file descriptors.
 * @returns {object} Definition object.
 */
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

/**
 * Create gRPC package definition based on protobuf root and options.
 * @param {object} root Protobuf root object.
 * @param {object} options Serialization options.
 * @returns {object} Package definition object.
 */
function createPackageDefinition(root, options) {
    const def = {};
    root.resolveAll();
    const descriptorList = root.toDescriptor('proto3').file;
    const bufferList = descriptorList.map(value => 
        Buffer.from(descriptor.FileDescriptorProto.encode(value).finish())
    );
    for (const [name, obj] of getAllHandledReflectionObjects(root, '')) {
        def[name] = createDefinition(obj, name, options, bufferList);
    }
    return def;
}

/**
 * Load a .proto file and return the gRPC package definition.
 * @param {string|string[]} filename File or files to load.
 * @param {object} options Protobuf loading options.
 * @returns {Promise<object>} Promise resolving to package definition.
 */
function load(filename, options) {
    return loadProtosWithOptions(filename, options)
        .then(loadedRoot => createPackageDefinition(loadedRoot, options));
}
exports.load = load;

/**
 * Synchronously load a .proto file and return the gRPC package definition.
 * @param {string|string[]} filename File or files to load.
 * @param {object} options Protobuf loading options.
 * @returns {object} Package definition object.
 */
function loadSync(filename, options) {
    const loadedRoot = loadProtosWithOptionsSync(filename, options);
    return createPackageDefinition(loadedRoot, options);
}
exports.loadSync = loadSync;

// Add common protobuf definitions to the environment
addCommonProtos();
