typescript
// File: socks.ts

import * as net from 'net';
import * as dgram from 'dgram';
import { EventEmitter } from 'events';

// Define types for SOCKS version and command.
type SocksVersion = 4 | 5;
type SocksCommand = 'connect' | 'bind' | 'associate';

// Interface for SOCKS client options.
interface SocksClientOptions {
  proxy: {
    host: string;
    port: number;
    type: SocksVersion;
    userId?: string;
    password?: string;
    custom_auth_method?: number;
    custom_auth_request_handler?: () => Promise<Buffer>;
    custom_auth_response_size?: number;
    custom_auth_response_handler?: (data: Buffer) => Promise<boolean>;
  };
  command: SocksCommand;
  destination: {
    host: string;
    port: number;
  };
  timeout?: number;
  set_tcp_nodelay?: boolean;
}

// Interface for UDP frame details.
interface SocksUDPFrameDetails {
  frameNumber?: number;
  remoteHost: {
    host: string;
    port: number;
  };
  data: Buffer;
}

// Main SocksClient class extending EventEmitter.
class SocksClient extends EventEmitter {
  private options: SocksClientOptions;
  private socket: net.Socket | null = null;

  constructor(options: SocksClientOptions, callback?: (err?: Error, info?: any) => void) {
    super();
    this.options = options;
    
    // Set up optional callback support.
    if (callback) {
      this.on('error', callback);
      this.on('established', (info) => callback(undefined, info));
    }
  }

  // Static method to create a connection.
  static createConnection(options: SocksClientOptions, callback?: (err?: Error, info?: any) => void): Promise<any> {
    const client = new SocksClient(options, callback);
    return new Promise((resolve, reject) => {
      client.on('error', reject);
      client.on('established', resolve);
      client.connect(); // Initiate the connection.
    });
  }

  // Method to initiate the connection.
  connect() {
    this.socket = net.createConnection({ host: this.options.proxy.host, port: this.options.proxy.port }, () => {
      this.onEstablished();  // Emit an establishment event when connected.
    });

    this.socket.on('error', (err) => this.emit('error', err));  // Handle socket errors.
  }

  // Emit an 'established' event with socket information.
  private onEstablished() {
    this.emit('established', { socket: this.socket });
  }

  // Static method to create a UDP frame from provided details.
  static createUDPFrame(details: SocksUDPFrameDetails): Buffer {
    const { remoteHost, data } = details;
    const hostBuffer = Buffer.from(remoteHost.host, 'utf8');
    const frame = Buffer.concat([Buffer.from([0x00, 0x00, 0x00]), hostBuffer, Buffer.from([remoteHost.port >> 8, remoteHost.port & 0xff]), data]);
    return frame;
  }

  // Static method to parse a UDP frame into details.
  static parseUDPFrame(data: Buffer): SocksUDPFrameDetails {
    const hostLength = data[3];
    const host = data.toString('utf8', 4, 4 + hostLength);
    const port = (data[4 + hostLength] << 8) | data[5 + hostLength];
    const frameData = data.slice(6 + hostLength);
    return { remoteHost: { host, port }, data: frameData };
  }
}

// Export the class and interfaces for external use.
export { SocksClient, SocksClientOptions, SocksUDPFrameDetails };
