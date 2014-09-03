'use strict';

var volosSwagger = require('volos-swagger');
var loader = require('./loader');
var swaggerObject = loader.load();
var config = require('./config').load();
var resources = volosSwagger(swaggerObject, config.volos).resources;

module.exports = function(name) {
  return resources[name];
};
