
const fs = require('fs')
const gulp = require('gulp')
const gutil = require('gulp-util')
const vinyl = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const browserSync = require('browser-sync')
const less = require('gulp-less')
const modrewrite = require('connect-modrewrite')
const sourcemaps = require('gulp-sourcemaps')
const replace = require('gulp-replace')

// gutil.log = gutil.noop
const clientSync = browserSync.create()
const tasks = {}

const frontendPort = 3005
const CDN_URI = process.env.CDN_URI || `https://localhost:${frontendPort}`

const loaders = [ {
  test: /\.jsx?$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: {
    presets: ['latest'],
    plugins: ['transform-vue-jsx']
  }
}, {
  test: /\.json$/,
  exclude: /node_modules/,
  loader: 'json'
},
  { test: /\.less$/, loader: 'style!css!less' },
  { test: /\.css$/, loader: 'style!css' },
  { test: /\.md$/, loader: 'raw' },
  { test: /\.(jpe?g|png|gif|svg)$/i, loaders: [ 'url?limit=8192', 'img' ] }
]

const handleErrors = function (err) {
  gutil.log(err)
  this.emit('end')
}
function doCopy (version, name, ext, dest) {
  if (!ext) ext = '*'
  if (!dest) dest = name
  tasks[`${name}-copy`] = function () {
    return gulp.src([`./src/${name}/**/${ext}`]).on('error', handleErrors)
    .pipe(gulp.dest(`./_build/${dest}/`)).pipe(clientSync.stream())
  }
  gulp.task(`${name}-copy`, tasks[`${name}-copy`])
}
function doHtml (version, name, dest) {
  if (!dest) dest = name
  tasks[`${name}-html`] = function () {
    return gulp.src([`./src/${name}/**/*.html`]).on('error', handleErrors)
    .pipe(replace('$CDN_URI', CDN_URI)).pipe(replace('$VERSION', version))
    .pipe(gulp.dest(`./_build/${dest}/`)).pipe(clientSync.stream())
  }
  gulp.task(`${name}-html`, tasks[`${name}-html`])
}
function doLess (version, name) {
  tasks[`${name}-less`] = function () {
    return gulp.src([`./src/${name}/**/*.less`])
      .pipe(less({})).on('error', handleErrors)
      .pipe(replace('$CDN_URI', CDN_URI)).pipe(replace('$VERSION', version))
      .pipe(gulp.dest(`./_build/${name}`))
      .pipe(clientSync.stream())
  }
  gulp.task(`${name}-less`, tasks[`${name}-less`])
}

const WWW_VERSION = fs.readFileSync('./src/seandonmooy.com/version.txt').toString().split('\n')[0]
doCopy(WWW_VERSION, 'seandonmooy.com/assets')
doHtml(WWW_VERSION, 'seandonmooy.com')
doCopy(WWW_VERSION, 'seandonmooy.com/favicons', '*', 'seandonmooy.com')
doLess(WWW_VERSION, 'seandonmooy.com')

gulp.task('default', Object.keys(tasks))
