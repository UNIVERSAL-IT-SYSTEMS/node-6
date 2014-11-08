var
  config = require('../common/config'),
  async = require('async'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port);

exports.url = 'http://127.0.0.1:3000';

afterEach(function (done) {
  done();
});

after(function (done) {
  nano.db.destroy('nodebcn-dev', function () {
    done();
  });
});

beforeEach(function (done) {
  done();
});

before(function (done) {
  nano.db.create('nodebcn-dev', function (error, body) {
    var db = nano.use('nodebcn-dev');

    async.series([
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
      }
    ], function () {
      done();
    });
  });
});
