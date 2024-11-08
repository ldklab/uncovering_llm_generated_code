typescript
// File: socks.ts

import * as net from 'net';
import * as dgram from 'dgram';
import { EventEmitter } from 'events';

// Define types for SOCKS version and command
type SocksVersion = 4 | 5;
type SocksCommand = 'connect' | 'bind' | 'associate';

// Define the options for SocksClient
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

// Define details for a SOCKS UDP frame
interface SocksUDPFrameDetails {
  frameNumber?: number;
  remoteHost: {
    host: string;
    port: number;
  };
  data: Buffer;
}

// A class to manage SOCKS connections and frame handling
class SocksClient extends EventEmitter {
  private options: SocksClientOptions;  // Options for the SOCKS client
  private socket: net.Socket | null = null;  // TCP socket connection

  constructor(options: SocksClientOptions, callback?: (err?: Error, info?: any) => void) {
    super();
    this.options = options;

    // Handle optional callback for error and established events
    if (callback) {
      this.on('error', callback);
      this.on('established', (info) => callback(undefined, info));
    }
  }

  // Static method to create a SOCKS connection
  static createConnection(options: SocksClientOptions, callback?: (err?: Error, info?: any) => void): Promise<any> {
    const client = new SocksClient(options, callback);
    return new Promise((resolve, reject) => {
      client.on('error', reject);
      client.on('established', resolve);
      client.connect();
    });
  }

  // Initiates connection to the proxy server
  connect() {
    this.socket = net.createConnection({ host: this.options.proxy.host, port: this.options.proxy.port }, () => {
      this.onEstablished();
    });

    // Manage socket errors
    this.socket.on('error', (err) => this.emit('error', err));
  }

  // Emit 'established' event once connection is ready
  private onEstablished() {
    this.emit('established', { socket: this.socket });
  }

  // Creates a SOCKS UDP frame from provided details
  static createUDPFrame(details: SocksUDPFrameDetails): Buffer {
    const { remoteHost, data } = details;
    const hostBuffer = Buffer.from(remoteHost.host, 'utf8');
    const frame = Buffer.concat([Buffer.from([0x00, 0x00, 0x00]), hostBuffer, Buffer.from([remoteHost.port >> 8, remoteHost.port & 0xff]), data]);
    return frame;
  }

  // Parses a received UDP frame and extracts details
  static parseUDPFrame(data: Buffer): SocksUDPFrameDetails {
    const hostLength = data[3];
    const host = data.toString('utf8', 4, 4 + hostLength);
    const port = (data[4 + hostLength] << 8) | data[5 + hostLength];
    const frameData = data.slice(6 + hostLength);
    return { remoteHost: { host, port }, data: frameData };
  }
}

// Export the SocksClient class and related types
export { SocksClient, SocksClientOptions, SocksUDPFrameDetails };
