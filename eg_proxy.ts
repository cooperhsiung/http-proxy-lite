import * as http from 'http';
import * as httpProxy from './';

const proxy = httpProxy.createProxyServer();

http
  .createServer((req, res) => {
    proxy.web(req, res, { target: 'http://127.0.0.1:3001' });
  })
  .listen(3000);
