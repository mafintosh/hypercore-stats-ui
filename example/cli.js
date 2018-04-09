#!/usr/bin/env node

var stats = require('./server.js')
var http = require('http')
var hyperdiscovery = require('hyperdiscovery')
var minimist = require('minimist')

var argv = minimist(process.argv.slice(2), {
  alias: {port: 'p', 'hyperdrive': 'd', wait: 'w'},
  boolean: ['hyperdrive']
})

var hypercore = require('hypercore')
var hyperdrive = require('hyperdrive')
var ram = require('random-access-memory')

var key = argv._[0]
if (!key) {
  console.error(
    `Usage: node cli [--port=<port>] [--hyperdrive] \n` +
    `          [--wait=<seconds>] <key>\n`
  )
  process.exit(1)
}

var target = argv.hyperdrive ? hyperdrive(ram, key) : hypercore(ram, key)

var server = http.createServer(stats(target))

server.on('listening', function () {
  target.ready(function () {
    console.log('Feed/archive:', target.key.toString('hex'))
    console.log('Stats listening on port ' + server.address().port)

    if (argv.wait) setTimeout(join, Number(argv.wait) * 1000)
    else join()
  })
})

server.listen(argv.port || process.env.PORT || 10000)
server.once('error', function () {
  server.listen(0)
})

function join () {
  var sw = hyperdiscovery(target)
  sw.on('connection', function (peer, type) {
    console.log('connected to', sw.connections.length, 'peers')
    peer.on('close', function () {
      console.log('peer disconnected')
    })
  })
}
