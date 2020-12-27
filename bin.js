#!/usr/bin/env node

var fs = require('fs')
var hoxy = require('hoxy');

/*

hedgehog


*/

var proxy = hoxy.createServer({
  certAuthority: {
    key: fs.readFileSync(__dirname+'/my-private-root-ca.key.pem'),
    cert: fs.readFileSync(__dirname+'/my-private-root-ca.crt.pem')
  }
}).listen(8080);

proxy.log('error warn debug', process.stderr);
proxy.log('info', process.stdout);

process.on('uncaughtException', function (err) {
    console.error(err.stack, err);
});


proxy.intercept({
  phase: 'request'
}, function(req, resp) {
  var data = {
    url: req.url,
    protocol: req.protocol,
    port: req.port,
    hostname: req.hostname,
    method: req.method,
    headers: req.headers,
    query: Object.assign({}, req.query),
    //json: req.json,
    //params: req.params,
    //data: req.string,
    //buffer: req.buffer
  }
  console.log(data.url)
  return new Promise(function (resolve, reject) {
    //setTimeout(function () {
        resolve()
    //}, 36000)
  })
});

proxy.intercept({ phase: 'response' }, function (req, res) {
  console.log(res.headers)
  console.log(res.statusCode)
})

/*
proxy.intercept({
  phase: 'response',
  as: 'json'
}, function (req, res, cycle) {
  console.log(res.json)
})

proxy.intercept({
  phase: 'response',
  as: 'string'
}, function (req, res, cycle) {
  console.log(res.string)
})

proxy.intercept({
  phase: 'response',
  as: 'buffer'
}, function (req, res, cycle) {
  console.log(res.buffer)
})
*/

/*proxy.intercept({
  phase: 'response',
  mimeType: 'text/html',
  as: '$'
}, function(req, resp, cycle) {
  resp.$('script')
  .attr('src', 'all your titles are belong to us');
});
*/
