var express = require('express'),
  config = require('../common/config'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port),
  db = nano.use('nodebcn'),
  async = require('async'),
  crypto = require('crypto'),
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

router.post('/delivery', function (req, res) {
  var
    hmac,
    calculatedSignature,
    payload = req.body;

  console.log(payload);

  hmac = crypto.createHmac('sha1', config.github.secret);
  hmac.update(payload);
  calculatedSignature = hmac.digest('hex');

  if (req.headers['x-hub-signature'] === calculatedSignature) {
    console.log('all good');
  } else {
    console.log('not good');
  }
  res.status(200).send('ok');
});

module.exports = router;
