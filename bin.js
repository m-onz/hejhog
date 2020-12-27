#!/usr/bin/env node

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

<hejhog> browser intercepting proxy cli tool

usage: hejhog <options>

example:
> hejhog -v # server running @ localhost:8080>
> hejhog --port 9000 > log.txt && tail -f ./log.txt
> hejhog --json # show json
> hejhog --request-headers --hide-urls # hide URLs

options (eg. --urls):
cert (optional)     provide a path to pem self signed cert
key (optional)      provide a path to pem self signed key
hide-urls           hide request urls
request-headers     show request headers
response-headers    show response headers
v, V or verbose     show all information
json                show json data
params              show form request parameters
`

if (Object.keys(argv).length === 1 &&
argv._.length === 0 ||
argv.hasOwnProperty('help')) {
  console.log(instructions)
  return process.exit(0)
}

var options = Object.assign(defaults, argv)

var VERBOSE = false;
if (options.v || options.V  || options.verbose) {
  console.log('<hejhog> verbose mode...')
  VERBOSE = true;
}

var proxy = hoxy.createServer({
  certAuthority: {
    key: fs.readFileSync(options.key),
    cert: fs.readFileSync(options.cert)
  }
}).listen(options.port, function () {
  console.log('<hejhog> listening @', options.port)
});

if (VERBOSE) proxy.log('error warn debug', process.stderr);
if (VERBOSE) proxy.log('info', process.stdout);

process.on('uncaughtException', function (err) {
  console.error(err.stack, err);
});

if (options['just-urls']) {
  return proxy.intercept({
    phase: 'request'
  }, function(req, resp) {
    console.log(' <request> ', req.protocol, '//', req.hostname, req.url)
  })
} else {
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
      query: Object.assign({}, req.query)
    }
    if (!VERBOSE && !options['hide-urls']) console.log(' <request> ', req.protocol, '//', req.hostname, req.url)
    if (VERBOSE || options['request-headers']) console.log(data)
  });

  proxy.intercept({ phase: 'response' }, function (req, res) {
    if (VERBOSE || options['response-headers']) console.log(res.headers)
    if (VERBOSE || !options['hide-urls']) {
      console.log('<response>', req.url, res.statusCode)
    }
  })
}

if (VERBOSE || options.json)  {
  proxy.intercept({
    phase: 'request',
    as: 'json'
  }, function (req, res, cycle) {
    console.log('<request> [json]', Object.assign({}, req.json))
  })
  proxy.intercept({
    phase: 'response',
    as: 'json'
  }, function (req, res, cycle) {
    console.log('<response> [json]', Object.assign({}, res.json))
  })
}

if (VERBOSE || options.params)  {
  proxy.intercept({
    phase: 'request',
    as: 'params'
  }, function (req, res, cycle) {
    if (Object.keys(req.params).length) {
      console.log('<request> [params]', Object.assign({}, req.params))
    }
  })
}
