var
  debug = require('debug')('talks'),
  express = require('express'),
  config = require('../common/config'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port),
  db = nano.use(config.couchdb.db),
  async = require('async'),
  parser = require('markdown-parse'),
  crypto = require('crypto'),
  moment = require('moment'),
  router = express.Router();

var checkAndCreateEvent = function checkAndCreateEvent(milestone, callback) {
  db.get('event-' + milestone.id, function (error, event) {
    if (error && error.status_code === 409) {
      debug('event check', error);
      return callback(null, event);
    } else {
      var
        doc = {
          type: 'event',
          _id: 'event-' + milestone.id,
          location: {
            name: milestone.description.split(';')[1],
            address: milestone.description.split(';')[2]
          }
        },
        date = moment(milestone.due_on).toArray(),
        time = milestone.description.split(';')[0].split(':');

      date[3] = parseInt(time[0], 10);
      date[4] = parseInt(time[1], 10);

      if (date[4] === null) {
        date[4] = 0;
      }

      doc.date = date;

      db.insert(doc, function (error, success) {
        if (error) {
          debug('event insert', error);
          return callback(error);
        } else {
          return callback(null, doc);
        }
      });
    }
  });
};

/* GET talks page. */
router.get('/', function (req, res) {
  var
    talks = [];

  db.view('talks', 'index', function (error, result) {
    async.each(result.rows, function (talk, fn) {
      talks.push(talk.value);
      fn();
    }, function () {
      res.json(talks);
    });
  });
});

router.post('/delivery', function (req, res) {
  var
    hmac,
    calculatedSignature,
    payload = req.body;

  hmac = crypto.createHmac('sha1', config.github.secret);
  hmac.update(JSON.stringify(payload));
  calculatedSignature = 'sha1=' + hmac.digest('hex');

  if (req.headers['x-hub-signature'] !== calculatedSignature) {
    res.status(403).send('Forbidden');
  } else {
    if (payload.action === 'labeled') {
      if (payload.label.name === 'talk proposal') {
        var doc = {
          '_id': 'talk-' + payload.issue.id,
          'type': 'talk',
          'title': payload.issue.title,
          'speaker': {
            'github': payload.issue.user.login,
            'gravatar': payload.issue.user.gravatar_id,
            'portrait': payload.issue.user.avatar_url
          }
        };

        parser(payload.issue.body, function (error, result) {
          if (error) {
            debug('parser', error);
          }

          doc.description = result.body;

          if (result.attributes.language) {
            doc.language = result.attributes.language;
          }

          if (result.attributes.level) {
            doc.level = result.attributes.level;
          }

          if (result.attributes.tags) {
            doc.tags = result.attributes.tags;
          }

          if (result.attributes.twitter) {
            doc.speaker.twitter = result.attributes.twitter;
          }

          if (payload.milestone) {
            doc.event = payload.issue.milestone.title;
            checkAndCreateEvent(payload.issue.milestone, function (error, event) {
              if (error) {
                debug('event', error);
                res.status(500).send('Couldn\'t store data');
              } else {
                if (event) {
                  doc.event = event._id;
                }

                db.insert(doc, function (error, success) {
                  if (error) {
                    debug('talk insert', error);
                    res.status(500).send('Couldn\'t store data');
                  } else {
                    res.status(200).send('ok');
                  }
                });
              }
            });
          } else {
            db.insert(doc, function (error, success) {
              if (error) {
                debug('talk insert', error);
                res.status(500).send('Couldn\'t store data');
              } else {
                res.status(200).send('ok');
              }
            });
          }
        });
      } else {
        res.status(200).send('Thanks.');
      }
    } else if (payload.action === 'closed') {
      if (payload.issue.milestone) {
        checkAndCreateEvent(payload.issue.milestone, function (error, event) {
          if (error) {
            debug('event', error);
            res.status(500).send('Couldn\'t store data');
          } else {
            db.get('talk-' + payload.issue.id, function (error, doc) {
              if (error) {
                debug('talk get', error);
              }
              doc.event = event._id;
              db.insert(doc, function (error, success) {
                if (error) {
                  debug('talk insert', error);
                  res.status(500).send('Couldn\'t store data');
                } else {
                  res.status(200).send('ok');
                }
              });
            });
          }
        });
      } else {
        res.status(200).send('Thanks.');
      }
    } else {
      res.status(200).send();
    }
  }
});

module.exports = router;
