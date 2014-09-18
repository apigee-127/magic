var should = require('should');
var path = require('path');
var a127config = require('../lib/config');

var CONFIG_DIR = path.resolve(__dirname, 'config');
process.env.A127_CONFIG = CONFIG_DIR;

var SWAGGER_FILE = path.resolve(CONFIG_DIR, 'swagger.yaml');

var config = a127config.load();

config['a127.magic'].swaggerFile = SWAGGER_FILE;
config['a127.magic'].controllers = {};

var middleware = require('../lib/middleware');

describe('middleware', function() {

  it('must load correctly', function(done) {
    middleware();
    done();
  });
});
