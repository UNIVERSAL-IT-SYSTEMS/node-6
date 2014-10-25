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
    today.getYear(),
    today.getMonth(),
    today.getDate(),
    19,
    30
  ],
  "location": {
    "name": "Itnig",
    "address": "C/ Alaba 63"
  }
}];

var talks = [{
  "type": "talk",
  "event": "first_event",
  "title": "Using the API Blueprint to generate nodejs consumers",
  "speaker": {
    "twitter": "bpedro",
    "name": "Bruno Pedro",
    "portrait": "https://pbs.twimg.com/profile_images/378800000473642830/2f20ecdcd1ec41452b174d04a69e87ee.jpeg"
  },
  "level": "Intermediate",
  "language": "en",
  "git": "",
  "slides": "http://www.slideshare.net/bpedro/api-code-generation",
  "video": "https://vimeo.com/87488883",
  "description": "I'll show you how to generate a nodejs API consumer by using the API Blueprint (http://apiblueprint.org/) to generate code from a Postman (http://www.getpostman.com/) collection."
}, {
  "type": "talk",
  "event": "first_event",
  "title": "Backbone, Marionette and other puppets",
  "speaker": {
    "twitter": "ainformatico",
    "name": "Alejandro El Informatico",
    "portrait": ""
  },
  "level": "Intermediate",
  "language": "es/en",
  "git": "",
  "slides": "http://www.alejandroelinformatico.com/slideshows/en/marionette-js/#/",
  "video": "https://vimeo.com/89510571",
  "description": "Now that you know Backbone.js is time to become a puppeteer and use Marionette.js, a composite application library for Backbone.js that aims to simplify the construction of large scale Javascript applications."
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
