import * as http from 'http';

http
  .createServer(function(req, res) {
    res.end('hello, response from 3001');
  })
  .listen(3001);
