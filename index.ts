import * as http from 'http';
import { parse as parseUrl } from 'url';
import { IncomingMessage, ServerResponse } from 'http';

type ProxyOptions = {
  target: string;
};

class ProxyServer {
  web(req: IncomingMessage, res: ServerResponse, opts: ProxyOptions) {
    const { hostname, port } = parseUrl(opts.target);
    const options = {
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
        delegate(res, options, body);
      });
    } else {
      delegate(res, options);
    }
  }
}

const delegate = (rawRes: ServerResponse, options: any, body?: string) => {
  let proxyReq = http.request(options, proxyRes => {
    rawRes.statusCode = proxyRes.statusCode || 500;
    for (let header in proxyRes.headers) {
      rawRes.setHeader(header, proxyRes.headers[header]!);
    }
    proxyRes.on('data', chunk => {
      rawRes.write(chunk);
    });
    proxyRes.on('end', () => {
      rawRes.end();
    });
  });
  proxyReq.on('error', e => {
    console.error(`problem with request: ${e.message}`);
  });
  body && proxyReq.write(body);
  proxyReq.end();
};

export const createProxyServer = (opts?: any) => new ProxyServer();
