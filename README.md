# http-proxy-lite

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

a tiny http proxy of node.js

## Installation

```bash
npm i http-proxy-lite -S
```

## Usage

proxy server

```typescript
import * as http from 'http';
import * as httpProxy from 'http-proxy-lite';

const proxy = httpProxy.createProxyServer();

http
  .createServer(function(req, res) {
    proxy.web(req, res, { target: 'http://127.0.0.1:3001' });
  })
  .listen(3000);
```

endpoint server

```typescript
import * as http from 'http';

http
  .createServer(function(req, res) {
    res.end('hello, response from 3001');
  })
  .listen(3001);
```

then open `http://localhost:3000/` with your browser, it will shows `hello, response from 3001`

## Todo

- [ ] xxxx

## License

MIT

[npm-image]: https://img.shields.io/npm/v/http-proxy-lite.svg
[npm-url]: https://www.npmjs.com/package/http-proxy-lite
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
