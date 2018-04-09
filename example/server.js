var corsify = require('corsify')
var fs = require('fs')
var path = require('path')
var server = require('hypercore-stats-server')

var cors = corsify({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
})

module.exports = function (archive) {
  return cors(function (req, res) {
    if (req.url === '/') return file('index.html', 'text/html', res)
    if (req.url === '/bundle.js') return file('bundle.js', 'text/javascript', res)
    server(archive, res)
  })
}

function file (name, type, res) {
  res.setHeader('Content-Type', type + '; charset=utf-8')
  fs.readFile(path.join(__dirname, name), function (err, buf) {
    if (err) return res.end()
    res.end(buf)
  })
}
