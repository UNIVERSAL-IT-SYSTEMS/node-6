var express = require('express'),
  config = require('../common/config'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port),
  db = nano.use('nodebcn'),
  async = require('async'),
  moment = require('moment'),
  router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  var
    today = new Date(),
    next_event = {},
    talks = [];

  db.view('events', 'index', {
    startkey: [today.getYear(), today.getMonth(), today.getDate()]
  }, function (error, result) {
    next_event = result.rows[0].value;
    db.view('talks', 'index', {
      key: result.rows[0].id
    }, function (error, result) {
      async.each(result.rows, function (talk, fn) {
        talks.push(talk.value);
        fn();
      }, function () {
        res.locals = {
          title: 'Node.js Barcelona User Group',
          event: next_event,
          talks: talks
        };
        res.render('index');
      });
    });
  });
});

module.exports = router;
