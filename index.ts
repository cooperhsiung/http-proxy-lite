import * as http from 'http';
import { parse as parseUrl } from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

type ProxyOptions = {
  target: string;
};

class ProxyServer extends EventEmitter {
  private options!: ProxyOptions;
  web(req: IncomingMessage, res: ServerResponse, options: ProxyOptions) {
    this.options = options;
    const { hostname, port } = parseUrl(options.target);
    const config = {
      hostname: hostname,
      port: port,
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
        this.delegate(res, config, body);
      });
    } else {
      this.delegate(res, config);
    }
  }

  delegate(rawRes: ServerResponse, config: any, body?: string) {
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
        this.emit('end', { target: this.options.target });
      });
    });
    proxyReq.on('error', e => {
      this.emit('error', Object.assign({ target: this.options.target }, e));
    });
    body && proxyReq.write(body);
    proxyReq.end();
  }
}

export const createProxyServer = (opts?: any) => new ProxyServer();
