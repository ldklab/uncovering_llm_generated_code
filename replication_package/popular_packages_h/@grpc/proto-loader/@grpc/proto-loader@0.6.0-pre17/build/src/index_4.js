"use strict";

const camelCase = require("lodash.camelcase");
const Protobuf = require("protobufjs");
const descriptor = require("protobufjs/ext/descriptor");
const util = require("./util");

function isAnyExtension(obj) {
    return ('@type' in obj) && (typeof obj['@type'] === 'string');
}
exports.isAnyExtension = isAnyExtension;

const descriptorOptions = {
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
    oneofs: true,
    json: true,
};

function joinName(baseName, name) {
    return baseName ? `${baseName}.${name}` : name;
}

function isHandledReflectionObject(obj) {
    return obj instanceof Protobuf.Service || obj instanceof Protobuf.Type || obj instanceof Protobuf.Enum;
}

function isNamespaceBase(obj) {
    return obj instanceof Protobuf.Namespace || obj instanceof Protobuf.Root;
}

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

function createDeserializer(cls, options) {
    return function deserialize(argBuf) {
        return cls.toObject(cls.decode(argBuf), options);
    };
}

function createSerializer(cls) {
    return function serialize(arg) {
        const message = cls.fromObject(arg);
        return cls.encode(message).finish();
    };
}

function createMethodDefinition(method, serviceName, options, fileDescriptors) {
    const requestType = method.resolvedRequestType;
    const responseType = method.resolvedResponseType;

    return {
        path: `/${serviceName}/${method.name}`,
        requestStream: Boolean(method.requestStream),
        responseStream: Boolean(method.responseStream),
        requestSerialize: createSerializer(requestType),
        requestDeserialize: createDeserializer(requestType, options),
        responseSerialize: createSerializer(responseType),
        responseDeserialize: createDeserializer(responseType, options),
        originalName: camelCase(method.name),
        requestType: createMessageDefinition(requestType, fileDescriptors),
        responseType: createMessageDefinition(responseType, fileDescriptors),
    };
}

function createServiceDefinition(service, name, options, fileDescriptors) {
    return service.methodsArray.reduce((def, method) => {
        def[method.name] = createMethodDefinition(method, name, options, fileDescriptors);
        return def;
    }, {});
}

function createMessageDefinition(message, fileDescriptors) {
    const messageDescriptor = message.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 DescriptorProto',
        type: messageDescriptor.$type.toObject(messageDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

function createEnumDefinition(enumType, fileDescriptors) {
    const enumDescriptor = enumType.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 EnumDescriptorProto',
        type: enumDescriptor.$type.toObject(enumDescriptor, descriptorOptions),
        fileDescriptorProtos: fileDescriptors,
    };
}

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

function createPackageDefinition(root, options) {
    const def = {};
    root.resolveAll();
    const descriptorList = root.toDescriptor('proto3').file;
    const bufferList = descriptorList.map(val => Buffer.from(descriptor.FileDescriptorProto.encode(val).finish()));
    
    for (const [name, obj] of getAllHandledReflectionObjects(root, '')) {
        def[name] = createDefinition(obj, name, options, bufferList);
    }
    return def;
}

function load(filename, options) {
    return util.loadProtosWithOptions(filename, options).then(loadedRoot => {
        return createPackageDefinition(loadedRoot, options);
    });
}
exports.load = load;

function loadSync(filename, options) {
    const loadedRoot = util.loadProtosWithOptionsSync(filename, options);
    return createPackageDefinition(loadedRoot, options);
}
exports.loadSync = loadSync;

util.addCommonProtos();