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

var fs = require('fs');
var yaml = require('yamljs');
var a127Config = require('./config');
var _ = require('underscore');
var stream = require('stream');

module.exports = {
  load: load
};

var cached = {};

function load(file, config) {

  if (!config) { config = a127Config.load();}
  if (!file) { file = config['a127.magic'].swaggerFile; }

  if (cached.config !== config || cached.file !== file || !cached.yaml) {
    cached.config = config;
    cached.file = file;

    var sourceString = fs.readFileSync(file, 'utf8');
    var replacementString = doConfigReplacements(sourceString, config);
    cached.yaml = yaml.parse(replacementString);
  }

  return cached.yaml;
}

function doConfigReplacements(source, config) {
  var sourceLines = source.split('\n');
  var returnLines = [];
  var inConfig, anchorIndent, finished;
  sourceLines.forEach(function(line) {
    if (finished) {
      returnLines.push(line);
    } else {
      if (inConfig && line[0] !== ' ') { // back to 0 indent after x-a127-config == we're done
        finished = true;
        returnLines.push(line);
      } else {
        var tokens = line.trim().split(' ');
        var keyToken = tokens[0];
        if (inConfig) { // this is potential config stuff, let's do it
          var indent = line.indexOf(tokens[0]);
          if (anchorIndent) { // we're inside a tag
            if (indent <= anchorIndent) { anchorIndent = null; }
          }
          if (!anchorIndent) { // start a tag?
            var key = keyToken.slice(0, keyToken.length - 1);
            var anchor = getAnchor(tokens);
            if (anchor) {
              var configValue = config[key];
              if (configValue) { // we need to do a replacement
                anchorIndent = indent;
                var upTo = line.lastIndexOf(anchor) + anchor.length;
                var partialLine = line.slice(0, upTo); // cut off anything after the reference
                var configYaml = yaml.stringify(configValue);
                if (typeof(configValue) === 'string') { // string goes inline
                  partialLine += ' ' + configYaml;
                  returnLines.push(partialLine);
                } else {
                  returnLines.push(partialLine); // anything else on following lines
                  var yamlLines = configYaml.split('\n');
                  var spaces = Array(indent + 3).join(' ');
                  for (var i = 0; i < yamlLines.length - 1; i++) { // length - 1 because last line is empty (was \n)
                    returnLines.push(spaces + yamlLines[i]);
                  }
                }
              } else {
                returnLines.push(line);
              }
            } else {
              returnLines.push(line);
            }
          }
        } else if (keyToken.indexOf('x-a127-config') === 0) {
          inConfig = true;
          returnLines.push(line);
        } else {
          returnLines.push(line);
        }
      }
    }
  });
  return returnLines.join('\n');
}

function getAnchor(tokens) {
  for (var i = tokens.length - 1; i > 0; i--) {
    if (tokens[i][0] === '&') { return tokens[i]; }
  }
  return undefined;
}

function isAnchor(token) {
  return token[token.length - 1] === '&';
}
