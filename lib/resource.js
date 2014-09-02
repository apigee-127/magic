'use strict';

var volosSwagger = require('volos-swagger');
var loader = require('./loader');
var swaggerObject = loader.load();
var resources = volosSwagger(swaggerObject).resources;

module.exports = function(name) {
  return resources[name];
};
