'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     -  **所有行情相关协议获取数据都需要先通过（1005）协议订阅成功后才能查询**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     -  **订阅的上限为500个订阅单位。一只股票的一个K线类型占2个订阅单位、分时占2个订阅单位、
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     -  报价占1个订阅单位、摆盘占5个订阅单位（牛熊为1）、逐笔占5个订阅单位（牛熊为1）、经纪队列占5个订阅单位（牛熊为1）。**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     -  **反订阅（1006）的时间限制为１分钟，即订阅某支股票某个订阅位１分钟之后才能反订阅**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     -  **30秒内不能超过20次交易请求。**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     -  **建议所有行情拉取接口在同一条长连接上。推送数据在第二条长连接上。交易接口在第三条长连接上。**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _protobufjs = require('protobufjs');

var _protobufjs2 = _interopRequireDefault(_protobufjs);

var _hexSha = require('hex-sha1');

var _hexSha2 = _interopRequireDefault(_hexSha);

var _protoid = require('./protoid');

var _protoid2 = _interopRequireDefault(_protoid);

var _pb = require('./pb.json');

var _pb2 = _interopRequireDefault(_pb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProtoName = {};
Object.keys(_protoid2.default).forEach(function (key) {
  ProtoName[_protoid2.default[key]] = key;
});

var id = 1;

/**
 * Socket模块
 */

var Socket = function () {
  /**
   * Creates an instance of Socket.
   * @param {string} ip OpenD服务Ip
   * @param {number} port OpenD服务端口
   * @param {object} logger 日志对象
   */
  function Socket(ip, port, logger) {
    var _this = this;

    _classCallCheck(this, Socket);

    /**
     * OpenD服务IP
     * @type {string}
     */
    this.ip = ip;
    /**
     * OpenD服务端口
     * @type {number}
     */
    this.port = port;
    /**
     * 日志对象
     * @type {object}
     */
    this.logger = logger;

    id += 1;
    /**
     * socket id，自增，用于区分多个socket。
     * @type {number}
     */
    this.id = id;
    /**
     * socket名称，用于区分多个socket。
     * @type {string}
     */
    this.name = 'Socket(' + this.id + ')';
    /**
     * socket是否已经连接
     * @type {boolean}
     */
    this.isConnect = false;
    /**
     * 请求序列号，自增
     * @type {number}
     */
    this.requestId = 1000; // 请求序列号，自增

    this.root = _protobufjs2.default.Root.fromJSON(_pb2.default);

    this.cacheResponseCallback = {}; // 缓存的回调函数
    this.cacheNotifyCallback = {}; // 缓存的通知回调函数
    this.header = null; // 缓存接收的数据包头
    this.recvBuffer = Buffer.allocUnsafe(0); // 缓存接收的数据

    this.socket = new _net2.default.Socket();
    this.socket.setKeepAlive(true);
    this.socket.on('error', function (data) {
      _this.logger.error(_this.name + ' on error: ' + data);
      _this.socket.destroy();
      _this.isConnect = false;
    });
    this.socket.on('timeout', function (e) {
      _this.logger.error(_this.name + ' on timeout.', e);
      _this.socket.destroy();
      _this.isConnect = false;
    });
    // 为客户端添加“close”事件处理函数
    this.socket.on('close', function () {
      var errMsg = _this.name + ' on closed and retry connect on 5 seconds.';
      _this.logger.error(errMsg);
      _this.isConnect = false;
      // 5s后重连
      if (_this.timerRecontent) return;
      _this.timerRecontent = setTimeout(function () {
        _this.init();
      }, 5000);
    });
    // 接收数据
    this.socket.on('data', function (data) {
      _this.recvBuffer = Buffer.concat([_this.recvBuffer, data]);
      _this.parseData();
    });
  }

  _createClass(Socket, [{
    key: 'init',
    value: async function init() {
      if (this.isConnect) return;
      await this.connect();
    }
    /**
     * 立即建立连接
     */

  }, {
    key: 'connect',
    value: async function connect() {
      var _this2 = this;

      return new Promise(function (resolve) {
        if (_this2.timerRecontent) {
          clearTimeout(_this2.timerRecontent);
          _this2.timerRecontent = null;
        }
        _this2.socket.connect({
          port: _this2.port,
          host: _this2.ip,
          timeout: 1000 * 30
        }, async function () {
          _this2.logger.debug(_this2.name + ' connect success:' + _this2.ip + ':' + _this2.port);
          _this2.isConnect = true;
          if (typeof _this2.connectCallback === 'function') _this2.connectCallback();
          resolve();
        });
      });
    }
    /**
     * 设置连接成功的回调函数
     *
     * @param {function} cb
     * @memberof Socket
     */

  }, {
    key: 'onConnect',
    value: function onConnect(cb) {
      this.connectCallback = cb;
    }
    /**
     * 注册协议的通知
     *
     * @param {number} protoId 协议id
     * @param {function} callback 回调函数
     */

  }, {
    key: 'subNotify',
    value: function subNotify(protoId, callback) {
      this.cacheNotifyCallback[protoId] = callback;
    }
    /**
     * 删除一个通知
     * @param {number} protoId 协议id
     */

  }, {
    key: 'unsubNotify',
    value: function unsubNotify(protoId) {
      if (this.cacheNotifyCallback[protoId]) {
        delete this.cacheNotifyCallback[protoId];
      }
    }
    /**
     * 发送数据
     *
     * @async
     * @param {string} protoName 协议名称
     * @param {object} message 要发送的数据
     */

  }, {
    key: 'send',
    value: async function send(protoName, message) {
      var _this3 = this;

      if (!this.isConnect) return this.logger.warn(this.name + ' \u5C1A\u672A\u8FDE\u63A5\uFF0C\u65E0\u6CD5\u53D1\u9001\u8BF7\u6C42\u3002');
      var protoId = _protoid2.default[protoName];
      if (!protoId) return this.logger.warn('\u627E\u4E0D\u5230\u5BF9\u5E94\u7684\u534F\u8BAEId:' + protoName);
      // 请求序列号，自增
      if (this.requestId > 1000000) this.requestId = 1000;
      var requestId = this.requestId;

      this.requestId += 1;

      // const root = protobufjs.loadSync(path.join(DIRNAME, `pb/${protoName}.proto`));
      var request = this.root[protoName].Request;
      var response = this.root[protoName].Response;

      // 处理请求数据
      var reqBuffer = request.encode(request.create({
        c2s: message
      })).finish();
      var sha1 = (0, _hexSha2.default)(reqBuffer);
      var sha1Buffer = new Uint8Array(20).map(function (item, index) {
        return Number('0x' + sha1.substr(index * 2, 2));
      });
      this.logger.debug('request:' + protoName + '(' + protoId + '),reqId:' + requestId);
      // 处理包头
      var buffer = Buffer.concat([Buffer.from('FT'), // 包头起始标志，固定为“FT”
      Buffer.from(new Uint32Array([protoId]).buffer), // 协议ID
      Buffer.from(new Uint8Array([0]).buffer), // 协议格式类型，0为Protobuf格式，1为Json格式
      Buffer.from(new Uint8Array([0]).buffer), // 协议版本，用于迭代兼容, 目前填0
      Buffer.from(new Uint32Array([requestId]).buffer), // 包序列号，用于对应请求包和回包, 要求递增
      Buffer.from(new Uint32Array([reqBuffer.length]).buffer), // 包体长度
      Buffer.from(sha1Buffer.buffer), // 包体原始数据(解密后)的SHA1哈希值
      Buffer.from(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer), // 保留8字节扩展
      reqBuffer]);
      // 发送请求，处理回调
      this.socket.write(buffer);
      return new Promise(function (resolve, reject) {
        _this3.cacheResponseCallback[requestId] = function (responseBuffer) {
          var result = response.decode(responseBuffer).toJSON();
          if (result.retType === 0) return resolve(result.s2c);
          var errMsg = '\u670D\u52A1\u5668\u8FD4\u56DE\u7ED3\u679C\u5931\u8D25,request:' + protoName + '(' + protoId + '),retType:' + result.retType + ',reqId:' + requestId + ',errMsg:' + result.retMsg;
          _this3.logger.error(errMsg);
          return reject(new Error(errMsg));
        };
      });
    }
    /**
     * 解析包体数据
     */

  }, {
    key: 'parseData',
    value: function parseData() {
      var _this4 = this;

      var headerLen = 44; // 包头长度
      var bodyBuffer = null; // 包体buffer
      var bodyLen = 0; // 包体长度
      var reqId = null; // 请求序列号
      var protoId = null; // 请求协议Id
      var bodySha1 = null; // 包体sha1
      // 先处理包头
      if (!this.header && this.recvBuffer.length >= headerLen) {
        var recvSha1 = new Array(21).join('0').split('').map(function (item, index) {
          var str = _this4.recvBuffer.readUInt8(16 + index).toString(16);
          if (str.length === 1) str = '0' + str;
          return str;
        });
        recvSha1 = recvSha1.join('');
        this.header = {
          // 包头起始标志，固定为“FT”
          szHeaderFlag: String.fromCharCode(this.recvBuffer.readUInt8(0)) + String.fromCharCode(this.recvBuffer.readUInt8(1)),
          nProtoID: this.recvBuffer.readUInt32LE(2), // 协议ID
          nProtoFmtType: this.recvBuffer.readUInt8(6), // 协议格式类型，0为Protobuf格式，1为Json格式
          nProtoVer: this.recvBuffer.readUInt8(7), // 协议版本，用于迭代兼容
          nSerialNo: this.recvBuffer.readUInt32LE(8), // 包序列号
          nBodyLen: this.recvBuffer.readUInt32LE(12), // 包体长度
          arrBodySHA1: recvSha1, // 包体原数据(解密后)的SHA1哈希值
          arrReserved: this.recvBuffer.slice(36, 44) // 保留8字节扩展
        };
        if (this.header.szHeaderFlag !== 'FT') throw new Error('接收的包头数据格式错误');
        this.logger.debug('response:' + ProtoName[this.header.nProtoID] + '(' + this.header.nProtoID + '),reqId:' + this.header.nSerialNo + ',bodyLen:' + bodyLen);
      }

      // 已经接收指定包体长度的全部数据，切割包体buffer
      if (this.header && this.recvBuffer.length >= this.header.nBodyLen + headerLen) {
        reqId = this.header.nSerialNo;
        protoId = this.header.nProtoID;
        bodyLen = this.header.nBodyLen;
        bodySha1 = this.header.arrBodySHA1;
        this.header = null;

        bodyBuffer = this.recvBuffer.slice(44, bodyLen + headerLen);
        this.recvBuffer = this.recvBuffer.slice(bodyLen + headerLen);

        // const sha1 = crypto.createHash('sha1').update(bodyBuffer).digest('hex');
        var sha1 = (0, _hexSha2.default)(bodyBuffer);
        if (sha1 !== bodySha1) {
          throw new Error('\u63A5\u6536\u7684\u5305\u4F53sha1\u52A0\u5BC6\u9519\u8BEF\uFF1A' + bodySha1 + ',\u672C\u5730sha1\uFF1A' + sha1);
        }
        // 交给回调处理包体数据
        if (this.cacheResponseCallback[reqId]) {
          this.cacheResponseCallback[reqId](bodyBuffer);
          delete this.cacheResponseCallback[reqId];
        }
        // 通知模块
        if (this.cacheNotifyCallback[protoId]) {
          try {
            // 加载proto协议文件
            var protoName = ProtoName[protoId];
            var response = this.root[protoName].Response;
            var result = response.decode(bodyBuffer).toJSON();
            this.cacheNotifyCallback[protoId](result.s2c);
          } catch (e) {
            var errMsg = '\u901A\u77E5\u56DE\u8C03\u6267\u884C\u9519\u8BEF\uFF0Cresponse:' + ProtoName[protoId] + '(' + protoId + '),reqId:' + reqId + ',bodyLen:' + bodyLen + '\uFF0C\u5806\u6808\uFF1A' + e.stack;
            this.logger.error(errMsg);
            throw new Error(errMsg);
          }
        }
        if (this.recvBuffer.length > headerLen) this.parseData();
      }
    }
  }]);

  return Socket;
}();

exports.default = Socket;
module.exports = exports['default'];