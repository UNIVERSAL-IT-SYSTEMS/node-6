var express = require('express'),
  config = require('../common/config'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port),
  db = nano.use(config.couchdb.db),
  async = require('async'),
  moment = require('moment'),
  router = express.Router();
var util = require('util');

/* GET home page. */
router.get('/', function (req, res) {
  var
    today = new Date(),
    next_event = {},
    talks = [];

  db.view('events', 'index', {
    startkey: [today.getFullYear(), today.getMonth(), today.getDate()]
  }, function (error, result) {
    if (error || result.total_rows === 0) {
      res.locals = {
        title: 'Node.js Barcelona User Group',
        event: {
          title: 'to be announced soon.'
        },
        talks: [{}, {}]
      };
      res.render('index');
    } else {

      next_event = result.rows[0].value;

      db.view('talks', 'index', {
        key: result.rows[0].id
      }, function (error, result) {
        async.each(result.rows, function (talk, fn) {
          talks.push(talk.value);
          fn();
        }, function () {
          if (talks.length === 0) {
            talks = [{}, {}];
          } else if (talks.length < 2) {
            talks.push({});
          }
          res.locals = {
            title: 'Node.js Barcelona User Group',
            event: next_event,
            date: moment(next_event.date).format('ddd, D MMM, HH:mm'),
            talks: talks
          };
          res.render('index');
        });
      });
    }
  });
});

module.exports = router;
