# hypercore-stats-ui

HTML based stats ui for [hypercore](https://github.com/mafintosh/hypercore)/[hyperdrive](https://github.com/mafintosh/hyperdrive)

```
npm install hypercore-stats-ui
```

## Usage

``` js
var http = require('http')
var stats = require('hypercore-stats-ui')
var ram = require('random-access-memory')
var hypercore = require('hypercore')

var feed = hypercore(ram, '72671c5004d3b956791b6ffca7f05025d62309feaf99cde04c6f434189694291')

http.createServer(stats(feed)).listen(1000)
```

And visit http://localhost:10000 in the browser.

<img src="https://mafintosh.github.io/assets/hypercore-stats.gif" width="600">
<img src="https://mafintosh.github.io/assets/hypercore-stats-uploader.gif" width="600">

## API

#### `var onrequest = stats(feed or archive)`

Create a new stats interface for a hypercore feed or hyperdrive archive.

## License

MIT
