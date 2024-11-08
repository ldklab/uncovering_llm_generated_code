const protobuf = require('protobufjs');

// Load and process .proto files
async function loadProtoFile() {
  try {
    const root = await protobuf.load("awesome.proto");
    const AwesomeMessage = root.lookupType("awesomepackage.AwesomeMessage");

    const payload = { awesomeField: "Hello world!" };
    const errMsg = AwesomeMessage.verify(payload);
    if (errMsg) throw new Error(errMsg);

    const message = AwesomeMessage.create(payload);
    const buffer = AwesomeMessage.encode(message).finish();

    console.log("Encoded Buffer:", buffer);

    const decodedMessage = AwesomeMessage.decode(buffer);
    console.log("Decoded Message:", decodedMessage);

  } catch (error) {
    console.error("Error loading .proto file:", error);
  }
}

loadProtoFile();

// Use JSON descriptor
const jsonDescriptor = {
  "nested": {
    "awesomepackage": {
      "nested": {
        "AwesomeMessage": {
          "fields": {
            "awesomeField": {
              "type": "string",
              "id": 1
            }
          }
        }
      }
    }
  }
};

function useJsonDescriptor() {
  try {
    const root = protobuf.Root.fromJSON(jsonDescriptor);
    const AwesomeMessage = root.lookupType("awesomepackage.AwesomeMessage");

    const payload = { awesomeField: "Hello JSON!" };
    const errMsg = AwesomeMessage.verify(payload);
    if (errMsg) throw new Error(errMsg);

    const message = AwesomeMessage.create(payload);
    const buffer = AwesomeMessage.encode(message).finish();

    console.log("Encoded Buffer with JSON:", buffer);

    const decodedMessage = AwesomeMessage.decode(buffer);
    console.log("Decoded Message with JSON:", decodedMessage);

  } catch (error) {
    console.error("Error processing JSON descriptor:", error);
  }
}

useJsonDescriptor();

// Create custom RPC service
function createRpcService() {
  const rpcImpl = function(method, requestData, callback) {
    setTimeout(() => {
      callback(null, requestData);
    }, 1000);
  };

  protobuf.load("service.proto", function(err, root) {
    if (err) throw err;

    const Greeter = root.lookupService("Greeter");
    let greeter = Greeter.create(rpcImpl, false, false);

    greeter.sayHello({ name: 'you' }, function(err, response) {
      if (err) return console.error("RPC Error:", err);
      console.log('Greeting:', response.message);
    });
  });
}

createRpcService();

// TypeScript integration
import { load as tsLoad } from "protobufjs";

async function useWithTypeScript() {
  const root = await tsLoad("awesome.proto");
  const AwesomeMessage = root.lookupType("awesomepackage.AwesomeMessage");

  let message = AwesomeMessage.create({ awesomeField: "hello" });
  console.log(`Message: ${JSON.stringify(message)}`);

  let buffer = AwesomeMessage.encode(message).finish();
  console.log(`Buffer: ${Array.prototype.toString.call(buffer)}`);

  let decoded = AwesomeMessage.decode(buffer);
  console.log(`Decoded: ${JSON.stringify(decoded)}`);
}

useWithTypeScript();

// TypeScript with decorators
import { Message, Type, Field, OneOf } from "protobufjs/light";

export class AwesomeSubMessage extends Message<AwesomeSubMessage> {
  @Field.d(1, "string")
  public awesomeString;

}

export enum AwesomeEnum {
  ONE = 1,
  TWO = 2
}

@Type.d("SuperAwesomeMessage")
export class AwesomeMessage extends Message<AwesomeMessage> {
  @Field.d(1, "string", "optional", "awesome default string")
  public awesomeField;

  @Field.d(2, AwesomeSubMessage)
  public awesomeSubMessage;

  @Field.d(3, AwesomeEnum, "optional", AwesomeEnum.ONE)
  public awesomeEnum;

  @OneOf.d("awesomeSubMessage", "awesomeEnum")
  public which;
}

let message = new AwesomeMessage({ awesomeField: "Hello Decorator!" });
let buffer = AwesomeMessage.encode(message).finish();
let decoded = AwesomeMessage.decode(buffer);

console.log(`Decoded with Decorators: ${JSON.stringify(decoded)}`);
