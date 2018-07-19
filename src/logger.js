'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _bunyanDebugStream = require('bunyan-debug-stream');

var _bunyanDebugStream2 = _interopRequireDefault(_bunyanDebugStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _bunyan2.default.createLogger({
  name: 'sys',
  streams: [{
    level: 'debug',
    type: 'raw',
    serializers: _bunyanDebugStream2.default.serializers,
    stream: (0, _bunyanDebugStream2.default)({
      forceColor: true
    })
  }]
});

exports.default = logger;
module.exports = exports['default'];