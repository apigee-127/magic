'use strict';

var fs = require('fs');
var yaml = require('js-yaml');

module.exports = {
  load: load
};

function load(file) {
  var swaggerObject = yaml.safeLoad(fs.readFileSync(file, 'utf8'));

  // todo: set replacement values

  return swaggerObject;
}
