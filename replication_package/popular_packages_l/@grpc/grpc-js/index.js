// myGrpcClient.js: A simple gRPC Client implemented using @grpc/grpc-js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load .proto file using proto-loader
const PROTO_PATH = './example.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  enums: String,
  longs: String,
  defaults: true,
  oneofs: true
});
const ExampleService = grpc.loadPackageDefinition(packageDefinition).example.ExampleService;

// Create a client
const client = new ExampleService('localhost:50051', grpc.credentials.createInsecure());

// Example unary call
client.unaryCall({ name: 'World' }, (error, response) => {
  if (!error) {
    console.log('Greeting:', response.message);
  } else {
    console.error('Error:', error);
  }
});

// Example server streaming
const stream = client.serverStreamingCall({ start: 0 });
stream.on('data', function(response) {
  console.log('Received:', response.message);
});
stream.on('end', function() {
  console.log('Stream ended');
});

// Example client streaming
const call = client.clientStreamingCall((error, response) => {
  if (!error) {
    console.log('Final Response:', response.message);
  } else {
    console.error('Error:', error);
  }
});
call.write({ message: 'Hello' });
call.write({ message: 'World' });
call.end();

// Example bidirectional streaming
const bidiStream = client.bidiStreamingCall();
bidiStream.on('data', function(response) {
  console.log('Received:', response.message);
});
bidiStream.on('end', function() {
  console.log('Bidirectional Stream ended');
});
bidiStream.write({ message: 'Hello' });
bidiStream.write({ message: 'World' });
bidiStream.end();
