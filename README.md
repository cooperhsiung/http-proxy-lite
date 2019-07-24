# http-proxy-lite

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

a tiny http proxy of node.js

simple and mini, completely built with native http module, it can be used as a reverse proxy

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
  .createServer((req, res) => {
    proxy.web(req, res, { target: 'http://127.0.0.1:3001' });
  })
  .listen(3000);
```

endpoint server

```typescript
import * as http from 'http';

http
  .createServer((req, res) => {
    res.end('hello, response from 3001');
  })
  .listen(3001);
```

then open `http://localhost:3000/` with your browser, it will shows `hello, response from 3001`

## Others

add listener for event, 'error' 'end'

```typescript
http
  .createServer((req, res) => {
    proxy
      .web(req, res, { target: 'http://127.0.0.1:3001' })
      .on('error', err => {
        console.log(err);
        // patch a server error
        res.statusCode = 500;
        res.end('Internal Server Error');
      })
      .on('end', msg => {
        console.log(msg);
      });
  })
  .listen(3000);
```

```typescript
const proxy = httpProxy.createProxyServer();

http
  .createServer((req, res) => {
    proxy.web(req, res, { target: 'http://127.0.0.1:3001' });
  })
  .listen(3000);

proxy.on('error', err => {
  console.log(err);
});
```

## Todo

- [ ] xxxx

## License

MIT

[npm-image]: https://img.shields.io/npm/v/http-proxy-lite.svg
[npm-url]: https://www.npmjs.com/package/http-proxy-lite
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
