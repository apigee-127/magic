/****************************************************************************
 The MIT License (MIT)

 Copyright (c) 2014 Apigee Corporation

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
'use strict';

var a127Config = require('./config');
var swaggerTools = require('swagger-tools').middleware.v2_0;

module.exports = middleware;

function middleware() {

  var config = a127Config.load();
  var startConfig = config._a127_start_config || {};
  if (startConfig.debug && !process.env.DEBUG) {
    process.env.DEBUG = startConfig.debug;
  }

  var magic = config['a127.magic'];
  var swaggerMiddleware = magic.swaggerMiddleware;

  var controllers = [];
  var mainControllers = startConfig.mock ? magic.controllers.mocks : magic.controllers.controllers;
  if (mainControllers) { controllers.push(mainControllers); }
  controllers.push(swaggerMiddleware.controllers);

  var routerConfig = {
    useStubs: startConfig.mock || magic.controllers.useStubs,
    controllers: controllers
  };

  return chain([
    swaggerTools.swaggerMetadata(magic.swaggerObject),
    swaggerTools.swaggerValidator(),
    swaggerMiddleware,
    addResourceToRequest(magic.resource),
    swaggerTools.swaggerRouter(routerConfig)
  ]);
}

function addResourceToRequest(resource) {
  var a127Resource = { resource: resource };
  return function(req, res, next) {
    req.a127 = a127Resource;
    next();
  };
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
