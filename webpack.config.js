const DEV_PORT = parseInt(process.env.DEV_PORT, 10) || 3005

module.exports = {
  entry: getEntrySources(['./src/seandonmooy.com/index.jsx']),
  output: {
    path: `${__dirname}/_build`,
    filename: 'index.js',
    sourceMapFilename: 'index.js.map'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.md$/, loader: 'raw-loader' },
      { test: /\.(jpe?g|png|gif|svg)$/i, loaders: [ 'url?limit=8192', 'img-loader' ] },
      { test: /\.jsx$/, exclude: /node_modules/,
        loaders: [ 'babel-loader' ] }
    ]
  }
}

function getEntrySources (sources) {
  if (process.env.NODE_ENV !== 'production') {
    sources.push(`webpack-dev-server/client?http://localhost:${DEV_PORT}`)
    sources.push('webpack/hot/only-dev-server')
  }
  return sources
}
