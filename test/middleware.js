var a127config = require('../lib/config');

process.env.A127_APPROOT = __dirname;

var middleware = require('../lib/middleware');

describe('middleware', function() {

  var config;
  before(function(done) {
    a127config.load(function(conf) {
      config = conf;
      done();
    });
  });

  it('must load correctly', function(done) {
    middleware(config);
    done();
  });
});
