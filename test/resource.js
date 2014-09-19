var should = require('should');
var path = require('path');
var a127config = require('../lib/config');
var middleware = require('../lib/middleware');

var resource = require('../lib/resource')();

process.env.A127_APPROOT = __dirname;
var SWAGGER_FILE = path.resolve(__dirname, 'api', 'swagger', 'swagger.yaml');

var config = a127config.load();

config['a127.magic'].swaggerFile = SWAGGER_FILE;

describe('resource', function() {

  it('oauth must be made available', function(done) {
    var oauth = resource('oauth2');
    should.exist(oauth);
    done();
  });
});
