const net = require('net');
const protobufjs = require('protobufjs');
const hexSha1 = require('hex-sha1');
const ProtoId = require('./protoid');
const Pb = require('./pb.json');


const ProtoName = {};
Object.keys(ProtoId).forEach((key) => {
  ProtoName[ProtoId[key]] = key;
});

let id = 1;

/**
 * Socket模块
 */

class Socket {
  /**
   * Creates an instance of Socket.
   * @param {string} ip OpenD服务Ip
   * @param {number} port OpenD服务端口
   * @param {object} logger 日志对象
   */
  constructor(ip, port, logger) {
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
    this.name = `Socket(${this.id})`;
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

    this.root = protobufjs.Root.fromJSON(Pb);

    this.cacheResponseCallback = {}; // 缓存的回调函数
    this.cacheNotifyCallback = {}; // 缓存的通知回调函数
    this.header = null; // 缓存接收的数据包头
    this.recvBuffer = Buffer.allocUnsafe(0); // 缓存接收的数据

    this.socket = new net.Socket();
    this.socket.setKeepAlive(true);
    this.socket.on('error', (data) => {
      this.logger.error(`${this.name} on error: ${data}`);
      this.socket.destroy();
      this.isConnect = false;
    });
    this.socket.on('timeout', (e) => {
      this.logger.error(`${this.name} on timeout.`, e);
      this.socket.destroy();
      this.isConnect = false;
    });
    // 为客户端添加“close”事件处理函数
    this.socket.on('close', () => {
      const errMsg = `${this.name} on closed and retry connect on 5 seconds.`;
      this.logger.error(errMsg);
      this.isConnect = false;
      // 5s后重连
      if (this.timerRecontent) return;
      this.timerRecontent = setTimeout(() => {
        this.init();
      }, 5000);
    });
    // 接收数据
    this.socket.on('data', (data) => {
      this.recvBuffer = Buffer.concat([this.recvBuffer, data]);
      this.parseData();
    });
  }
  async init() {
    if (this.isConnect) return;
    await this.connect();
  }
  /**
   * 立即建立连接
   */
  async connect() {
    return new Promise((resolve) => {
      if (this.timerRecontent) {
        clearTimeout(this.timerRecontent);
        this.timerRecontent = null;
      }
      this.socket.connect({
        port: this.port,
        host: this.ip,
        timeout: 1000 * 30,
      }, async () => {
        this.logger.debug(`${this.name} connect success:${this.ip}:${this.port}`);
        this.isConnect = true;
        if (typeof this.connectCallback === 'function') this.connectCallback();
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
  onConnect(cb) {
    this.connectCallback = cb;
  }
  /**
   * 注册协议的通知
   *
   * @param {number} protoId 协议id
   * @param {function} callback 回调函数
   */
  subNotify(protoId, callback) {
    this.cacheNotifyCallback[protoId] = callback;
  }
  /**
   * 删除一个通知
   * @param {number} protoId 协议id
   */
  unsubNotify(protoId) {
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
  send(protoName, message) {
    if (!this.isConnect) return this.logger.warn(`${this.name} 尚未连接，无法发送请求。`);
    const protoId = ProtoId[protoName];
    if (!protoId) return this.logger.warn(`找不到对应的协议Id:${protoName}`);
    // 请求序列号，自增
    if (this.requestId > 1000000) this.requestId = 1000;
    const { requestId } = this;
    this.requestId += 1;

    const request = this.root[protoName].Request;
    const response = this.root[protoName].Response;

    // 处理请求数据
    const reqBuffer = request.encode(request.create({
      c2s: message,
    })).finish();
    const sha1 = hexSha1(reqBuffer);
    const sha1Buffer = new Uint8Array(20).map((item, index) => Number(`0x${sha1.substr(index * 2, 2)}`));
    this.logger.debug(`request:${protoName}(${protoId}),reqId:${requestId}`);
    // 处理包头
    const buffer = Buffer.concat([
      Buffer.from('FT'), // 包头起始标志，固定为“FT”
      Buffer.from(new Uint32Array([protoId]).buffer), // 协议ID
      Buffer.from(new Uint8Array([0]).buffer), // 协议格式类型，0为Protobuf格式，1为Json格式
      Buffer.from(new Uint8Array([0]).buffer), // 协议版本，用于迭代兼容, 目前填0
      Buffer.from(new Uint32Array([requestId]).buffer), // 包序列号，用于对应请求包和回包, 要求递增
      Buffer.from(new Uint32Array([reqBuffer.length]).buffer), // 包体长度
      Buffer.from(sha1Buffer.buffer), // 包体原始数据(解密后)的SHA1哈希值
      Buffer.from(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer), // 保留8字节扩展
      reqBuffer,
    ]);
    // 发送请求，处理回调
    this.socket.write(buffer);
    return new Promise((resolve, reject) => {
      this.cacheResponseCallback[requestId] = (responseBuffer) => {
        const result = response.decode(responseBuffer).toJSON();
        if (result.retType === 0) return resolve(result.s2c);
        const errMsg = `服务器返回结果失败,request:${protoName}(${protoId}),retType:${result.retType},reqId:${requestId},errMsg:${result.retMsg}`;
        this.logger.error(errMsg);
        return reject(new Error(errMsg));
      };
    });
  }
  /**
   * 解析包体数据
   */
  parseData() {
    const headerLen = 44; // 包头长度
    let bodyBuffer = null; // 包体buffer
    let bodyLen = 0; // 包体长度
    let reqId = null; // 请求序列号
    let protoId = null; // 请求协议Id
    let bodySha1 = null; // 包体sha1
    // 先处理包头
    if (!this.header && this.recvBuffer.length >= headerLen) {
      let recvSha1 = new Array(21).join('0').split('').map((item, index) => {
        let str = this.recvBuffer.readUInt8(16 + index).toString(16);
        if (str.length === 1) str = `0${str}`;
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
        arrReserved: this.recvBuffer.slice(36, 44), // 保留8字节扩展
      };
      if (this.header.szHeaderFlag !== 'FT') throw new Error('接收的包头数据格式错误');
      this.logger.debug(`response:${ProtoName[this.header.nProtoID]}(${this.header.nProtoID}),reqId:${this.header.nSerialNo},bodyLen:${bodyLen}`);
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

      const sha1 = hexSha1(bodyBuffer);
      if (sha1 !== bodySha1) {
        throw new Error(`接收的包体sha1加密错误：${bodySha1},本地sha1：${sha1}`);
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
          const protoName = ProtoName[protoId];
          const response = this.root[protoName].Response;
          const result = response.decode(bodyBuffer).toJSON();
          this.cacheNotifyCallback[protoId](result.s2c);
        } catch (e) {
          const errMsg = `通知回调执行错误，response:${ProtoName[protoId]}(${protoId}),reqId:${reqId},bodyLen:${bodyLen}，堆栈：${e.stack}`;
          this.logger.error(errMsg);
          throw new Error(errMsg);
        }
      }
      if (this.recvBuffer.length > headerLen) this.parseData();
    }
  }
}
module.exports = Socket;
