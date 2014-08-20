'use strict';

var config = require('./config');
var swaggerTools = require('swagger-tools').middleware.v2_0;
var volosSwagger = require('volos-swagger');

module.exports = middleware;

function middleware() {

  var swaggerObject = config.loader.load(config.swaggerFile);

  return chain([
    swaggerTools.swaggerMetadata(swaggerObject),
    swaggerTools.swaggerValidator(),
    volosSwagger(swaggerObject),
    swaggerTools.swaggerRouter(config.controllers)
  ]);
}

function chain(middlewares) {

  if (!middlewares || middlewares.length < 1) {
    return function(req, res, next) { next(); };
  }

  return function(req, res, next) {
    function createNext(middleware, index) {
      return function(err) {
        if (err) { return next(err); }

        var nextIndex = index + 1;
        var nextMiddleware = middlewares[nextIndex] ? createNext(middlewares[nextIndex], nextIndex) : next;
        middleware(req, res, nextMiddleware);
      };
    }
    return createNext(middlewares[0], 0)();
  };
}
