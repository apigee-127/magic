'use strict';

module.exports = {
  loader: require('./loader'),
  swaggerFile: './api/swagger/swagger.yaml',
  controllers: {
    useStubs: true,
    controllers: './api/controllers'
  }
};
