var
  config = require('../common/config'),
  async = require('async'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port);

var talks = [{
  "type": "talk",
  "title": "Using the API Blueprint to generate nodejs consumers",
  "speaker": {
    "twitter": "bpedro",
    "name": "Bruno Pedro",
    "portrait": "https://pbs.twimg.com/profile_images/378800000473642830/2f20ecdcd1ec41452b174d04a69e87ee.jpeg"
  },
  "date": [
    2014,
    11,
    16
  ],
  "level": "Intermediate",
  "language": "en",
  "git": "",
  "slides": "http://www.slideshare.net/bpedro/api-code-generation",
  "video": "https://vimeo.com/87488883",
  "description": "I'll show you how to generate a nodejs API consumer by using the API Blueprint (http://apiblueprint.org/) to generate code from a Postman (http://www.getpostman.com/) collection."
}, {
  "type": "talk",
  "date": [
    2014,
    11,
    16
  ],
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

nano.db.create('nodebcn', function (error, body) {
  var db = nano.use('nodebcn');

  async.series(
    [

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
          "_id": "_design/talks",
          "language": "javascript",
          "views": {
            "index": {
              "map": "function(doc) {\nif (doc.type === 'talk') {\nemit(doc.date, doc);\n}\n}"
            }
          }
        });
      }
    ], function () {
      process.exit(0);
    }
  );
});
