var Stats = require('../')
var ess = require('event-source-stream')

var stats = Stats(document.body)

ess('http://' + window.location.host + '/events')
  .on('data', function (data) {
    data = JSON.parse(data)
    switch (data.type) {
      case 'key': return stats.onkey(data)
      case 'peer-update': return stats.onpeerupdate(data)
      case 'feed': return stats.onfeed(data)
      case 'update': return stats.onupdate(data)
      case 'download': return stats.ondownload(data)
      case 'upload': return stats.onupload(data)
    }
  })
