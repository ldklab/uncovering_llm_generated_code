const protobuf = require('protobufjs');

// Function to load and process a .proto file
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

// Function to use JSON descriptor to manage message types
function useJsonDescriptor() {
  try {
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

// Function for demonstrating custom RPC service
function createRpcService() {
  const rpcImpl = (method, requestData, callback) => {
    setTimeout(() => {
      callback(null, requestData);
    }, 1000);
  };

  protobuf.load("service.proto", (err, root) => {
    if (err) throw err;

    const Greeter = root.lookupService("Greeter");
    const greeter = Greeter.create(rpcImpl, false, false);

    greeter.sayHello({ name: 'you' }, (err, response) => {
      if (err) return console.error("RPC Error:", err);
      console.log('Greeting:', response.message);
    });
  });
}

loadProtoFile();
useJsonDescriptor();
createRpcService();
