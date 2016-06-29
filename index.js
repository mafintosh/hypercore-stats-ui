var http = require('http')
var corsify = require('corsify')
var fs = require('fs')

module.exports = stats

function stats (feed) {
  var archive = feed.metadata ? feed : null

  if (archive) {
    feed = archive.metadata
  }

  var cors = corsify({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
  })

  return cors(function (req, res) {
    if (req.url === '/') return file('app.html', 'text/html', res)
    if (req.url === '/bundle.js') return file('bundle.js', 'test/javascript', res)

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')

    send(res, {type: 'key', key: feed.key.toString('hex')})

    if (archive) track(feed, 'metadata')
    else track(feed, null)

    send(res, {type: 'peer-update', peers: feed.peers.length})

    feed.on('peer-add', onpeeradd)
    feed.on('peer-remove', onpeerremove)

    if (archive) {
      archive.open(function () {
        track(archive.content, 'content')
      })
    }

    res.on('close', function () {
      feed.removeListener('peer-add', onpeeradd)
      feed.removeListener('peer-remove', onpeerremove)
    })

    function track (feed, name) {
      send(res, {type: 'feed', name: name, key: feed.key.toString('hex'), blocks: bitfield(feed), bytes: feed.bytes})

      feed.on('update', onupdate)
      feed.on('download', ondownload)
      feed.on('upload', onupload)

      res.on('close', function () {
        feed.removeListener('update', onupdate)
        feed.removeListener('download', ondownload)
        feed.removeListener('upload', onupload)
      })

      function onupdate () {
        send(res, {type: 'update', name: name, key: feed.key.toString('hex'), blocks: bitfield(feed), bytes: feed.bytes})
      }

      function ondownload (index, data) {
        send(res, {type: 'download', name: name, index: index, bytes: data.length})
      }

      function onupload (index, data) {
        send(res, {type: 'upload', name: name, index: index, bytes: data.length})
      }
    }

    function onpeeradd () {
      send(res, {type: 'peer-update', peers: feed.peers.length})
    }

    function onpeerremove () {
      send(res, {type: 'peer-update', peers: feed.peers.length})
    }
  })

  function file (name, type, res) {
    res.setHeader('Content-Type', type + '; charset=utf-8')
    fs.readFile(__dirname + '/' + name, function (err, buf) {
      if (err) return res.end()
      res.end(buf)
    })
  }

  function bitfield (feed) {
    var list = []
    for (var i = 0; i < feed.blocks; i++) {
      list.push(feed.has(i))
    }
    return list
  }

  function send (res, message) {
    res.write('data: ' + JSON.stringify(message) + '\n\n')
  }
}
