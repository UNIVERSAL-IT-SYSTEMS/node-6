'use strict';

var
  should = require('should'),
  request = require('supertest'),
  async = require('async'),
  helper = require('./helper');

var
  open = require('./data/open'),
  closed = require('./data/closed'),
  labeled = require('./data/labeled'),
  header = require('./data/header'),
  signatures = {
    labeled: 'sha1=0860913dc2028e49066178f87f5f6b0782d2405e',
    opened: 'sha1=3ecf9ae43d6f776aba3c74250c2ac0b860968e08',
    closed: 'sha1=16e3afc8d6df6263ac8d396f695f4b2a59594184'
  };

describe('GitHub Issue Hook', function () {
  describe('POST /talks/delivery', function () {
    it('should ignore an open issue', function (done) {
      request(helper.url)
        .post('/talks/delivery')
        .set('user-agent', 'GitHub-Hookshot/0687198')
        .set('x-github-event', 'issues')
        .set('x-github-delivery', '1d47d080-6739-11e4-888d-27aabec3ed50')
        .set('x-hub-signature', signatures.opened)
        .set('content-type', 'application/json')
        .send(open)
        .end(function (error, res) {
          should.exist(res.status);
          res.status.should.equal(200);
          done();
        });
    });

    it('should process a labeled issue', function (done) {
      request(helper.url)
        .post('/talks/delivery')
        .set('user-agent', 'GitHub-Hookshot/0687198')
        .set('x-github-event', 'issues')
        .set('x-github-delivery', '1d47d080-6739-11e4-888d-27aabec3ed50')
        .set('x-hub-signature', signatures.labeled)
        .set('content-type', 'application/json')
        .send(labeled)
        .end(function (error, res) {
          should.exist(res.status);
          res.status.should.equal(200);
          done();
        });
    });

    it('should process a closed issue', function (done) {
      request(helper.url)
        .post('/talks/delivery')
        .set('user-agent', 'GitHub-Hookshot/0687198')
        .set('x-github-event', 'issues')
        .set('x-github-delivery', '1d47d080-6739-11e4-888d-27aabec3ed50')
        .set('x-hub-signature', signatures.closed)
        .set('content-type', 'application/json')
        .send(closed)
        .end(function (error, res) {
          should.exist(res.status);
          res.status.should.equal(200);
          done();
        });
    });
  });
});
