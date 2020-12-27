#!/usr/bin/env node

/*

  hedgehog browser intercepting proxy cli tool

*/

var fs = require('fs')
var hoxy = require('hoxy')
var argv = require('minimist')(process.argv.slice(2))
var path = require('path')

var defaults = {
  port: 8080,
  key: path.normalize(path.join(__dirname, 'key.pem')),
  cert: path.normalize(path.join(__dirname, 'crt.pem'))
}

var instructions = `

  <hedgehog> browser intercepting proxy cli tool

  usage: hedgehog <options>

  options (eg. --urls):
    cert (optional)     provide a path to pem self signed cert
    key (optional)      provide a path to pem self signed key
    hide-urls           hide request urls
    request-headers     show request headers
    response-headers    show response headers
    v, V or verbose     show all information
`

if (Object.keys(argv).length === 1 &&
  argv._.length === 0 ||
  argv.hasOwnProperty('help')) {
  console.log(instructions)
}

var options = Object.assign(defaults, argv)

var VERBOSE = false;
if (options.v ||
   options.vv ||
   options.V  ||
   options.VV ||
   options.verbose) {
  console.log('<hedgehog> verbose mode...')
  VERBOSE = true;
}

var proxy = hoxy.createServer({
  certAuthority: {
    key: fs.readFileSync(options.key),
    cert: fs.readFileSync(options.cert)
  }
}).listen(options.port, function () {
  console.log('<hedgehog> listening @', options.port)
});

// proxy.log('error warn debug', process.stderr);
// proxy.log('info', process.stdout);

process.on('uncaughtException', function (err) {
    console.error(err.stack, err);
});

// proxy.intercept({
//   phase: 'request'
// }, function(req, resp) {
//   var data = {
//     url: req.url,
//     protocol: req.protocol,
//     port: req.port,
//     hostname: req.hostname,
//     method: req.method,
//     headers: req.headers,
//     query: Object.assign({}, req.query)
//   }
  // if (!VERBOSE && !options['hide-urls']) console.log('<request> ', data.url)
  // if (VERBOSE || options['request-headers']) console.log(data)
// });

// proxy.intercept({ phase: 'response' }, function (req, res) {
  // if (VERBOSE || options['response-headers']) console.log(res.headers)
  // if (VERBOSE || !options['hide-urls']) {
  //   console.log('<response>', req.url, res.statusCode)
  // }
// })

// proxy.intercept({
//   phase: 'request',
//   as: 'params'
// }, function (req, res, cycle) {
//   console.log('<request> ', res.params)
// })

proxy.intercept({
  phase: 'request',
  as: 'json'
}, function (req, res, cycle) {
  console.log('<request> ', req.json)
})

// proxy.intercept({
//   phase: 'request',
//   as: 'string'
// }, function (req, res, cycle) {
//   console.log('<request> ', res.string.length)
// })

// proxy.intercept({
//   phase: 'request',
//   as: 'buffer'
// }, function (req, res, cycle) {
//   console.log('<request> has buffer ', res.buffer.length)
// })

// proxy.intercept({
//   phase: 'response',
//   as: 'params'
// }, function (req, res, cycle) {
//   console.log('<response> ', res.params)
// })

proxy.intercept({
  phase: 'response',
  as: 'json'
}, function (req, res, cycle) {
  console.log('<response> ', res.json)
})

// proxy.intercept({
//   phase: 'response',
//   as: 'string'
// }, function (req, res, cycle) {
//   console.log('<response> ', res.string.length)
// })
//
// proxy.intercept({
//   phase: 'response',
//   as: 'buffer'
// }, function (req, res, cycle) {
//   console.log('<response> has buffer', res.buffer.length)
// })
