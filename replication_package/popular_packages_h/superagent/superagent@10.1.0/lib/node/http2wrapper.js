"use strict";

const http2 = require('http2');
const Stream = require('stream');
const net = require('net');
const tls = require('tls');
const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_AUTHORITY,
  HTTP2_HEADER_HOST,
  HTTP2_HEADER_SET_COOKIE,
  NGHTTP2_CANCEL
} = http2.constants;
function setProtocol(protocol) {
  return {
    request(options) {
      return new Request(protocol, options);
    }
  };
}
class Request extends Stream {
  constructor(protocol, options) {
    super();
    const defaultPort = protocol === 'https:' ? 443 : 80;
    const defaultHost = 'localhost';
    const port = options.port || defaultPort;
    const host = options.host || defaultHost;
    delete options.port;
    delete options.host;
    this.method = options.method;
    this.path = options.path;
    this.protocol = protocol;
    this.host = host;
    delete options.method;
    delete options.path;
    const sessionOptions = {
      ...options
    };
    if (options.socketPath) {
      sessionOptions.socketPath = options.socketPath;
      sessionOptions.createConnection = this.createUnixConnection.bind(this);
    }
    this._headers = {};
    const session = http2.connect(`${protocol}//${host}:${port}`, sessionOptions);
    this.setHeader('host', `${host}:${port}`);
    session.on('error', error => this.emit('error', error));
    this.session = session;
  }
  createUnixConnection(authority, options) {
    switch (this.protocol) {
      case 'http:':
        return net.connect(options.socketPath);
      case 'https:':
        options.ALPNProtocols = ['h2'];
        options.servername = this.host;
        options.allowHalfOpen = true;
        return tls.connect(options.socketPath, options);
      default:
        throw new Error('Unsupported protocol', this.protocol);
    }
  }
  setNoDelay(bool) {
    // We can not use setNoDelay with HTTP/2.
    // Node 10 limits http2session.socket methods to ones safe to use with HTTP/2.
    // See also https://nodejs.org/api/http2.html#http2_http2session_socket
  }
  getFrame() {
    if (this.frame) {
      return this.frame;
    }
    const method = {
      [HTTP2_HEADER_PATH]: this.path,
      [HTTP2_HEADER_METHOD]: this.method
    };
    let headers = this.mapToHttp2Header(this._headers);
    headers = Object.assign(headers, method);
    const frame = this.session.request(headers);
    frame.once('response', (headers, flags) => {
      headers = this.mapToHttpHeader(headers);
      frame.headers = headers;
      frame.statusCode = headers[HTTP2_HEADER_STATUS];
      frame.status = frame.statusCode;
      this.emit('response', frame);
    });
    this._headerSent = true;
    frame.once('drain', () => this.emit('drain'));
    frame.on('error', error => this.emit('error', error));
    frame.on('close', () => this.session.close());
    this.frame = frame;
    return frame;
  }
  mapToHttpHeader(headers) {
    const keys = Object.keys(headers);
    const http2Headers = {};
    for (let key of keys) {
      let value = headers[key];
      key = key.toLowerCase();
      switch (key) {
        case HTTP2_HEADER_SET_COOKIE:
          value = Array.isArray(value) ? value : [value];
          break;
        default:
          break;
      }
      http2Headers[key] = value;
    }
    return http2Headers;
  }
  mapToHttp2Header(headers) {
    const keys = Object.keys(headers);
    const http2Headers = {};
    for (let key of keys) {
      let value = headers[key];
      key = key.toLowerCase();
      switch (key) {
        case HTTP2_HEADER_HOST:
          key = HTTP2_HEADER_AUTHORITY;
          value = /^http:\/\/|^https:\/\//.test(value) ? new URL(value).host : value;
          break;
        default:
          break;
      }
      http2Headers[key] = value;
    }
    return http2Headers;
  }
  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  write(data, encoding) {
    const frame = this.getFrame();
    return frame.write(data, encoding);
  }
  pipe(stream, options) {
    const frame = this.getFrame();
    return frame.pipe(stream, options);
  }
  end(data) {
    const frame = this.getFrame();
    frame.end(data);
  }
  abort(data) {
    const frame = this.getFrame();
    frame.close(NGHTTP2_CANCEL);
    this.session.destroy();
  }
}
exports.setProtocol = setProtocol;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJodHRwMiIsInJlcXVpcmUiLCJTdHJlYW0iLCJuZXQiLCJ0bHMiLCJIVFRQMl9IRUFERVJfUEFUSCIsIkhUVFAyX0hFQURFUl9TVEFUVVMiLCJIVFRQMl9IRUFERVJfTUVUSE9EIiwiSFRUUDJfSEVBREVSX0FVVEhPUklUWSIsIkhUVFAyX0hFQURFUl9IT1NUIiwiSFRUUDJfSEVBREVSX1NFVF9DT09LSUUiLCJOR0hUVFAyX0NBTkNFTCIsImNvbnN0YW50cyIsInNldFByb3RvY29sIiwicHJvdG9jb2wiLCJyZXF1ZXN0Iiwib3B0aW9ucyIsIlJlcXVlc3QiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHRQb3J0IiwiZGVmYXVsdEhvc3QiLCJwb3J0IiwiaG9zdCIsIm1ldGhvZCIsInBhdGgiLCJzZXNzaW9uT3B0aW9ucyIsInNvY2tldFBhdGgiLCJjcmVhdGVDb25uZWN0aW9uIiwiY3JlYXRlVW5peENvbm5lY3Rpb24iLCJiaW5kIiwiX2hlYWRlcnMiLCJzZXNzaW9uIiwiY29ubmVjdCIsInNldEhlYWRlciIsIm9uIiwiZXJyb3IiLCJlbWl0IiwiYXV0aG9yaXR5IiwiQUxQTlByb3RvY29scyIsInNlcnZlcm5hbWUiLCJhbGxvd0hhbGZPcGVuIiwiRXJyb3IiLCJzZXROb0RlbGF5IiwiYm9vbCIsImdldEZyYW1lIiwiZnJhbWUiLCJoZWFkZXJzIiwibWFwVG9IdHRwMkhlYWRlciIsIk9iamVjdCIsImFzc2lnbiIsIm9uY2UiLCJmbGFncyIsIm1hcFRvSHR0cEhlYWRlciIsInN0YXR1c0NvZGUiLCJzdGF0dXMiLCJfaGVhZGVyU2VudCIsImNsb3NlIiwia2V5cyIsImh0dHAySGVhZGVycyIsImtleSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJBcnJheSIsImlzQXJyYXkiLCJ0ZXN0IiwiVVJMIiwibmFtZSIsImdldEhlYWRlciIsIndyaXRlIiwiZGF0YSIsImVuY29kaW5nIiwicGlwZSIsInN0cmVhbSIsImVuZCIsImFib3J0IiwiZGVzdHJveSIsImV4cG9ydHMiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbm9kZS9odHRwMndyYXBwZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgaHR0cDIgPSByZXF1aXJlKCdodHRwMicpO1xuY29uc3QgU3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5jb25zdCBuZXQgPSByZXF1aXJlKCduZXQnKTtcbmNvbnN0IHRscyA9IHJlcXVpcmUoJ3RscycpO1xuXG5jb25zdCB7XG4gIEhUVFAyX0hFQURFUl9QQVRILFxuICBIVFRQMl9IRUFERVJfU1RBVFVTLFxuICBIVFRQMl9IRUFERVJfTUVUSE9ELFxuICBIVFRQMl9IRUFERVJfQVVUSE9SSVRZLFxuICBIVFRQMl9IRUFERVJfSE9TVCxcbiAgSFRUUDJfSEVBREVSX1NFVF9DT09LSUUsXG4gIE5HSFRUUDJfQ0FOQ0VMXG59ID0gaHR0cDIuY29uc3RhbnRzO1xuXG5mdW5jdGlvbiBzZXRQcm90b2NvbChwcm90b2NvbCkge1xuICByZXR1cm4ge1xuICAgIHJlcXVlc3Qob3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHByb3RvY29sLCBvcHRpb25zKTtcbiAgICB9XG4gIH07XG59XG5cbmNsYXNzIFJlcXVlc3QgZXh0ZW5kcyBTdHJlYW0ge1xuICBjb25zdHJ1Y3Rvcihwcm90b2NvbCwgb3B0aW9ucykge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc3QgZGVmYXVsdFBvcnQgPSBwcm90b2NvbCA9PT0gJ2h0dHBzOicgPyA0NDMgOiA4MDtcbiAgICBjb25zdCBkZWZhdWx0SG9zdCA9ICdsb2NhbGhvc3QnO1xuICAgIGNvbnN0IHBvcnQgPSBvcHRpb25zLnBvcnQgfHwgZGVmYXVsdFBvcnQ7XG4gICAgY29uc3QgaG9zdCA9IG9wdGlvbnMuaG9zdCB8fCBkZWZhdWx0SG9zdDtcblxuICAgIGRlbGV0ZSBvcHRpb25zLnBvcnQ7XG4gICAgZGVsZXRlIG9wdGlvbnMuaG9zdDtcblxuICAgIHRoaXMubWV0aG9kID0gb3B0aW9ucy5tZXRob2Q7XG4gICAgdGhpcy5wYXRoID0gb3B0aW9ucy5wYXRoO1xuICAgIHRoaXMucHJvdG9jb2wgPSBwcm90b2NvbDtcbiAgICB0aGlzLmhvc3QgPSBob3N0O1xuXG4gICAgZGVsZXRlIG9wdGlvbnMubWV0aG9kO1xuICAgIGRlbGV0ZSBvcHRpb25zLnBhdGg7XG5cbiAgICBjb25zdCBzZXNzaW9uT3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuICAgIGlmIChvcHRpb25zLnNvY2tldFBhdGgpIHtcbiAgICAgIHNlc3Npb25PcHRpb25zLnNvY2tldFBhdGggPSBvcHRpb25zLnNvY2tldFBhdGg7XG4gICAgICBzZXNzaW9uT3B0aW9ucy5jcmVhdGVDb25uZWN0aW9uID0gdGhpcy5jcmVhdGVVbml4Q29ubmVjdGlvbi5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHRoaXMuX2hlYWRlcnMgPSB7fTtcblxuICAgIGNvbnN0IHNlc3Npb24gPSBodHRwMi5jb25uZWN0KFxuICAgICAgYCR7cHJvdG9jb2x9Ly8ke2hvc3R9OiR7cG9ydH1gLFxuICAgICAgc2Vzc2lvbk9wdGlvbnNcbiAgICApO1xuICAgIHRoaXMuc2V0SGVhZGVyKCdob3N0JywgYCR7aG9zdH06JHtwb3J0fWApO1xuXG4gICAgc2Vzc2lvbi5vbignZXJyb3InLCAoZXJyb3IpID0+IHRoaXMuZW1pdCgnZXJyb3InLCBlcnJvcikpO1xuXG4gICAgdGhpcy5zZXNzaW9uID0gc2Vzc2lvbjtcbiAgfVxuXG4gIGNyZWF0ZVVuaXhDb25uZWN0aW9uKGF1dGhvcml0eSwgb3B0aW9ucykge1xuICAgIHN3aXRjaCAodGhpcy5wcm90b2NvbCkge1xuICAgICAgY2FzZSAnaHR0cDonOlxuICAgICAgICByZXR1cm4gbmV0LmNvbm5lY3Qob3B0aW9ucy5zb2NrZXRQYXRoKTtcbiAgICAgIGNhc2UgJ2h0dHBzOic6XG4gICAgICAgIG9wdGlvbnMuQUxQTlByb3RvY29scyA9IFsnaDInXTtcbiAgICAgICAgb3B0aW9ucy5zZXJ2ZXJuYW1lID0gdGhpcy5ob3N0O1xuICAgICAgICBvcHRpb25zLmFsbG93SGFsZk9wZW4gPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGxzLmNvbm5lY3Qob3B0aW9ucy5zb2NrZXRQYXRoLCBvcHRpb25zKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgcHJvdG9jb2wnLCB0aGlzLnByb3RvY29sKTtcbiAgICB9XG4gIH1cblxuICBzZXROb0RlbGF5KGJvb2wpIHtcbiAgICAvLyBXZSBjYW4gbm90IHVzZSBzZXROb0RlbGF5IHdpdGggSFRUUC8yLlxuICAgIC8vIE5vZGUgMTAgbGltaXRzIGh0dHAyc2Vzc2lvbi5zb2NrZXQgbWV0aG9kcyB0byBvbmVzIHNhZmUgdG8gdXNlIHdpdGggSFRUUC8yLlxuICAgIC8vIFNlZSBhbHNvIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cDIuaHRtbCNodHRwMl9odHRwMnNlc3Npb25fc29ja2V0XG4gIH1cblxuICBnZXRGcmFtZSgpIHtcbiAgICBpZiAodGhpcy5mcmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZnJhbWU7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0aG9kID0ge1xuICAgICAgW0hUVFAyX0hFQURFUl9QQVRIXTogdGhpcy5wYXRoLFxuICAgICAgW0hUVFAyX0hFQURFUl9NRVRIT0RdOiB0aGlzLm1ldGhvZFxuICAgIH07XG5cbiAgICBsZXQgaGVhZGVycyA9IHRoaXMubWFwVG9IdHRwMkhlYWRlcih0aGlzLl9oZWFkZXJzKTtcblxuICAgIGhlYWRlcnMgPSBPYmplY3QuYXNzaWduKGhlYWRlcnMsIG1ldGhvZCk7XG5cbiAgICBjb25zdCBmcmFtZSA9IHRoaXMuc2Vzc2lvbi5yZXF1ZXN0KGhlYWRlcnMpO1xuXG4gICAgZnJhbWUub25jZSgncmVzcG9uc2UnLCAoaGVhZGVycywgZmxhZ3MpID0+IHtcbiAgICAgIGhlYWRlcnMgPSB0aGlzLm1hcFRvSHR0cEhlYWRlcihoZWFkZXJzKTtcbiAgICAgIGZyYW1lLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgICAgZnJhbWUuc3RhdHVzQ29kZSA9IGhlYWRlcnNbSFRUUDJfSEVBREVSX1NUQVRVU107XG4gICAgICBmcmFtZS5zdGF0dXMgPSBmcmFtZS5zdGF0dXNDb2RlO1xuICAgICAgdGhpcy5lbWl0KCdyZXNwb25zZScsIGZyYW1lKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2hlYWRlclNlbnQgPSB0cnVlO1xuXG4gICAgZnJhbWUub25jZSgnZHJhaW4nLCAoKSA9PiB0aGlzLmVtaXQoJ2RyYWluJykpO1xuICAgIGZyYW1lLm9uKCdlcnJvcicsIChlcnJvcikgPT4gdGhpcy5lbWl0KCdlcnJvcicsIGVycm9yKSk7XG4gICAgZnJhbWUub24oJ2Nsb3NlJywgKCkgPT4gdGhpcy5zZXNzaW9uLmNsb3NlKCkpO1xuXG4gICAgdGhpcy5mcmFtZSA9IGZyYW1lO1xuICAgIHJldHVybiBmcmFtZTtcbiAgfVxuXG4gIG1hcFRvSHR0cEhlYWRlcihoZWFkZXJzKSB7XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGhlYWRlcnMpO1xuICAgIGNvbnN0IGh0dHAySGVhZGVycyA9IHt9O1xuICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XG4gICAgICBsZXQgdmFsdWUgPSBoZWFkZXJzW2tleV07XG4gICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgSFRUUDJfSEVBREVSX1NFVF9DT09LSUU6XG4gICAgICAgICAgdmFsdWUgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaHR0cDJIZWFkZXJzW2tleV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaHR0cDJIZWFkZXJzO1xuICB9XG5cbiAgbWFwVG9IdHRwMkhlYWRlcihoZWFkZXJzKSB7XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGhlYWRlcnMpO1xuICAgIGNvbnN0IGh0dHAySGVhZGVycyA9IHt9O1xuICAgIGZvciAobGV0IGtleSBvZiBrZXlzKSB7XG4gICAgICBsZXQgdmFsdWUgPSBoZWFkZXJzW2tleV07XG4gICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgSFRUUDJfSEVBREVSX0hPU1Q6XG4gICAgICAgICAga2V5ID0gSFRUUDJfSEVBREVSX0FVVEhPUklUWTtcbiAgICAgICAgICB2YWx1ZSA9IC9eaHR0cDpcXC9cXC98Xmh0dHBzOlxcL1xcLy8udGVzdCh2YWx1ZSlcbiAgICAgICAgICAgID8gbmV3IFVSTCh2YWx1ZSkuaG9zdFxuICAgICAgICAgICAgOiB2YWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaHR0cDJIZWFkZXJzW2tleV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaHR0cDJIZWFkZXJzO1xuICB9XG5cbiAgc2V0SGVhZGVyKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5faGVhZGVyc1tuYW1lLnRvTG93ZXJDYXNlKCldID0gdmFsdWU7XG4gIH1cblxuICBnZXRIZWFkZXIobmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9oZWFkZXJzW25hbWUudG9Mb3dlckNhc2UoKV07XG4gIH1cblxuICB3cml0ZShkYXRhLCBlbmNvZGluZykge1xuICAgIGNvbnN0IGZyYW1lID0gdGhpcy5nZXRGcmFtZSgpO1xuICAgIHJldHVybiBmcmFtZS53cml0ZShkYXRhLCBlbmNvZGluZyk7XG4gIH1cblxuICBwaXBlKHN0cmVhbSwgb3B0aW9ucykge1xuICAgIGNvbnN0IGZyYW1lID0gdGhpcy5nZXRGcmFtZSgpO1xuICAgIHJldHVybiBmcmFtZS5waXBlKHN0cmVhbSwgb3B0aW9ucyk7XG4gIH1cblxuICBlbmQoZGF0YSkge1xuICAgIGNvbnN0IGZyYW1lID0gdGhpcy5nZXRGcmFtZSgpO1xuICAgIGZyYW1lLmVuZChkYXRhKTtcbiAgfVxuXG4gIGFib3J0KGRhdGEpIHtcbiAgICBjb25zdCBmcmFtZSA9IHRoaXMuZ2V0RnJhbWUoKTtcbiAgICBmcmFtZS5jbG9zZShOR0hUVFAyX0NBTkNFTCk7XG4gICAgdGhpcy5zZXNzaW9uLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5leHBvcnRzLnNldFByb3RvY29sID0gc2V0UHJvdG9jb2w7XG4iXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTUEsS0FBSyxHQUFHQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQzlCLE1BQU1DLE1BQU0sR0FBR0QsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUNoQyxNQUFNRSxHQUFHLEdBQUdGLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDMUIsTUFBTUcsR0FBRyxHQUFHSCxPQUFPLENBQUMsS0FBSyxDQUFDO0FBRTFCLE1BQU07RUFDSkksaUJBQWlCO0VBQ2pCQyxtQkFBbUI7RUFDbkJDLG1CQUFtQjtFQUNuQkMsc0JBQXNCO0VBQ3RCQyxpQkFBaUI7RUFDakJDLHVCQUF1QjtFQUN2QkM7QUFDRixDQUFDLEdBQUdYLEtBQUssQ0FBQ1ksU0FBUztBQUVuQixTQUFTQyxXQUFXQSxDQUFDQyxRQUFRLEVBQUU7RUFDN0IsT0FBTztJQUNMQyxPQUFPQSxDQUFDQyxPQUFPLEVBQUU7TUFDZixPQUFPLElBQUlDLE9BQU8sQ0FBQ0gsUUFBUSxFQUFFRSxPQUFPLENBQUM7SUFDdkM7RUFDRixDQUFDO0FBQ0g7QUFFQSxNQUFNQyxPQUFPLFNBQVNmLE1BQU0sQ0FBQztFQUMzQmdCLFdBQVdBLENBQUNKLFFBQVEsRUFBRUUsT0FBTyxFQUFFO0lBQzdCLEtBQUssQ0FBQyxDQUFDO0lBQ1AsTUFBTUcsV0FBVyxHQUFHTCxRQUFRLEtBQUssUUFBUSxHQUFHLEdBQUcsR0FBRyxFQUFFO0lBQ3BELE1BQU1NLFdBQVcsR0FBRyxXQUFXO0lBQy9CLE1BQU1DLElBQUksR0FBR0wsT0FBTyxDQUFDSyxJQUFJLElBQUlGLFdBQVc7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