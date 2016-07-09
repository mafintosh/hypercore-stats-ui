#!/usr/bin/env node

var stats = require('./server.js')
var http = require('http')
var memdb = require('memdb')
var swarm = require('hyperdrive-archive-swarm')
var minimist = require('minimist')

var argv = minimist(process.argv.slice(2), {
  alias: {port: 'p', wait: 'w'}
})

var hyperdrive = require('hyperdrive')
var archive = hyperdrive(memdb()).createArchive(argv._[0])
var server = http.createServer(stats(archive))

server.on('listening', function () {
  console.log('Feed: ' + archive.key.toString('hex'))
  console.log('Stats listening on port ' + server.address().port)
  if (argv.wait) setTimeout(join, Number(argv.wait))
  else join()
})

server.listen(argv.port || 10000)
server.once('error', function () {
  server.listen(0)
})

function join () {
  console.log('joining swarm')
  swarm(archive)
}
