/**
-  **所有行情相关协议获取数据都需要先通过（1005）协议订阅成功后才能查询**
-  **订阅的上限为500个订阅单位。一只股票的一个K线类型占2个订阅单位、分时占2个订阅单位、
-  报价占1个订阅单位、摆盘占5个订阅单位（牛熊为1）、逐笔占5个订阅单位（牛熊为1）、经纪队列占5个订阅单位（牛熊为1）。**
-  **反订阅（1006）的时间限制为１分钟，即订阅某支股票某个订阅位１分钟之后才能反订阅**
-  **30秒内不能超过20次交易请求。**
-  **建议所有行情拉取接口在同一条长连接上。推送数据在第二条长连接上。交易接口在第三条长连接上。**
 */

import net from 'net';
import protobufjs from 'protobufjs';
import crypto from 'crypto';
import logger from './logger';
import ProtoId from './protoid';

const ProtoName = {};
Object.keys(ProtoId).forEach((key) => {
  ProtoName[ProtoId[key]] = key;
});

let id = 1;

/**
 * @class Socket
 */
class Socket {
  constructor(ip, port) {
    id += 1;
    this.id = id;
    this.ip = ip;
    this.port = port;
    this.socket = new net.Socket();
    this.name = `Socket(${this.id})`;
    this.isConnect = false;
    this.requestId = 1000;

    this.cacheResponseCallback = {}; // 缓存的回调函数
    this.cacheNotifyCallback = {}; // 缓存的推送回调函数

    this.socket.setKeepAlive(true);
    this.socket.on('error', (data) => {
      logger.error(`${this.name} on error: ${data}`);
      this.socket.destroy();
      this.isConnect = false;
    });
    this.socket.on('timeout', (e) => {
      logger.error(`${this.name} on timeout.`, e);
      this.socket.destroy();
      this.isConnect = false;
    });
    // 为客户端添加“close”事件处理函数
    this.socket.on('close', () => {
      const errMsg = `${this.name} on closed and retry connect on 5 seconds.`;
      logger.error(errMsg);
      this.isConnect = false;
      // 5s后重连
      if (this.timerRecontent) return;
      this.timerRecontent = setTimeout(() => {
        this.init();
      }, 5000);
    });

    this.onData();
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
        logger.debug(`${this.name} connect success:${this.ip}:${this.port}`);
        this.isConnect = true;
        resolve();
      });
    });
  }
  /**
   * 注册协议的通知
   * @param protoId 协议id
   * @param callback 回调函数
   */
  subNotify(protoId, callback) {
    this.cacheNotifyCallback[protoId] = callback;
  }
  /**
   * 删除一个通知
   * @param protoId 协议id
   */
  unsubNotify(protoId) {
    if (this.cacheNotifyCallback[protoId]) {
      delete this.cacheNotifyCallback[protoId];
    }
  }
  /**
   * 同步发送数据，返回promise
   * @param {JSON} json 要发送的数据
   */
  send(protoName, message) {
    if (!this.isConnect) throw new Error(`${this.name} 尚未连接，无法发送请求。`);
    const protoId = ProtoId[protoName];
    if (!protoId) throw new Error(`找不到对应的协议Id:${protoName}`);
    // 请求序列号，自增
    if (this.requestId > 1000000) this.requestId = 1000;
    const { requestId } = this;
    this.requestId += 1;

    // 加载proto协议文件
    const root = protobufjs.loadSync(`src/pb/${protoName}.proto`);
    const request = root.lookup(`${protoName}.Request`);
    const response = root.lookup(`${protoName}.Response`);

    // 处理请求数据
    const reqBuffer = request.encode(request.create({
      c2s: message,
    })).finish();
    const sha1 = crypto.createHash('sha1').update(reqBuffer).digest('hex');
    const sha1Buffer = new Uint8Array(20).map((item, index) => Number(`0x${sha1.substr(index * 2, 2)}`));
    logger.debug(`request:${protoName}(${protoId}),reqId:${requestId}`);
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
        if (result.retType !== 0) {
          const errMsg = `服务器返回结果失败,request:${protoName}(${protoId}),reqId:${requestId},errMsg:${result.retMsg}`;
          logger.error(errMsg);
          reject(new Error(errMsg));
        } else {
          resolve(result.s2c);
        }
      };
    });
  }
  /**
   * 接收数据
   */
  onData() {
    const headerLen = 44; // 包头长度
    let header = null; // 包头对象
    let bodyBuffer = null; // 包体buffer
    let bodyLen = 0; // 包体长度
    let cacheBuffer = Buffer.allocUnsafe(0); // 缓存接收的数据
    let reqId = null; // 请求序列号
    let protoId = null; // 请求协议Id

    this.socket.on('data', async (data) => {
      cacheBuffer = Buffer.concat([cacheBuffer, data]);
      // 先处理包头
      if (!header && cacheBuffer.length >= headerLen) {
        let recvSha1 = new Array(21).join('0').split('').map((item, index) => {
          let str = cacheBuffer.readUInt8(16 + index).toString(16);
          if (str.length === 1) str = `0${str}`;
          return str;
        });
        recvSha1 = recvSha1.join('');
        header = {
          // 包头起始标志，固定为“FT”
          szHeaderFlag: String.fromCharCode(cacheBuffer.readUInt8(0)) + String.fromCharCode(cacheBuffer.readUInt8(1)),
          nProtoID: cacheBuffer.readUInt32LE(2), // 协议ID
          nProtoFmtType: cacheBuffer.readUInt8(6), // 协议格式类型，0为Protobuf格式，1为Json格式
          nProtoVer: cacheBuffer.readUInt8(7), // 协议版本，用于迭代兼容
          nSerialNo: cacheBuffer.readUInt32LE(8), // 包序列号
          nBodyLen: cacheBuffer.readUInt32LE(12), // 包体长度
          arrBodySHA1: recvSha1, // 包体原数据(解密后)的SHA1哈希值
          arrReserved: cacheBuffer.slice(36, 44), // 保留8字节扩展
        };
        reqId = header.nSerialNo;
        protoId = header.nProtoID;

        bodyLen = header.nBodyLen;
        if (header.szHeaderFlag !== 'FT') throw new Error('接收的包头数据格式错误');
        logger.debug(`response:${ProtoName[header.nProtoID]}(${header.nProtoID}),reqId:${header.nSerialNo},bodyLen:${bodyLen}`);
      }
      // 已经接收指定包体长度的全部数据，切割包体buffer
      if (header && cacheBuffer.length >= bodyLen + headerLen) {
        bodyBuffer = cacheBuffer.slice(44, bodyLen + headerLen);
        cacheBuffer = cacheBuffer.slice(bodyLen + headerLen);
        const sha1 = crypto.createHash('sha1').update(bodyBuffer).digest('hex');
        const recvSha1 = header.arrBodySHA1;
        header = null;
        if (sha1 !== recvSha1) {
          throw new Error(`接收的包体sha1加密错误：${recvSha1},本地sha1：${sha1}`);
        }
        // 交给回调处理包体数据
        if (this.cacheResponseCallback[reqId]) {
          this.cacheResponseCallback[reqId](bodyBuffer);
          delete this.cacheResponseCallback[reqId];
        }
        // 通知模块
        if (this.cacheNotifyCallback[protoId]) {
          try {
            this.cacheNotifyCallback[protoId](bodyBuffer);
          } catch (e) {
            const errMsg = `通知回调执行错误，response:${ProtoName[header.nProtoID]}(${header.nProtoID}),reqId:${header.nSerialNo},bodyLen:${bodyLen}，堆栈：${e.stack}`;
            logger.error(errMsg);
            throw new Error(errMsg);
          }
        }
      }
    });
  }
}
export default Socket;
