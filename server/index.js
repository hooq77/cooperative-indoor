'use strict';

var express = require('express');

//Catch all errors so that the node app won't crash
process.on('uncaughtException', function (err) {
  console.error(err);
  console.log('Node NOT Exiting...');
});

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./config/config');

var app = express();

// Express settings
require('./config/express')(app);

// Routing
require('./routes')(app);


//WebSocket   Starts the
var websocketServer = require('./socketio')(app);
websocketServer.listen(config.port);


console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));

// Expose app
module.exports = app;
