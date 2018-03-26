'use strict';

var _ = require('lodash');
var path = require('path');
var common = {
    root: path.normalize(__dirname + '/../..'),
    port: process.env.PORT || 3000
};

/**
 * Load environment configuration
 */
module.exports = _.extend(common, require('./env/' + process.env.NODE_ENV + '.js') || {});