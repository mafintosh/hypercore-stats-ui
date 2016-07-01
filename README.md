# hypercore-stats-ui

HTML based stats ui for [hypercore](https://github.com/mafintosh/hypercore)/[hyperdrive](https://github.com/mafintosh/hyperdrive)

```
npm install hypercore-stats-ui
```

## Usage

``` js
var http = require('http')
var stats = require('hypercore-stats-ui')
var hypercore = require('hypercore')
var level = require('level')

var core = hypercore(level('database'))
var feed = core.createFeed('4e397d94d0f5df0e2268b2b7b23948b6dddfca66f91c2d452f404202e6d0f626')

http.createServer(stats(feed)).listen(1000)
```

And visit http://localhost:10000 in the browser.

<img src="https://mafintosh.github.io/assets/hypercore-stats.gif" width="600">
<img src="https://mafintosh.github.io/assets/hypercore-stats-uploader.gif" width="600">

## API

#### `var onrequest = stats(feed or archive)`

Create a new stats interface for a hypercore feed or hyperdrive archive.

## Develop

To modify css, run:
```
npm run build-css
npm run watch-css
```

## License

MIT
