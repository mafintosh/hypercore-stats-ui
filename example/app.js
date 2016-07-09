var ess = require('event-source-stream')
var speedometer = require('speedometer')
var prettyBytes = require('pretty-bytes')

var $ = document.querySelector.bind(document)
var $$ = function (name, sel) {
  return $('#' + (name || 'unknown') + ' ' + sel)
}

var feeds = {}

function get (name) {
  if (!name) name = 'unknown'
  var st = feeds[name]
  if (!st) {
    var div = document.createElement('div')
    div.id = name
    div.innerHTML = $('#template').innerHTML
    div.className = 'feed'

    if (name !== 'unknown') {
      div.querySelector('.name').innerText = name
    }

    document.body.appendChild(div)

    st = feeds[name] = {
      blocks: 0,
      uploadSpeed: speedometer(),
      downloadSpeed: speedometer(),
      div: div
    }
    console.log('new feed', st)
  }

  return st
}

setInterval(function () {
  var keys = Object.keys(feeds)
  for (var i = 0; i < keys.length; i++) {
    var st = feeds[keys[i]]
    $$(keys[i], '.upload-speed').innerText = prettyBytes(st.uploadSpeed()) + '/s'
    $$(keys[i], '.download-speed').innerText = prettyBytes(st.downloadSpeed()) + '/s'
  }
}, 500)

ess('http://' + window.location.host + '/events')
  .on('data', function (data) {
    data = JSON.parse(data)
    switch (data.type) {
      case 'key': return onkey(data)
      case 'peer-update': return onpeerupdate(data)
      case 'feed': return onfeed(data)
      case 'update': return onupdate(data)
      case 'download': return ondownload(data)
      case 'upload': return onupload(data)
    }
  })

function appendDot (name, i) {
  var div = document.createElement('div')
  div.className = 'dot block-' + i
  $$(name, '.blocks').appendChild(div)
}

function onkey (data) {
  $('#key').innerText = data.key

  while ($('.feed')) document.body.removeChild($('.feed'))
  feeds = {}
}

function updateHeader (data) {
  $$(data.name, '.overview').innerText = data.blocks.length + ' blocks (' + prettyBytes(data.bytes) + ')'
}

function onpeerupdate (data) {
  $('#peers').innerText = 'Connected to ' + data.peers + ' peer' + (data.peers === 1 ? '' : 's')
}

function ondownload (data) {
  get(data.name).downloadSpeed(data.bytes)
  $$(data.name, '.block-' + data.index).style.backgroundColor = 'gray'
}

function onupload (data) {
  get(data.name).uploadSpeed(data.bytes)
  $$(data.name, '.block-' + data.index).style.backgroundColor = '#35b44f'
  setTimeout(function () {
    $$(data.name, '.block-' + data.index).style.backgroundColor = 'gray'
  }, 500)
}

function onfeed (data) {
  var blocks = get(data.name).blocks = data.blocks.length
  updateHeader(data)

  for (var i = 0; i < blocks; i++) {
    appendDot(data.name, i)
    if (data.blocks[i]) $$(data.name, '.block-' + i).style.backgroundColor = 'gray'
  }
}

function onupdate (data) {
  updateHeader(data)

  for (var i = get(data.name).blocks; i < data.blocks.length; i++) {
    get(data.name).blocks++
    appendDot(data.name, i)
    if (data.blocks[i]) $$(data.name, '.block-' + i).style.backgroundColor = 'gray'
  }
}
