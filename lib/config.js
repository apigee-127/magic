'use strict';

var path = require('path');
var swaggerFile = path.resolve(path.dirname(require.main.filename), 'api/swagger/swagger.yaml');

module.exports = {
  swaggerFile: swaggerFile,
  controllers: {
    useStubs: true,
    controllers: './api/controllers'
  },
  loader: require('./loader')
};
