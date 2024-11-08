// myGrpcClient.js: A simple gRPC Client implemented using @grpc/grpc-js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the .proto file
const PROTO_PATH = './example.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  enums: String,
  longs: String,
  defaults: true,
  oneofs: true
});
const ExampleService = grpc.loadPackageDefinition(packageDefinition).example.ExampleService;

// Create the gRPC client
const client = new ExampleService('localhost:50051', grpc.credentials.createInsecure());

// Unary call example
client.unaryCall({ name: 'World' }, (error, response) => {
  error ? console.error('Error:', error) : console.log('Greeting:', response.message);
});

// Server streaming call example
const serverStream = client.serverStreamingCall({ start: 0 });
serverStream.on('data', response => console.log('Received:', response.message));
serverStream.on('end', () => console.log('Stream ended'));

// Client streaming call example
const clientStream = client.clientStreamingCall((error, response) => {
  error ? console.error('Error:', error) : console.log('Final Response:', response.message);
});
clientStream.write({ message: 'Hello' });
clientStream.write({ message: 'World' });
clientStream.end();

// Bidirectional streaming call example
const bidiStream = client.bidiStreamingCall();
bidiStream.on('data', response => console.log('Received:', response.message));
bidiStream.on('end', () => console.log('Bidirectional Stream ended'));
bidiStream.write({ message: 'Hello' });
bidiStream.write({ message: 'World' });
bidiStream.end();
