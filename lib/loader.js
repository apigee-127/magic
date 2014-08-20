'use strict';

var yaml = require('js-yaml');

module.exports = {
  load: load
};

function swagger() {
  return yaml.load(config.swaggerFile);
}
