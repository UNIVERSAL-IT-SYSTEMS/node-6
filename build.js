var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var collections = require('metalsmith-collections');
var assets = require('metalsmith-assets');
var uglify = require('metalsmith-uglify');
var metadata = require('metalsmith-metadata');
var permalinks = require('metalsmith-permalinks');
var sass = require('metalsmith-sass');

Metalsmith(__dirname)
  .source('src/')
  .destination('./build')
  .use(metadata({
    'event': './data/event.json'
  }))
  .use(collections({
    talks: 'talks/*.md',
    sortBy: 'date',
    reverse: true
  }))
  .use(permalinks({
    pattern: ':collection/:title'
  }))
  .use(markdown())
  .use(layouts({
    engine: 'handlebars',
    partials: 'partials'
  }))
  .use(sass({
    outputStyle: 'expanded',
    outputDir: 'assets/css/'
  }))
  .use(assets({
    source: './assets', // relative to the working directory
    destination: './assets' // relative to the build directory
  }))
  .use(uglify())
  .build(function(error) {
    if (error) {
      console.log(error);
    }
  });
