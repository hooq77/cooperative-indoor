'use strict';

var express = require('express');
var path = require('path');
var config = require('./config');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/**
 * Express configuration
 */
module.exports = function(app) {
  if(app.get('env') === 'development') {
    app.use(require('connect-livereload')({
      // livereload is incompatible with the current method
      // of streaming data from the API for some maps.
      // see https://github.com/mscdex/busboy/issues/79#issuecomment-108684031
      ignore: [/api/]
    }));

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', 0);
      next();
    });
    app.use(favicon(path.join(config.root, 'app', 'favicon.ico')));
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.set('views', config.root + '/app/views');
  }

  if(app.get('env') === 'production'){
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
  }

  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  // Router needs to be last

};

