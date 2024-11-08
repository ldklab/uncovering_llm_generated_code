// myGrpcClient.js: A simple gRPC Client using @grpc/grpc-js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './example.proto';

// Load gRPC service definition from .proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  enums: String,
  longs: String,
  defaults: true,
  oneofs: true,
});

const ExampleService = grpc.loadPackageDefinition(packageDefinition).example.ExampleService;

// Initialize gRPC client with insecure credentials
const client = new ExampleService('localhost:50051', grpc.credentials.createInsecure());

// Unary call: Sends a single message and receives a response
client.unaryCall({ name: 'World' }, (error, response) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Greeting:', response.message);
});

// Server streaming call: Receives a stream of messages
const serverStream = client.serverStreamingCall({ start: 0 });
serverStream.on('data', (response) => {
  console.log('Received:', response.message);
});
serverStream.on('end', () => {
  console.log('Stream ended');
});

// Client streaming call: Sends a stream of messages
const clientStream = client.clientStreamingCall((error, response) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Final Response:', response.message);
});
clientStream.write({ message: 'Hello' });
clientStream.write({ message: 'World' });
clientStream.end();

// Bidirectional streaming: Exchange messages in both directions
const bidiStream = client.bidiStreamingCall();
bidiStream.on('data', (response) => {
  console.log('Received:', response.message);
});
bidiStream.on('end', () => {
  console.log('Bidirectional Stream ended');
});
bidiStream.write({ message: 'Hello' });
bidiStream.write({ message: 'World' });
bidiStream.end();
