var
  express = require('express'),
  debug = require('debug')('node.barcelonajs.org'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  hbs = require('hbs'),
  routes = require('./routes/index'),
  talks = require('./routes/talks');

var app = express();
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('view options', { layout: 'layout' });
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', hbs.__express);

hbs.registerPartials(__dirname + '/views/partials');
hbs.localsAsTemplateData(app);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(require('node-compass')({mode: 'expanded'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(require('node-compass')({
  mode: 'expanded'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/talks', talks);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = app.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port);
});
