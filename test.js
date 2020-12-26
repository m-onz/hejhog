var http = require('http')

http.createServer(function (req, res) {

	res.setHeader('wurt', 'wahooo?')
	res.end('wahooooooo!')

}).listen(9000)
