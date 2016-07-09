var speedometer = require('speedometer')
var prettyBytes = require('pretty-bytes')

var $ = document.querySelector.bind(document)

function Stats (el, interval) {
  if (!(this instanceof Stats)) return new Stats(el, interval)
  var self = this
  self.feeds = {}
  self.el = el

  setInterval(function () {
    var keys = Object.keys(self.feeds)
    for (var i = 0; i < keys.length; i++) {
      var st = self.feeds[keys[i]]
      self.$$(keys[i], '.upload-speed').innerText = prettyBytes(st.uploadSpeed()) + '/s'
      self.$$(keys[i], '.download-speed').innerText = prettyBytes(st.downloadSpeed()) + '/s'
    }
  }, interval || 500)
}

Stats.prototype.$$ = function (name, sel) {
  return this.el.querySelector('#' + (name || 'unknown') + ' ' + sel)
}

Stats.prototype._get = function (name) {
  var self = this
  if (!name) name = 'unknown'
  var st = self.feeds[name]
  if (!st) {
    var div = document.createElement('div')
    div.id = name
    div.innerHTML = self.el.querySelector('#template').innerHTML
    div.className = 'feed'

    if (name !== 'unknown') {
      div.querySelector('.name').innerText = name
    }

    self.el.appendChild(div)

    st = self.feeds[name] = {
      blocks: 0,
      uploadSpeed: speedometer(),
      downloadSpeed: speedometer(),
      div: div
    }
  }

  return st
}

Stats.prototype._update = function () {
  var self = this
  var keys = Object.keys(self.feeds)
  for (var i = 0; i < keys.length; i++) {
    var st = self.feeds[keys[i]]
    self.$$(keys[i], '.upload-speed').innerText = prettyBytes(st.uploadSpeed()) + '/s'
    self.$$(keys[i], '.download-speed').innerText = prettyBytes(st.downloadSpeed()) + '/s'
  }
}

Stats.prototype.onkey = function (data) {
  var self = this
  $('#key').innerText = data.key

  while ($('.feed')) self.el.removeChild($('.feed'))
  self.feeds = {}
}

function updateHeader (data) {
  this.$$(data.name, '.overview').innerText = data.blocks.length + ' blocks (' + prettyBytes(data.bytes) + ')'
}

Stats.prototype.onpeerupdate = function (data) {
  $('#peers').innerText = 'Connected to ' + data.peers + ' peer' + (data.peers === 1 ? '' : 's')
}

Stats.prototype.ondownload = function (data) {
  this._get(data.name).downloadSpeed(data.bytes)
  this.$$(data.name, '.block-' + data.index).style.backgroundColor = 'gray'
}

Stats.prototype.onupload = function (data) {
  var self = this
  this._get(data.name).uploadSpeed(data.bytes)
  this.$$(data.name, '.block-' + data.index).style.backgroundColor = '#35b44f'
  setTimeout(function () {
    self.$$(data.name, '.block-' + data.index).style.backgroundColor = 'gray'
  }, 500)
}

Stats.prototype.onfeed = function (data) {
  var self = this
  var blocks = this._get(data.name).blocks = data.blocks.length
  updateHeader(data)

  for (var i = 0; i < blocks; i++) {
    self._appendDot(data.name, i)
    if (data.blocks[i]) self.$$(data.name, '.block-' + i).style.backgroundColor = 'gray'
  }
}

Stats.prototype.onupdate = function (data) {
  var self = this
  updateHeader(data)

  for (var i = self._get(data.name).blocks; i < data.blocks.length; i++) {
    self._get(data.name).blocks++
    self._appendDot(data.name, i)
    if (data.blocks[i]) self.$$(data.name, '.block-' + i).style.backgroundColor = 'gray'
  }
}

Stats.prototype._appendDot = function (name, i) {
  var div = document.createElement('div')
  div.className = 'dot block-' + i
  this.$$(name, '.blocks').appendChild(div)
}
