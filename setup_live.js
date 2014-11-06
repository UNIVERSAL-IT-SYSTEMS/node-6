var
  config = require('../common/config'),
  async = require('async'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port);

var today = new Date();

var events = [{
  "type": "event",
  "_id": "first_event",
  "title": "First Node.js Barcelona Meeting",
  "date": [
    2014,
    11,
    26,
    19,
    00
  ],
  "location": {
    "name": "Itnig",
    "address": "C/ Alaba 63"
  }
}];

var talks = [{
  "type": "talk",
  "event": "first_event",
  "speaker": {
    "twitter": "fmvilas",
    "name": "Francisco Méndez Vilas",
    "portrait": "https://pbs.twimg.com/profile_images/460006524547387392/5lmkB4P3.jpeg"
  },
  "level": "Intermediate",
  "language": "en",
  "git": "",
  "slides": "",
  "video": "",
  "title": "Architecting a cloud-based IDE with Node.js and MongoDB",
  "description": "How to architect a cloud IDE, managing dependencies, using storage services (such as Amazon S3) and using MongoDB services (such as MongoLab or MongoHQ)."
}];

nano.db.destroy('nodebcn', function () {});

nano.db.create('nodebcn', function (error, body) {
  var db = nano.use('nodebcn');

  async.series([
    function (fn) {
      async.each(talks, function (talk, fn) {
        db.insert(talk, function () {
          fn();
        });
      }, function () {
        fn();
      });
    },
    function (fn) {
      db.insert({
        "_id": "_design/events",
        "language": "javascript",
        "views": {
          "index": {
            "map": "function(doc) {\nif (doc.type === 'event') {\nemit(doc.date, doc);\n}\n}"
          }
        }
      }, function () {
        fn();
      });
    },
    function (fn) {
      db.insert({
        "_id": "_design/talks",
        "language": "javascript",
        "views": {
          "index": {
            "map": "function(doc) {\nif (doc.type === 'talk') {\nemit(doc.event, doc);\n}\n}"
          }
        }
      }, function () {
        fn();
      });
    },
    function (fn) {
      async.each(events, function (event, fn) {
        db.insert(event, function () {
          fn();
        });
      }, function () {
        fn();
      });
    }
  ], function () {
    process.exit(0);
  });
});
