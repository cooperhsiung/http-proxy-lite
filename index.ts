import * as http from 'http';
import { parse as parseUrl } from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

type ProxyOptions = {
  target: string;
};

class ProxyServer extends EventEmitter {
  private req!: IncomingMessage;
  private res!: ServerResponse;
  private options!: ProxyOptions;

  constructor(
    req?: IncomingMessage,
    res?: ServerResponse,
    options?: ProxyOptions
  ) {
    super();
    req && (this.req = req);
    res && (this.res = res);
    options && (this.options = options);
  }

  web(req: IncomingMessage, res: ServerResponse, options: ProxyOptions) {
    let self = new ProxyServer(req, res, options);
    const { hostname, port } = parseUrl(self.options.target);
    const config = {
      hostname,
      port,
      path: self.req.url,
      method: self.req.method,
      headers: self.req.headers
    };
    if (self.req.method === 'POST') {
      let arr: any = [];
      self.req.on('data', chunk => {
        arr.push(chunk);
      });
      self.req.on('end', () => {
        let body = Buffer.concat(arr).toString();
        this.delegate.bind(self)(self.res, config, body);
      });
    } else {
      this.delegate.bind(self)(self.res, config);
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
