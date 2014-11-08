var
  config = require('./common/config'),
  async = require('async'),
  nano = require('nano')(config.couchdb.host + ':' + config.couchdb.port);

nano.db.destroy('nodebcn', function (error, success) {
  console.log('destroy', error, success);
});

nano.db.create('nodebcn', function (error, body) {
  var db = nano.use('nodebcn');

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
    process.exit(0);
  });
});
