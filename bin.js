#!/usr/bin/env node

var fs = require('fs')
var hoxy = require('hoxy')
var argv = require('minimist')(process.argv.slice(2))
var path = require('path')

var defaults = {
  port: 8080,
  key: 'key.pem',
  cert: 'crt.pem'
}

var instructions = `

  <hejhog> browser intercepting proxy cli tool

  usage: hejhog <options>

  example:
    > hejhog -v # server running @ localhost:8080> --key ./key.pem --cert ./crt.pem
    > hejhog --port 9000 > log.txt && tail -f ./log.txt
    > hejhog --json # show json
    > hejhog --request-headers --hide-urls # hide URLs

  options (eg. --urls):
    cert (optional)     provide a path to pem self signed cert
    key (optional)      provide a path to pem self signed key
    hide-urls           hide request urls
    just-urls           only show urls
    request-headers     show request headers
    response-headers    show response headers
    v, V or verbose     show all information
    html                show just html
    json                show json data
    params              show form request parameters
    warnings            show all warnings

  generating self signed certificates (with OpenSSL)
    openssl genrsa -out ./key.pem 2048
    openssl req -x509 -new -nodes -key ./key.pem -days 1024 -out crt.pem -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=example.com"

  then add certificate authority to browser via settings or preferences

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
    key: fs.readFileSync(path.normalize(path.join(process.cwd(), options.key))),
    cert: fs.readFileSync(path.normalize(path.join(process.cwd(), options.cert)))
  }
}).listen(options.port, function () {
  console.log('<hejhog> listening @', options.port)
});

if (VERBOSE && options.warnings) proxy.log('error warn debug', process.stderr);
if (VERBOSE && options.warnings) proxy.log('info', process.stdout);

process.on('uncaughtException', function (err) {
  if (VERBOSE && options.warnings) console.error(err.stack, err);
})

if (options['just-urls']) {
  return proxy.intercept({
    phase: 'response'
  }, function(req, resp) {
    console.log(' <request> ', req.method.toUpperCase(), ' ', req.protocol, '//', req.hostname, req.url, resp.statusCode)
  })
} else {
  /*  proxy.intercept({
    phase: 'request'
  }, function(req, resp, cycle) {
    cycle.data('query', req.query)
  })*/
  proxy.intercept({ phase: 'response', as: 'string' }, function (req, res, cycle) {
    var data = {
      url: req.url,
      protocol: req.protocol,
      port: req.port,
      hostname: req.hostname,
      method: req.method,
      headers: req.headers,
      query: Object.assign({}, req.query)
    }
    if (VERBOSE || options['request-headers']) console.log(data)
    if (VERBOSE || options['response-headers']) console.log(res.headers)

	if (req.headers.accept.startsWith('text') && res.buffer && res.buffer.length) {
		if (!options['hide-urls']) console.log(' <request> ', req.method.toUpperCase(), ' ', req.protocol, '//', req.hostname, req.url, res.statusCode)
		if (VERBOSE || options.html) console.log(res.string);
	} else if (req.headers.accept.startsWith('image') && !options['hide-urls']) {
		console.log(' <response> [IMAGE] ', req.method.toUpperCase(), req.hostname, ' ', req.url, res.statusCode);
	}

    // testing for XSS
    var query = data.query
    Object.values(query).forEach(function (value) {
      if (res.string.includes(value)) {
        console.log('...'.repeat(100))
        console.log('input reflected in page response ', value, ' found in response')
        console.log('...'.repeat(100))
      }
    })
    var params = cycle.data('params')
    Object.values(params).forEach(function (value) {
      if (res.string.includes(value)) {
        console.log('...'.repeat(100))
        console.log('params found in page response ', value, ' ')
        console.log('...'.repeat(100))
      }
    })
  })
}

if (VERBOSE || options.json)  {
  proxy.intercept({
    phase: 'request',
    as: 'json'
  }, function (req, res, cycle) {
    console.log(' <request> [json]', Object.assign({}, req.json))
  })
  proxy.intercept({
    phase: 'response',
    as: 'json'
  }, function (req, res, cycle) {
    console.log(' <response> [json]', Object.assign({}, res.json))
  })
}

if (VERBOSE || options.params)  {
  proxy.intercept({
    phase: 'request',
    as: 'params'
  }, function (req, res, cycle) {
    if (Object.keys(req.params).length) {
      cycle.data('params', Object.assign({}, req.params))
      console.log(' <request> [params]', Object.assign({}, req.params))
    }
  })
}
