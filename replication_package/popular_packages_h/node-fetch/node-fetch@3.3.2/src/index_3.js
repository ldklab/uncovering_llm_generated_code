import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import Stream, { PassThrough, pipeline as pump } from 'node:stream';
import { Buffer } from 'node:buffer';
import dataUriToBuffer from 'data-uri-to-buffer';
import { writeToStream, clone } from './body.js';
import Response from './response.js';
import Headers, { fromRawHeaders } from './headers.js';
import Request, { getNodeRequestOptions } from './request.js';
import { FetchError } from './errors/fetch-error.js';
import { AbortError } from './errors/abort-error.js';
import { isRedirect } from './utils/is-redirect.js';
import { FormData } from 'formdata-polyfill/esm.min.js';
import { isDomainOrSubdomain, isSameProtocol } from './utils/is.js';
import { parseReferrerPolicyFromHeader } from './utils/referrer.js';
import {
  Blob,
  File,
  fileFromSync,
  fileFrom,
  blobFromSync,
  blobFrom
} from 'fetch-blob/from.js';

export { FormData, Headers, Request, Response, FetchError, AbortError, isRedirect };
export { Blob, File, fileFromSync, fileFrom, blobFromSync, blobFrom };

const supportedSchemas = new Set(['data:', 'http:', 'https:']);

export default async function fetch(url, options_) {
  return new Promise((resolve, reject) => {
    const request = new Request(url, options_);
    const { parsedURL, options } = getNodeRequestOptions(request);

    if (!supportedSchemas.has(parsedURL.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, '')}" is not supported.`);
    }

    if (parsedURL.protocol === 'data:') {
      const data = dataUriToBuffer(request.url);
      const response = new Response(data, { headers: { 'Content-Type': data.typeFull } });
      resolve(response);
      return;
    }

    const send = (parsedURL.protocol === 'https:' ? https : http).request;
    const { signal } = request;
    let response = null;

    const abort = () => {
      const error = new AbortError('The operation was aborted.');
      reject(error);
      if (request.body && request.body instanceof Stream.Readable) {
        request.body.destroy(error);
      }

      if (!response || !response.body) {
        return;
      }

      response.body.emit('error', error);
    };

    if (signal && signal.aborted) {
      abort();
      return;
    }

    const abortAndFinalize = () => {
      abort();
      finalize();
    };

    const request_ = send(parsedURL.toString(), options);

    if (signal) {
      signal.addEventListener('abort', abortAndFinalize);
    }

    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener('abort', abortAndFinalize);
      }
    };

    request_.on('error', error => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error.message}`, 'system', error));
      finalize();
    });

    fixResponseChunkedTransferBadEnding(request_, error => {
      if (response && response.body) {
        response.body.destroy(error);
      }
    });

    if (process.version < 'v14') {
      request_.on('socket', s => {
        let endedWithEventsCount;
        s.prependListener('end', () => {
          endedWithEventsCount = s._eventsCount;
        });
        s.prependListener('close', hadError => {
          if (response && endedWithEventsCount < s._eventsCount && !hadError) {
            const error = new Error('Premature close');
            error.code = 'ERR_STREAM_PREMATURE_CLOSE';
            response.body.emit('error', error);
          }
        });
      });
    }

    request_.on('response', response_ => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);

      if (isRedirect(response_.statusCode)) {
        const location = headers.get('Location');
        let locationURL = null;
        try {
          locationURL = location === null ? null : new URL(location, request.url);
        } catch {
          if (request.redirect !== 'manual') {
            reject(new FetchError(`uri requested responds with an invalid redirect URL: ${location}`, 'invalid-redirect'));
            finalize();
            return;
          }
        }

        switch (request.redirect) {
          case 'error':
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
            finalize();
            return;
          case 'manual':
            break;
          case 'follow': {
            if (locationURL === null) {
              break;
            }

            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
              finalize();
              return;
            }

            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: clone(request),
              signal: request.signal,
              size: request.size,
              referrer: request.referrer,
              referrerPolicy: request.referrerPolicy
            };

            if (!isDomainOrSubdomain(request.url, locationURL) || !isSameProtocol(request.url, locationURL)) {
              for (const name of ['authorization', 'www-authenticate', 'cookie', 'cookie2']) {
                requestOptions.headers.delete(name);
              }
            }

            if (response_.statusCode !== 303 && request.body && options_.body instanceof Stream.Readable) {
              reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
              finalize();
              return;
            }

            if (response_.statusCode === 303 || ((response_.statusCode === 301 || response_.statusCode === 302) && request.method === 'POST')) {
              requestOptions.method = 'GET';
              requestOptions.body = undefined;
              requestOptions.headers.delete('content-length');
            }

            const responseReferrerPolicy = parseReferrerPolicyFromHeader(headers);
            if (responseReferrerPolicy) {
              requestOptions.referrerPolicy = responseReferrerPolicy;
            }

            resolve(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }

          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }

      if (signal) {
        response_.once('end', () => {
          signal.removeEventListener('abort', abortAndFinalize);
        });
      }

      let body = pump(response_, new PassThrough(), error => {
        if (error) {
          reject(error);
        }
      });

      if (process.version < 'v12.10') {
        response_.on('aborted', abortAndFinalize);
      }

      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };

      const codings = headers.get('Content-Encoding');

      if (!request.compress || request.method === 'HEAD' || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve(response);
        return;
      }

      const zlibOptions = {
        flush: zlib.Z_SYNC_FLUSH,
        finishFlush: zlib.Z_SYNC_FLUSH
      };

      if (codings === 'gzip' || codings === 'x-gzip') {
        body = pump(body, zlib.createGunzip(zlibOptions), error => {
          if (error) {
            reject(error);
          }
        });
        response = new Response(body, responseOptions);
        resolve(response);
        return;
      }

      if (codings === 'deflate' || codings === 'x-deflate') {
        const raw = pump(response_, new PassThrough(), error => {
          if (error) {
            reject(error);
          }
        });
        raw.once('data', chunk => {
          if ((chunk[0] & 0x0F) === 0x08) {
            body = pump(body, zlib.createInflate(), error => {
              if (error) {
                reject(error);
              }
            });
          } else {
            body = pump(body, zlib.createInflateRaw(), error => {
              if (error) {
                reject(error);
              }
            });
          }

          response = new Response(body, responseOptions);
          resolve(response);
        });
        raw.once('end', () => {
          if (!response) {
            response = new Response(body, responseOptions);
            resolve(response);
          }
        });
        return;
      }

      if (codings === 'br') {
        body = pump(body, zlib.createBrotliDecompress(), error => {
          if (error) {
            reject(error);
          }
        });
        response = new Response(body, responseOptions);
        resolve(response);
        return;
      }

      response = new Response(body, responseOptions);
      resolve(response);
    });

    writeToStream(request_, request).catch(reject);
  });
}

function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from('0\r\n\r\n');

  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;

  request.on('response', response => {
    const { headers } = response;
    isChunkedTransfer = headers['transfer-encoding'] === 'chunked' && !headers['content-length'];
  });

  request.on('socket', socket => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error = new Error('Premature close');
        error.code = 'ERR_STREAM_PREMATURE_CLOSE';
        errorCallback(error);
      }
    };

    const onData = buf => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;

      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = (
          Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 &&
          Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0
        );
      }

      previousChunk = buf;
    };

    socket.prependListener('close', onSocketClose);
    socket.on('data', onData);

    request.on('close', () => {
      socket.removeListener('close', onSocketClose);
      socket.removeListener('data', onData);
    });
  });
}
