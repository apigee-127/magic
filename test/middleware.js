var a127config = require('../lib/config');

process.env.A127_APPROOT = __dirname;

var middleware = require('../lib/middleware');
var should = require('should');

describe('middleware', function() {

  var config;
  before(function(done) {
    a127config.load(function(conf) {
      config = conf;
      done();
    });
  });

  it('must load correctly', function(done) {

    config.validateResponse.should.be.true;

    middleware(config);

    var magic = config['a127.magic'];
    should.exist(magic);

    var swaggerTools = magic.swaggerTools;
    should.exist(swaggerTools);

    done();
  });
});
