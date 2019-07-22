import * as http from 'http';
import { parse as parseUrl } from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { strict } from 'assert';

class ProxyServer {
  web(req: IncomingMessage, res: ServerResponse, opts: any) {
    let u = parseUrl(opts.target);
    let options = {
      hostname: u.hostname,
      port: u.port,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    if (req.method === 'POST') {
      let bufs: any = [];
      req.on('data', chunk => {
        bufs.push(chunk);
      });
      req.on('end', () => {
        let body = Buffer.concat(bufs).toString();
        delegate(res, options, body);
      });
    } else {
      delegate(res, options);
    }
  }
}

function createProxyServer(opts: any) {
  return new ProxyServer();
}

function delegate(rawRes: ServerResponse, options: any, body?: string) {
  let proxyReq = http.request(options, proxyRes => {
    rawRes.statusCode = proxyRes.statusCode;
    for (let header in proxyRes.headers) {
      rawRes.setHeader(header, proxyRes.headers[header]);
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
}
