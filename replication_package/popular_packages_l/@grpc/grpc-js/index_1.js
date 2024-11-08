// myGrpcClient.js: A simplified gRPC Client using @grpc/grpc-js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load service definition from the .proto file
const PROTO_PATH = './example.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  enums: String,
  longs: String,
  defaults: true,
  oneofs: true
});
const grpcPackage = grpc.loadPackageDefinition(packageDefinition).example;

// Instantiate gRPC client
const client = new grpcPackage.ExampleService('localhost:50051', grpc.credentials.createInsecure());

// Unary RPC call
client.unaryCall({ name: 'World' }, (error, response) => {
  if (error) {
    return console.error('Unary call error:', error);
  }
  console.log('Unary call response:', response.message);
});

// Server streaming RPC call
const serverStream = client.serverStreamingCall({ start: 0 });
serverStream.on('data', (response) => console.log('Stream data:', response.message));
serverStream.on('end', () => console.log('Server stream ended'));

// Client streaming RPC call
const clientStream = client.clientStreamingCall((error, response) => {
  if (error) {
    return console.error('Client stream error:', error);
  }
  console.log('Client stream response:', response.message);
});
clientStream.write({ message: 'Hello' });
clientStream.write({ message: 'World' });
clientStream.end();

// Bidirectional streaming RPC call
const bidiStream = client.bidiStreamingCall();
bidiStream.on('data', (response) => console.log('Bidi stream data:', response.message));
bidiStream.on('end', () => console.log('Bidirectional stream ended'));
bidiStream.write({ message: 'Hello' });
bidiStream.write({ message: 'World' });
bidiStream.end();
