import * as http from 'http';
import { parse as parseUrl } from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

type ProxyOptions = {
  target: string;
};

class ProxyServer extends EventEmitter {
  web(req: IncomingMessage, res: ServerResponse, options: ProxyOptions) {
    const emitter = new EventEmitter();
    const { hostname, port } = parseUrl(options.target);
    const config = {
      hostname,
      port,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    if (req.method === 'POST') {
      let arr: any = [];
      req.on('data', chunk => {
        arr.push(chunk);
      });
      req.on('end', () => {
        let body = Buffer.concat(arr).toString();
        this.delegate(res, config, options, emitter, body);
      });
    } else {
      this.delegate(res, config, options, emitter);
    }
    return emitter;
  }

  delegate(
    rawRes: ServerResponse,
    config: any,
    options: ProxyOptions,
    emitter: EventEmitter,
    body?: string
  ) {
    let proxyReq = http.request(config, proxyRes => {
      rawRes.statusCode = proxyRes.statusCode || 500;
      for (let header in proxyRes.headers) {
        rawRes.setHeader(header, proxyRes.headers[header]!);
      }
      proxyRes.on('data', chunk => {
        rawRes.write(chunk);
      });
      proxyRes.on('end', () => {
        rawRes.end();
        process.nextTick(() => {
          this.emit('end', { target: options.target });
          emitter.emit('end', { target: options.target });
        });
      });
    });
    proxyReq.on('error', e => {
      process.nextTick(() => {
        this.emit('error', Object.assign({ target: options.target }, e));
        emitter.emit('error', Object.assign({ target: options.target }, e));
      });
    });
    body && proxyReq.write(body);
    proxyReq.end();
  }
}

export const createProxyServer = (opts?: any) => new ProxyServer();
