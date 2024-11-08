typescript
// File: socks.ts

import * as net from 'net';
import { createSocket, RemoteInfo } from 'dgram';
import { EventEmitter } from 'events';

type SocksVersion = 4 | 5;
type SocksCommand = 'connect' | 'bind' | 'associate';

interface SocksProxy {
  host: string;
  port: number;
  type: SocksVersion;
  userId?: string;
  password?: string;
  custom_auth_method?: number;
  custom_auth_request_handler?: () => Promise<Buffer>;
  custom_auth_response_size?: number;
  custom_auth_response_handler?: (data: Buffer) => Promise<boolean>;
}

interface SocksClientOptions {
  proxy: SocksProxy;
  command: SocksCommand;
  destination: {
    host: string;
    port: number;
  };
  timeout?: number;
  set_tcp_nodelay?: boolean;
}

interface SocksUDPFrameDetails {
  frameNumber?: number;
  remoteHost: {
    host: string;
    port: number;
  };
  data: Buffer;
}

class SocksClient extends EventEmitter {
  private options: SocksClientOptions;
  private socket: net.Socket | null = null;

  constructor(options: SocksClientOptions, callback?: (err?: Error, info?: any) => void) {
    super();
    this.options = options;
    
    if (callback) {
      this.on('error', callback);
      this.on('established', (info) => callback(undefined, info));
    }
  }

  static async createConnection(options: SocksClientOptions, callback?: (err?: Error, info?: any) => void): Promise<any> {
    const client = new SocksClient(options, callback);
    return new Promise((resolve, reject) => {
      client.on('error', reject);
      client.on('established', resolve);
      client.connect();
    });
  }

  connect() {
    this.socket = net.createConnection({ 
      host: this.options.proxy.host, 
      port: this.options.proxy.port 
    }, () => this.onEstablished());

    this.socket.on('error', (err) => this.emit('error', err));
  }

  private onEstablished() {
    this.emit('established', { socket: this.socket });
  }

  static createUDPFrame(details: SocksUDPFrameDetails): Buffer {
    const { remoteHost, data } = details;
    const hostBuffer = Buffer.from(remoteHost.host, 'utf8');
    return Buffer.concat([Buffer.from([0x00, 0x00, 0x00]), hostBuffer, Buffer.from([remoteHost.port >> 8, remoteHost.port & 0xff]), data]);
  }

  static parseUDPFrame(data: Buffer): SocksUDPFrameDetails {
    const hostLength = data[3];
    const host = data.toString('utf8', 4, 4 + hostLength);
    const port = (data[4 + hostLength] << 8) | data[5 + hostLength];
    const frameData = data.slice(6 + hostLength);
    return { remoteHost: { host, port }, data: frameData };
  }
}

export { SocksClient, SocksClientOptions, SocksUDPFrameDetails };
