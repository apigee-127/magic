var should = require('should');
var path = require('path');
var a127config = require('../lib/config');

process.env.A127_APPROOT = __dirname;

var config = a127config.load();

var middleware = require('../lib/middleware');

describe('middleware', function() {

  it('must load correctly', function(done) {
    middleware();
    done();
  });
});
