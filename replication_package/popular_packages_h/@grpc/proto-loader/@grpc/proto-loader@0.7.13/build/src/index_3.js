"use strict";
/**
 * @license Apache-2.0
 */
const camelCase = require("lodash.camelcase");
const Protobuf = require("protobufjs");
const descriptor = require("protobufjs/ext/descriptor");
const util_1 = require("./util");
const Long = require("long");
exports.Long = Long;

function isAnyExtension(obj) {
    return obj['@type'] !== undefined && typeof obj['@type'] === 'string';
}
exports.isAnyExtension = isAnyExtension;

var IdempotencyLevel;
(function (IdempotencyLevel) {
    IdempotencyLevel["IDEMPOTENCY_UNKNOWN"] = "IDEMPOTENCY_UNKNOWN";
    IdempotencyLevel["NO_SIDE_EFFECTS"] = "NO_SIDE_EFFECTS";
    IdempotencyLevel["IDEMPOTENT"] = "IDEMPOTENT";
})(IdempotencyLevel = exports.IdempotencyLevel || (exports.IdempotencyLevel = {}));

const descriptorOptions = {
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
    oneofs: true,
    json: true,
};

function joinName(baseName, name) {
    return baseName ? baseName + '.' + name : name;
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
        return Object.keys(obj.nested)
            .map(name => getAllHandledReflectionObjects(obj.nested[name], objName))
            .reduce((acc, curr) => acc.concat(curr), []);
    }
    return [];
}

function createDeserializer(cls, options) {
    return (argBuf) => cls.toObject(cls.decode(argBuf), options);
}

function createSerializer(cls) {
    return (arg) => {
        if (Array.isArray(arg)) {
            throw new Error(`Expected object structure for ${cls.name}, got array`);
        }
        return cls.encode(cls.fromObject(arg)).finish();
    };
}

function mapMethodOptions(options) {
    return (options || []).reduce((obj, item) => {
        Object.entries(item).forEach(([key, value]) => {
            if (key === 'uninterpreted_option') obj.uninterpreted_option.push(item.uninterpreted_option);
            else obj[key] = value;
        });
        return obj;
    }, { deprecated: false, idempotency_level: IdempotencyLevel.IDEMPOTENCY_UNKNOWN, uninterpreted_option: [] });
}

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

function createServiceDefinition(service, name, options, fileDescriptors) {
    const def = {};
    for (const method of service.methodsArray) {
        def[method.name] = createMethodDefinition(method, name, options, fileDescriptors);
    }
    return def;
}

function createMessageDefinition(message, fileDescriptors) {
    const descriptorProto = message.toDescriptor('proto3');
    return {
        format: 'Protocol Buffer 3 DescriptorProto',
        type: descriptorProto.$type.toObject(descriptorProto, descriptorOptions),
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
        throw new Error('Unhandled reflection object type');
    }
}

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

function createPackageDefinitionFromDescriptorSet(decodedDescriptorSet, options) {
    const root = Protobuf.Root.fromDescriptor(decodedDescriptorSet);
    root.resolveAll();
    return createPackageDefinition(root, options);
}

function load(filename, options) {
    return (0, util_1.loadProtosWithOptions)(filename, options).then(loadedRoot => createPackageDefinition(loadedRoot, options));
}
exports.load = load;

function loadSync(filename, options) {
    const loadedRoot = (0, util_1.loadProtosWithOptionsSync)(filename, options);
    return createPackageDefinition(loadedRoot, options);
}
exports.loadSync = loadSync;

function fromJSON(json, options) {
    const root = Protobuf.Root.fromJSON(json);
    root.resolveAll();
    return createPackageDefinition(root, options);
}
exports.fromJSON = fromJSON;

function loadFileDescriptorSetFromBuffer(descriptorSet, options) {
    const decodedDescriptorSet = descriptor.FileDescriptorSet.decode(descriptorSet);
    return createPackageDefinitionFromDescriptorSet(decodedDescriptorSet, options);
}
exports.loadFileDescriptorSetFromBuffer = loadFileDescriptorSetFromBuffer;

function loadFileDescriptorSetFromObject(descriptorSet, options) {
    const decodedDescriptorSet = descriptor.FileDescriptorSet.fromObject(descriptorSet);
    return createPackageDefinitionFromDescriptorSet(decodedDescriptorSet, options);
}
exports.loadFileDescriptorSetFromObject = loadFileDescriptorSetFromObject;

(0, util_1.addCommonProtos)();
