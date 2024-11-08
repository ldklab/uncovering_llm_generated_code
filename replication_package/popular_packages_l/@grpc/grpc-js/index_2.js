// myGrpcClient.js: Rewritten gRPC Client using @grpc/grpc-js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Define the path to the .proto file
const PROTO_PATH = './example.proto';

// Load the .proto file and define service
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  enums: String,
  longs: String,
  defaults: true,
  oneofs: true,
});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const ExampleService = grpcObject.example.ExampleService;

// Initialize the gRPC client
const client = new ExampleService('localhost:50051', grpc.credentials.createInsecure());

// Unary RPC call
client.unaryCall({ name: 'World' }, (err, response) => {
  if (err) {
    console.error('Unary call error:', err);
  } else {
    console.log('Unary call response:', response.message);
  }
});

// Server streaming RPC call
const stream = client.serverStreamingCall({ start: 0 });
stream.on('data', (response) => {
  console.log('Streamed response:', response.message);
});
stream.on('end', () => {
  console.log('Server stream ended');
});

// Client streaming RPC call
const clientStream = client.clientStreamingCall((err, response) => {
  if (err) {
    console.error('Client stream error:', err);
  } else {
    console.log('Final response from client stream:', response.message);
  }
});
clientStream.write({ message: 'Hello' });
clientStream.write({ message: 'World' });
clientStream.end();

// Bidirectional streaming RPC call
const bidiStream = client.bidiStreamingCall();
bidiStream.on('data', (response) => {
  console.log('Bidirectional response:', response.message);
});
bidiStream.on('end', () => {
  console.log('Bidirectional stream ended');
});
bidiStream.write({ message: 'Hello' });
bidiStream.write({ message: 'World' });
bidiStream.end();
