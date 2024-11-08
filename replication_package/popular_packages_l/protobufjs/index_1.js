const protobuf = require('protobufjs');

// Asynchronously load a .proto file and perform encoding and decoding of a message
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

// Use a JSON descriptor to dynamically generate a Protocol Buffers message and perform encoding and decoding
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

// Create a simple custom RPC service which echoes the request data back
function createRpcService() {
  const rpcImpl = function(method, requestData, callback) {
    setTimeout(() => {
      callback(null, requestData); // Echo back the request
    }, 1000);
  };

  protobuf.load("service.proto", function(err, root) {
    if (err) throw err;

    const Greeter = root.lookupService("Greeter");
    const greeter = Greeter.create(rpcImpl, false, false);

    greeter.sayHello({ name: 'you' }, function(err, response) {
      if (err) return console.error("RPC Error:", err);
      console.log('Greeting:', response.message);
    });
  });
}

createRpcService();
