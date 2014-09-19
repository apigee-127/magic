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

// todo: potentially pull stuff from vault as well...

var path = require('path');
var fs = require('fs');
var yaml = require('yamljs');
var debug = require('debug')('a127');
var _ = require('underscore');
var loader = require('./loader');
var volosSwagger = require('volos-swagger');

module.exports = {
  env: getEnvironment,
  load: getConfig,
  reload: useConfig
};

var ENV_FILENAME = '.a127_env';
var SECRETS_FILENAME = '.a127_secrets';

var BASE_DEFAULTS = {
  'a127.magic': {
    swaggerFile: 'api/swagger/swagger.yaml',
    controllers: {
      useStubs: false,
      controllers: 'api/controllers',
      mocks: 'api/mocks'
    },
    volos: {
      helpers: 'api/helpers'
    }
  }
};

var appRoot, configDir, config, env;

function useConfig(a127Env) {

  env = config = undefined;

  appRoot = process.env.A127_APPROOT || path.dirname(require.main.filename);
  configDir = path.resolve(appRoot, 'config');

  if (!fs.existsSync(configDir)) {
    throw new Error('config directory doesn\'t exist: ' + configDir);
  }

  env = a127Env ? a127Env : getEnvironment();

  var defaultConfig = readYamlFromConfigFile('default.yaml');
  var currentConfig = env ? readYamlFromConfigFile(env + '.yaml') : {};
  var secrets = readSecretsFromVault();

  config = _.extend(BASE_DEFAULTS, defaultConfig, currentConfig, secrets);

  resolveRelativeProjectPaths(config);

  var magic = config['a127.magic'];
  var swaggerObject = loader.load(magic.swaggerFile, config);
  magic.swaggerObject = swaggerObject;

  var swaggerMiddleware = volosSwagger(swaggerObject, magic.volos);
  magic.swaggerMiddleware = swaggerMiddleware;

  magic.resource = require('./resource')(swaggerMiddleware.resources);

  return config;
}

function resolveRelativeProjectPaths(config) {
  var magic = config['a127.magic'];
  magic.swaggerFile = path.resolve(appRoot, magic.swaggerFile);
  if (_.isString(magic.controllers.controllers)) {
    magic.controllers.controllers = path.resolve(appRoot, magic.controllers.controllers);
  }
  magic.volos.helpers = path.resolve(appRoot, magic.volos.helpers);
}

// todo: actually use vault instead of file
function readSecretsFromVault() {
  return readYamlFromConfigFile(SECRETS_FILENAME);
}

function getEnvironment() {
  if (env) { return env; }
  env = process.env.A127_ENV || process.env.NODE_ENV;
  if (!env) { // load from file
    var envFile = path.resolve(configDir, ENV_FILENAME);
    env = readFileNoError(envFile);
  }
  if (debug.enabled) { debug('set environment: ' + env); }
  return env;
}

function readYamlFromConfigFile(fileName) {
  try {
    var file = path.resolve(configDir, fileName);
    var obj = yaml.load(file);
    if (debug.enabled) { debug('read config file: ' + file); }
    return obj;
  }
  catch(err) {
    if (debug.enabled) { debug('failed attempt to read config: ' + file); }
    return {};
  }
}

function readFileNoError(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (ex) {
    return null;
  }
}

function getConfig(a127Env) {
  if (!config || (a127Env && env !== a127Env)) { useConfig(a127Env); }
  return config;
}
