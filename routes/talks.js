var express = require('express'),
  config = require('../common/config'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port),
  db = nano.use('nodebcn'),
  async = require('async'),
  moment = require('moment'),
  router = express.Router();

/* GET talks page. */
router.get('/', function (req, res) {
  var
    talks = [];

  db.view('talks', 'index', function (error, result) {
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
        title: 'All Talks',
        talks: talks
      };
      res.render('talks');
    });
  });
});

module.exports = router;
