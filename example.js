#!/usr/bin/env node

var stats = require('./')
var http = require('http')
var swarm = require('hyperdrive-archive-swarm')
var minimist = require('minimist')

var argv = minimist(process.argv.slice(2), {
  alias: {port: 'p', 'hyperdrive': 'd', wait: 'w'},
  boolean: ['hyperdrive']
})

var hypercore = require('hypercore')
var hyperdrive = require('hyperdrive')
var memdb = require('memdb')

var core = hypercore(memdb())
var f = core.createFeed(argv._[0])
var archive = null

if (argv.hyperdrive) {
  archive = hyperdrive(memdb()).createArchive(argv._[0])
}

var server = http.createServer(stats(archive || f))

server.on('listening', function () {
  console.log('Feed: ' + f.key.toString('hex'))
  console.log('Stats listening on port ' + server.address().port)

  if (argv.wait) setTimeout(join, Number(argv.wait))
  else join()
})

server.listen(argv.port || 10000)
server.once('error', function () {
  server.listen(0)
})

function join () {
  swarm(archive || f)
}
