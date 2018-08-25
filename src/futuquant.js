const bunyan = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');
const Socket = require('./socket');

const sleep = async time => new Promise((resolve) => {
  setTimeout(resolve, time);
});

/**
 * 封装FutuQuant底层协议模块
 */
class FutuQuant {
  /**
   * Creates an instance of FutuQuant.
   * @param {object} params 初始化参数
   * @param {string} params.ip FutuOpenD服务IP
   * @param {number} params.port FutuOpenD服务端口
   * @param {number} params.userID 牛牛号
   * @param {string} params.pwdMd5 解锁交易 md5
   * @param {TrdMarket} [params.market] 市场环境，默认为港股环境，1港股2美股3大陆市场4香港A股通市场
   * @param {TrdEnv} [params.env] 0为仿真环境，1为真实环境，2为回测环境，默认为1
   * @param {object} [logger] 日志对象，若不传入，则使用bunyan.createLogger创建
   * @memberof FutuQuant
   */
  constructor(params, logger) {
    if (typeof params !== 'object') throw new Error('传入参数类型错误');
    // 处理参数
    const {
      ip,
      port,
      userID,
      market,
      pwdMd5,
      env,
    } = params;
    if (!ip) throw new Error('必须指定FutuOpenD服务的ip');
    if (!port) throw new Error('必须指定FutuOpenD服务的port');
    if (!userID) throw new Error('必须指定FutuOpenD服务的牛牛号');
    if (!pwdMd5) throw new Error('必须指定FutuOpenD服务的解锁 MD5');

    this.logger = logger;
    this.market = market || 1; // 当前市场环境，1港股2美股3大陆市场4香港A股通市场
    this.userID = userID;
    this.pwdMd5 = pwdMd5;
    this.params = params;
    this.env = env;
    if (typeof this.env !== 'number') this.env = 1; // 0为仿真环境，1为真实环境，2为回测环境

    // 处理日志
    const methods = ['debug', 'info', 'warn', 'error', 'fatal', 'trace'];
    if (this.logger) {
      methods.forEach((key) => {
        if (typeof this.logger[key] !== 'function') this.logger = null;
      });
    }
    this.logger = this.logger || bunyan.createLogger({
      name: 'sys',
      streams: [{
        level: 'debug',
        type: 'raw',
        serializers: bunyanDebugStream.serializers,
        stream: bunyanDebugStream({ forceColor: true }),
      }],
    });

    this.socket = new Socket(ip, port, this.logger); // 实例化的socket对象,所有行情拉取接口
    this.inited = false; // 是否已经初始化
    this.trdHeader = null; // 交易公共头部信息
    this.timerKeepLive = null; // 保持心跳定时器
  }
  /**
   * 初始化处理
   */
  async init() {
    if (this.inited) return;
    await this.initConnect();
    await this.trdUnlockTrade(true, this.pwdMd5); // 解锁交易密码
    const { accID } = (await this.trdGetAccList())[0]; // 获取交易账户
    await this.setCommonTradeHeader(this.env, accID, this.market); // 设置为港股的真实环境
    this.inited = true;
  }
  /**
   * 初始化连接，InitConnect.proto协议返回对象
   * @typedef InitConnectResponse
   * @property {number} serverVer FutuOpenD的版本号
   * @property {number} loginUserID FutuOpenD登陆的牛牛用户ID
   * @property {number} connID 此连接的连接ID，连接的唯一标识
   * @property {string} connAESKey 此连接后续AES加密通信的Key，固定为16字节长字符串
   * @property {number} keepAliveInterval 心跳保活间隔
   */
  /**
   * InitConnect.proto - 1001初始化连接
   *
    nodejs版本会根据返回的keepAliveInterval字段自动保持心跳连接，不再需要手动调用ft.keepLive()方法。
    请求其它协议前必须等InitConnect协议先完成
    若FutuOpenD配置了加密， “connAESKey”将用于后续协议加密
    keepAliveInterval 为建议client发起心跳 KeepAlive 的间隔
   * @async
   * @param {object} params 初始化参数
   * @param {number} params.clientVer 客户端版本号，clientVer = "."以前的数 * 100 + "."以后的，举例：1.1版本的clientVer为1 * 100 + 1 = 101，2.21版本为2 * 100 + 21 = 221
   * @param {string} params.clientID 客户端唯一标识，无生具体生成规则，客户端自己保证唯一性即可
   * @param {boolean} params.recvNotify 此连接是否接收市场状态、交易需要重新解锁等等事件通知，true代表接收，FutuOpenD就会向此连接推送这些通知，反之false代表不接收不推送
   * @returns {InitConnectResponse}
   */
  async initConnect(params) {
    if (this.inited) throw new Error('请勿重复初始化连接');
    return new Promise(async (resolve) => {
      this.socket.onConnect(async () => {
        const res = await this.socket.send('InitConnect', Object.assign({
          clientVer: 101,
          clientID: 'yisbug',
          recvNotify: true,
        }, params));
        // 保持心跳
        this.connID = res.connID;
        this.connAESKey = res.connAESKey;
        this.keepAliveInterval = res.keepAliveInterval;
        if (this.timerKeepLive) {
          clearInterval(this.timerKeepLive);
          this.timerKeepLive = null;
        }
        this.timerKeepLive = setInterval(() => this.keepAlive(), 1000 * this.keepAliveInterval);
        resolve(res);
      });
      await this.socket.init();
    });
  }
  /**
   * 断开连接
   */
  close() {
    if (this.timerKeepLive) {
      clearInterval(this.timerKeepLive);
      this.socket.close();
      this.inited = false;
    }
  }
  /**
   * GetGlobalState.proto协议返回对象
   * @typedef GetGlobalStateResponse
   * @property {QotMarketState} marketHK Qot_Common.QotMarketState,港股主板市场状态
   * @property {QotMarketState} marketUS Qot_Common.QotMarketState,美股Nasdaq市场状态
   * @property {QotMarketState} marketSH Qot_Common.QotMarketState,沪市状态
   * @property {QotMarketState} marketSZ Qot_Common.QotMarketState,深市状态
   * @property {QotMarketState} marketHKFuture Qot_Common.QotMarketState,港股期货市场状态
   * @property {boolean} qotLogined 是否登陆行情服务器
   * @property {boolean} trdLogined 是否登陆交易服务器
   * @property {number} serverVer 版本号
   * @property {number} serverBuildNo buildNo
   * @property {number} time 当前格林威治时间
   */
  /**
   * GetGlobalState.proto - 1002获取全局状态
   * @async
   * @returns {GetGlobalStateResponse}
   */
  getGlobalState() {
    return this.socket.send('GetGlobalState', {
      userID: this.userID,
    });
  }
  /**
   * KeepAlive.proto - 1004保活心跳
   * @returns {number} time 服务器回包时的格林威治时间戳，单位秒
   */
  async keepAlive() {
    const time = await this.socket.send('KeepAlive', {
      time: Math.round(Date.now() / 1000),
    });
    return time;
  }
  /**
   * Qot_Sub.proto - 3001订阅或者反订阅
   *
    股票结构参考 Security
    订阅数据类型参考 SubType
    复权类型参考 RehabType
    为控制定阅产生推送数据流量，股票定阅总量有额度控制，订阅规则参考 高频数据接口
    高频数据接口需要订阅之后才能使用，注册推送之后才可以收到数据更新推送
   * @param {object} params
   * @param {Security[]} params.securityList 股票
   * @param {SubType[]} params.subTypeList Qot_Common.SubType,订阅数据类型
   * @param {boolean} [params.isSubOrUnSub=true] ture表示订阅,false表示反订阅
   * @param {boolean} [params.isRegOrUnRegPush=true] 是否注册或反注册该连接上面行情的推送,该参数不指定不做注册反注册操作
   * @param {number} params.regPushRehabTypeList Qot_Common.RehabType,复权类型,注册推送并且是K线类型才生效,其他订阅类型忽略该参数,注册K线推送时该参数不指定默认前复权
   * @param {boolean} [params.isFirstPush=true] 注册后如果本地已有数据是否首推一次已存在数据,该参数不指定则默认true
   * @async
   */
  qotSub(params) {
    return this.socket.send('Qot_Sub', Object.assign({
      securityList: [],
      subTypeList: [],
      isSubOrUnSub: true,
      isRegOrUnRegPush: true,
      regPushRehabTypeList: [],
      isFirstPush: true,
    }, params));
  }
  /**
   * Qot_RegQotPush.proto - 3002注册行情推送
   *
    股票结构参考 Security
    订阅数据类型参考 SubType
    复权类型参考 RehabType
    行情需要订阅成功才能注册推送
   * @param {object} params Object
   * @param {Security[]} params.securityList 股票
   * @param {SubType[]} params.subTypeList Qot_Common.SubType,订阅数据类型
   * @param {SubType[]} params.rehabTypeList Qot_Common.RehabType,复权类型,注册K线类型才生效,其他订阅类型忽略该参数,注册K线时该参数不指定默认前复权
   * @param {boolean} [params.isRegOrUnReg=true] 注册或取消
   * @param {boolean} [params.isFirstPush=true] 注册后如果本地已有数据是否首推一次已存在数据,该参数不指定则默认true
   * @async
   */
  qotRegQotPush(params) { // 3002注册行情推送
    return this.socket.send('Qot_RegQotPush', Object.assign({
      securityList: [],
      subTypeList: [],
      rehabTypeList: [],
      isRegOrUnReg: true,
      isFirstPush: true,
    }, params));
  }
  /**
   * Qot_GetSubInfo.proto协议返回对象
   * @typedef QotGetSubInfoResponse
   * @property {ConnSubInfo[]} connSubInfoList 订阅信息
   * @property {number} totalUsedQuota FutuOpenD已使用的订阅额度
   * @property {number} remainQuota FutuOpenD剩余订阅额度
   */
  /**
   * Qot_GetSubInfo.proto - 3003获取订阅信息
   * @async
   * @param {boolean} [isReqAllConn=false] 是否返回所有连接的订阅状态，默认false
   * @returns {QotGetSubInfoResponse}
   */
  qotGetSubInfo(isReqAllConn = false) { // 3003获取订阅信息
    return this.socket.send('Qot_RegQotPush', {
      isReqAllConn,
    });
  }
  /**
   * Qot_GetBasicQot.proto - 3004获取股票基本行情
   *
    股票结构参考 Security
    基本报价结构参考 BasicQot
   * @param {Security[]} securityList 股票列表
   * @returns {BasicQot[]} basicQotList 股票基本报价
   * @async
   */
  async qotGetBasicQot(securityList) { // 3004获取股票基本行情
    return (await this.socket.send('Qot_GetBasicQot', {
      securityList,
    })).basicQotList || [];
  }
  /**
   * 注册股票基本报价通知，需要先调用订阅接口
   * Qot_UpdateBasicQot.proto - 3005推送股票基本报价
   * @async
   * @param {function} callback  回调
   * @returns {BasicQot[]} basicQotList
   */
  subQotUpdateBasicQot(callback) { // 注册股票基本报价通知
    return this.socket.subNotify(3005, data => callback(data.basicQotList || []));
  }
  /**
   * Qot_GetKL.proto - 3006获取K线
   *
    复权类型参考 RehabType
    K线类型参考 KLType
    股票结构参考 Security
    K线结构参考 KLine
    请求K线目前最多最近1000根
   * @param {object} params
   * @param {RehabType} params.rehabType Qot_Common.RehabType,复权类型
   * @param {KLType} params.klType Qot_Common.KLType,K线类型
   * @param {Security} params.security 股票
   * @param {number} params.reqNum 请求K线根数
   * @async
   * @returns {KLine[]} k线点
   */
  async qotGetKL(params) { // 3006获取K线
    return (await this.socket.send('Qot_GetKL', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,复权类型
      klType: 1, // Qot_Common.KLType,K线类型
      security: {}, // 股票
      reqNum: 60, // 请求K线根数
    }, params))).klList || [];
  }
  /**
   * Qot_UpdateKL.proto协议返回对象
   * @typedef QotUpdateKLResponse
   * @property {RehabType} rehabType Qot_Common.RehabType,复权类型
   * @property {KLType} klType Qot_Common.KLType,K线类型
   * @property {Security} security 股票
   * @property {KLine[]} klList 推送的k线点
   */
  /**
   * 注册K线推送，需要先调用订阅接口
   * Qot_UpdateKL.proto - 3007推送K线
   * @async
   * @returns {QotUpdateKLResponse} 推送的k线点
   */
  subQotUpdateKL(callback) { // 注册K线推送
    return this.socket.subNotify(3007, callback);
  }
  /**
   * Qot_GetRT.proto - 3008获取分时
   * @async
   * @param {Security} security 股票
   * @returns {TimeShare[]} 分时点
   */
  async qotGetRT(security) { // 获取分时
    return (await this.socket.send('Qot_GetRT', {
      security,
    })).rtList || [];
  }
  /**
   * 注册分时推送，需要先调用订阅接口
   * Qot_UpdateRT.proto - 3009推送分时
   * @async
   * @returns {TimeShare[]} 分时点
   */
  subQotUpdateRT(callback) { // 注册分时推送
    return this.socket.subNotify(3009, data => callback(data.rtList || []));
  }
  /**
   * Qot_GetTicker.proto - 3010获取逐笔
   *
    股票结构参考 Security
    逐笔结构参考 Ticker
    请求逐笔目前最多最近1000个
   * @param {Security} security 股票
   * @param {number} maxRetNum 最多返回的逐笔个数,实际返回数量不一定会返回这么多,最多返回1000个，默认100
   * @returns {Ticker[]} 逐笔
   * @async
   */
  async qotGetTicker(security, maxRetNum = 100) { // 3010获取逐笔
    return (await this.socket.send('Qot_GetTicker', {
      security,
      maxRetNum,
    })).tickerList || [];
  }
  /**
   * Qot_GetTicker.proto协议返回对象
   * @typedef subQotUpdateTickerResponse
   * @property {Security} security 股票
   * @property {Ticker[]} tickerList 逐笔
   */
  /**
   * 注册逐笔推送，需要先调用订阅接口
   * Qot_UpdateTicker.proto - 3011推送逐笔
   * @async
   * @param {function} callback  回调
   * @returns {subQotUpdateTickerResponse} 逐笔
   */
  subQotUpdateTicker(callback) { // 注册逐笔推送
    return this.socket.subNotify(3011, callback);
  }
  /**
   * Qot_GetOrderBook.proto协议返回对象
   * @typedef QotGetOrderBookResponse
   * @property {Security} security 股票
   * @property {OrderBook[]} orderBookAskList 卖盘
   * @property {OrderBook[]} sellList 卖盘，同orderBookAskList
   * @property {OrderBook[]} orderBookBidList 买盘
   * @property {OrderBook[]} buyList 买盘，同orderBookBidList
   */
  /**
   * Qot_GetOrderBook.proto - 3012获取买卖盘，需要先调用订阅接口
   * @async
   * @param {Security} security 股票
   * @param {number} num 请求的摆盘个数（1-10），默认10
   * @returns {QotGetOrderBookResponse}
   */
  async qotGetOrderBook(security, num = 10) { // 3012获取买卖盘
    const result = await this.socket.send('Qot_GetOrderBook', {
      security,
      num,
    });
    result.orderBookAskList = result.orderBookAskList || [];
    result.orderBookBidList = result.orderBookBidList || [];
    result.sellList = result.orderBookAskList;
    result.buyList = result.orderBookBidList;
    result.sellList.forEach((item) => { item.volume = Number(item.volume); });
    result.buyList.forEach((item) => { item.volume = Number(item.volume); });
    return result;
  }
  /**
   * 注册买卖盘推送，需要先调用订阅接口
   * Qot_UpdateOrderBook.proto - 3013推送买卖盘
   * @async
   * @param {function} callback 回调
   * @const {QotGetOrderBookResponse}
   */
  subQotUpdateOrderBook(callback) { // 注册买卖盘推送
    return this.socket.subNotify(3013, (data) => {
      data.sellList = data.orderBookAskList || [];
      data.buyList = data.orderBookBidList || [];
      data.sellList.forEach((item) => { item.volume = Number(item.volume); });
      data.buyList.forEach((item) => { item.volume = Number(item.volume); });
      callback(data);
    });
  }
  /**
   * Qot_GetBroker.proto协议返回对象
   * @typedef QotGetBrokerResponse
   * @property {Security} security 股票
   * @property {Broker[]} brokerAskList 经纪Ask(卖)盘
   * @property {Broker[]} sellList 经纪Ask(卖)盘，同brokerAskList
   * @property {Broker[]} brokerBidList 经纪Bid(买)盘
   * @property {Broker[]} buyList 经纪Bid(买)盘，同brokerBidList
   */
  /**
   * Qot_GetBroker.proto - 3014获取经纪队列
   * @async
   * @param {Security} security Object 股票
   * @returns {QotGetBrokerResponse}
   */
  async qotGetBroker(security) { // 3014获取经纪队列
    const result = await this.socket.send('Qot_GetBroker', {
      security,
    });
    result.brokerAskList = result.brokerAskList || [];
    result.brokerBidList = result.brokerBidList || [];
    result.sellList = result.brokerAskList;
    result.buyList = result.brokerBidList;
    return result;
  }
  /**
   * 注册经纪队列推送，需要先调用订阅接口
   * Qot_UpdateBroker.proto - 3015推送经纪队列
   * @async
   * @param {function} callback 回调
   * @returns {QotGetBrokerResponse}
   */
  subQotUpdateBroker(callback) { // 注册经纪队列推送
    return this.socket.subNotify(3015, (result) => {
      result.brokerAskList = result.brokerAskList || [];
      result.brokerBidList = result.brokerBidList || [];
      result.sellList = result.brokerAskList;
      result.buyList = result.brokerBidList;
      callback(result);
    });
  }
  /**
   * Qot_GetHistoryKL.proto - 3100获取单只股票一段历史K线
   * @async
   * @param {object} params
   * @param {RehabType} params.rehabType Qot_Common.RehabType,复权类型
   * @param {KLType} params.klType Qot_Common.KLType,K线类型
   * @param {Security} params.security 股票市场以及股票代码
   * @param {string} params.beginTime 开始时间字符串
   * @param {string} params.endTime 结束时间字符串
   * @param {number} [params.maxAckKLNum] 最多返回多少根K线，如果未指定表示不限制
   * @param {number} [params.needKLFieldsFlag] 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
   * @returns {KLine[]}
   */
  async qotGetHistoryKL(params) { // 3100获取单只股票一段历史K线
    return (await this.socket.send('Qot_GetHistoryKL', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,复权类型
      klType: 1, // Qot_Common.KLType,K线类型
      security: {}, // 股票市场以及股票代码
      beginTime: '', // 开始时间字符串
      endTime: '', // 结束时间字符串
      // maxAckKLNum: 60, // 最多返回多少根K线，如果未指定表示不限制
      // needKLFieldsFlag: 512, // 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
    }, params))).klList || [];
  }
  /**
   * 当请求时间点数据为空时，如何返回数据
   *
    NoDataMode_Null = 0; //直接返回空数据
    NoDataMode_Forward = 1; //往前取值，返回前一个时间点数据
    NoDataMode_Backward = 2; //向后取值，返回后一个时间点数据
   * @typedef {number} NoDataMode
   */
  /**
   * 这个时间点返回数据的状态以及来源
   *
    DataStatus_Null = 0; //空数据
    DataStatus_Current = 1; //当前时间点数据
    DataStatus_Previous = 2; //前一个时间点数据
    DataStatus_Back = 3; //后一个时间点数据
   * @typedef {number} DataStatus
   */
  /**
   * K线数据
   *
   * @typedef HistoryPointsKL
   * @property {DataStatus} status DataStatus,数据状态
   * @property {string} reqTime 请求的时间
   * @property {KLine} kl K线数据
   */
  /**
   * 多只股票的多点历史K线点
   *
   * @typedef SecurityHistoryKLPoints
   * @property {Security} security 股票
   * @property {HistoryPointsKL} klList K线数据
   */
  /**
   * Qot_GetHistoryKLPoints.proto - 3101获取多只股票多点历史K线
   *
    复权类型参考 RehabType
    K线类型参考 KLType
    股票结构参考 Security
    K线结构参考 KLine
    K线字段类型参考 KLFields
    目前限制最多5个时间点，股票个数不做限制，但不建议传入过多股票，查询耗时过多会导致协议返回超时。
   * @async
   * @param {object} params
   * @param {RehabType} params.rehabType Qot_Common.RehabType,复权类型
   * @param {KLType} params.klType Qot_Common.KLType,K线类型
   * @param {NoDataMode} params.noDataMode NoDataMode,当请求时间点数据为空时，如何返回数据
   * @param {Security[]} params.securityList 股票市场以及股票代码
   * @param {string[]} params.timeList 时间字符串
   * @param {number} [params.maxReqSecurityNum] 最多返回多少只股票的数据，如果未指定表示不限制
   * @param {KLFields} [params.needKLFieldsFlag] 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
   * @returns {SecurityHistoryKLPoints[]}
   */
  qotGetHistoryKLPoints(params) { // 3101获取多只股票多点历史K线
    return this.socket.send('Qot_GetHistoryKLPoints', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,复权类型
      klType: 1, // Qot_Common.KLType,K线类型
      noDataMode: 0, // NoDataMode,当请求时间点数据为空时，如何返回数据。0
      securityList: [], // 股票市场以及股票代码
      timeList: [], // 时间字符串
      maxReqSecurityNum: 60, // 最多返回多少只股票的数据，如果未指定表示不限制
      needKLFieldsFlag: 512, // 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
    }, params)).klPointList || [];
  }
  /**
   * 公司行动组合,指定某些字段值是否有效
   *
    CompanyAct_None = 0; //无
    CompanyAct_Split = 1; //拆股
    CompanyAct_Join = 2; //合股
    CompanyAct_Bonus = 4; //送股
    CompanyAct_Transfer = 8; //转赠股
    CompanyAct_Allot = 16; //配股
    CompanyAct_Add = 32; //增发股
    CompanyAct_Dividend = 64; //现金分红
    CompanyAct_SPDividend = 128; //特别股息
   * @typedef {number} CompanyAct
   */
  /**
   * 复权信息
   *
   * @typedef Rehab
   * @property {string} time 时间字符串
   * @property {CompanyAct} companyActFlag 公司行动组合,指定某些字段值是否有效
   * @property {number} fwdFactorA 前复权因子A
   * @property {number} fwdFactorB 前复权因子B
   * @property {number} bwdFactorA 后复权因子A
   * @property {number} bwdFactorB 后复权因子B
   * @property {number} [splitBase] 拆股(eg.1拆5，Base为1，Ert为5)
   * @property {number} [splitErt]
   * @property {number} [joinBase] 合股(eg.50合1，Base为50，Ert为1)
   * @property {number} [joinErt]
   * @property {number} [bonusBase] 送股(eg.10送3, Base为10,Ert为3)
   * @property {number} [bonusErt]
   * @property {number} [transferBase] 转赠股(eg.10转3, Base为10,Ert为3)
   * @property {number} [transferErt]
   * @property {number} [allotBase] 配股(eg.10送2, 配股价为6.3元, Base为10, Ert为2, Price为6.3)
   * @property {number} [allotErt]
   * @property {number} [allotPrice]
   * @property {number} [addBase] 增发股(eg.10送2, 增发股价为6.3元, Base为10, Ert为2, Price为6.3)
   * @property {number} [addErt]
   * @property {number} [addPrice]
   * @property {number} [dividend] 现金分红(eg.每10股派现0.5元,则该字段值为0.05)
   * @property {number} [spDividend] 特别股息(eg.每10股派特别股息0.5元,则该字段值为0.05)
   */
  /**
   * 股票复权信息
   *
   * @typedef SecurityRehab
   * @property {Security} security 股票
   * @property {Rehab[]} rehabList 复权信息
   */
  /**
   * Qot_GetRehab.proto - 3102获取复权信息
   * @async
   * @param {Security[]} securityList 股票列表
   * @returns {SecurityRehab[]} securityRehabList 多支股票的复权信息
   */
  qotGetRehab(securityList) { // 3102获取复权信息
    return this.socket.send('Qot_GetRehab', {
      securityList,
    });
  }
  /**
   * TradeDate
   *
   * @typedef TradeDate
   * @property {string} time 时间字符串
   */
  /**
   * Qot_GetTradeDate.proto - 3200获取市场交易日
   * @async
   * @param {QotMarket} market  Qot_Common.QotMarket,股票市场
   * @param {string} beginTime 开始时间字符串 2018-01-01 00:00:00
   * @param {string} endTime 结束时间字符串 2018-02-01 00:00:00
   * @return {TradeDate[]} tradeDateList 交易日
   */
  async qotGetTradeDate(market = 1, beginTime, endTime) { // 3200获取市场交易日
    return (await this.socket.send('Qot_GetTradeDate', {
      market,
      beginTime,
      endTime,
    })).tradeDateList || [];
  }
  /**
   * Qot_GetStaticInfo.proto - 3202获取股票静态信息
   * @async
   * @param {QotMarket} market Qot_Common.QotMarket,股票市场
   * @param {SecurityType} secType Qot_Common.SecurityType,股票类型
   * @returns {SecurityStaticInfo[]} 静态信息数组
   */
  async qotGetStaticInfo(market = 1, secType) { // 3202获取股票静态信息
    return (await this.socket.send('Qot_GetStaticInfo', {
      market,
      secType,
    })).staticInfoList || [];
  }
  /**
   * 正股类型额外数据
   * @typedef EquitySnapshotExData
   * @property {number} issuedShares 发行股本,即总股本
   * @property {number} issuedMarketVal 总市值 =总股本*当前价格
   * @property {number} netAsset 资产净值
   * @property {number} netProfit 盈利（亏损）
   * @property {number} earningsPershare 每股盈利
   * @property {number} outstandingShares 流通股本
   * @property {number} outstandingMarketVal 流通市值 =流通股本*当前价格
   * @property {number} netAssetPershare 每股净资产
   * @property {number} eyRate 收益率
   * @property {number} peRate 市盈率
   * @property {number} pbRate 市净率
   */
  /**
   * 涡轮类型额外数据
   * @typedef WarrantSnapshotExData
   * @property {number} conversionRate 换股比率
   * @property {WarrantType} warrantType Qot_Common.WarrantType,涡轮类型
   * @property {number} strikePrice 行使价
   * @property {string} maturityTime 到期日时间字符串
   * @property {string} endTradeTime 最后交易日时间字符串
   * @property {Security} owner 所属正股
   * @property {number} recoveryPrice 回收价
   * @property {number} streetVolumn 街货量
   * @property {number} issueVolumn 发行量
   * @property {number} streetRate 街货占比
   * @property {number} delta 对冲值
   * @property {number} impliedVolatility 引申波幅
   * @property {number} premium 溢价
   */
  /**
   * 基本快照数据
   * @typedef SnapshotBasicData
   * @property {Security} security 股票
   * @property {SecurityType} type Qot_Common.SecurityType,股票类型
   * @property {boolean} isSuspend 是否停牌
   * @property {string} listTime 上市时间字符串
   * @property {number} lotSize 每手数量
   * @property {number} priceSpread 价差
   * @property {string} updateTime 更新时间字符串
   * @property {number} highPrice 最新价
   * @property {number} openPrice 开盘价
   * @property {number} lowPrice 最低价
   * @property {number} lastClosePrice 昨收价
   * @property {number} curPrice 最新价
   * @property {number} volume 成交量
   * @property {number} turnover 成交额
   * @property {number} turnoverRate 换手率
   */
  /**
   * 快照
   * @typedef Snapshot
   * @property {SnapshotBasicData} basic 快照基本数据
   * @property {EquitySnapshotExData} [equityExData] 正股快照额外数据
   * @property {WarrantSnapshotExData} [warrantExData] 窝轮快照额外数据
   */
  /**
   * Qot_GetSecuritySnapshot.proto - 3203获取股票快照
   *
    股票结构参考 Security
    限频接口：30秒内最多10次
    最多可传入200只股票
   * @async
   * @param {Security[]} securityList 股票列表
   * @returns {Snapshot[]} snapshotList 股票快照
   */
  async qotGetSecuritySnapShot(securityList) { // 3203获取股票快照
    const list = [].concat(securityList);
    let snapshotList = [];
    while (list.length) {
      const res = await this.limitExecTimes(
        30 * 1000, 10,
        async () => {
          const data = await this.socket.send('Qot_GetSecuritySnapshot', {
            securityList: list.splice(-200),
          });
          return data.snapshotList;
        },
      );
      snapshotList = snapshotList.concat(res);
    }
    return snapshotList;
  }
  /**
   * 限制接口调用频率
   * @param {Number} interval  限频间隔
   * @param {Number} times   次数
   * @param {Function} fn  要执行的函数
   */
  async limitExecTimes(interval, times, fn) {
    const now = Date.now();
    const name = `${fn.toString()}_exec_time_array`;
    const execArray = this[name] || [];
    while (execArray[0] && now - execArray[0] > interval) {
      execArray.shift();
    }
    if (execArray.length > times) {
      await this.sleep(interval - (now - execArray[0]));
    }
    execArray.push(Date.now());
    this[name] = execArray;
    return fn();
  }
  /**
   * PlateInfo
   * @typedef PlateInfo
   * @property {Security} plate 板块
   * @property {string} name 板块名字
   */
  /**
   * Qot_GetPlateSet.proto - 3204获取板块集合下的板块
   * @async
   * @param {QotMarket} market Qot_Common.QotMarket,股票市场
   * @param {PlateSetType} plateSetType Qot_Common.PlateSetType,板块集合的类型
   * @returns {PlateInfo[]}  板块集合下的板块信息
   */
  async qotGetPlateSet(market = 1, plateSetType) { // 3204获取板块集合下的板块
    return (await this.socket.send('Qot_GetPlateSet', {
      market,
      plateSetType,
    })).plateInfoList || [];
  }
  /**
   * Qot_GetPlateSecurity.proto - 3205获取板块下的股票
   * @async
   * @param {Security} plate 板块
   * @returns {SecurityStaticInfo[]}  板块下的股票静态信息
   */
  async qotGetPlateSecurity(plate) { // 3205获取板块下的股票
    return (await this.socket.send('Qot_GetPlateSecurity', {
      plate,
    })).staticInfoList || [];
  }
  /**
  * 股票类型
  *
    ReferenceType_Unknow = 0;
    ReferenceType_Warrant = 1; //正股相关的窝轮
  * @typedef {number} ReferenceType
  */
  /**
   * Qot_GetReference.proto - 3206 获取正股相关股票
   * @async
   * @param {security} security 股票
   * @param {ReferenceType} [referenceType] 相关类型，默认为1，获取正股相关的涡轮
   */
  async qotGetReference(security, referenceType = 1) {
    return (await this.socket.send('Qot_GetReference', {
      security,
      referenceType,
    })).staticInfoList || [];
  }
  /**
   * Trd_GetAccList.proto - 2001获取交易账户列表
   * @async
   * @returns {TrdAcc[]} 交易业务账户列表
   */
  async trdGetAccList() { // 2001获取交易账户列表
    const {
      accList,
    } = (await this.socket.send('Trd_GetAccList', {
      userID: this.userID,
    }));
    return accList.filter(acc => acc.trdMarketAuthList.includes(this.market));
  }
  /**
   * Trd_UnlockTrade.proto - 2005解锁或锁定交易
   *
    除2001协议外，所有交易协议请求都需要FutuOpenD先解锁交易
    密码MD5方式获取请参考 FutuOpenD配置 内的login_pwd_md5字段
    解锁或锁定交易针对与FutuOpenD，只要有一个连接解锁，其他连接都可以调用交易接口
    强烈建议有实盘交易的用户使用加密通道，参考 加密通信流程
    限频接口：30秒内最多10次
   * @param {boolean} [unlock=true] true解锁交易，false锁定交易，默认true
   * @param {string} [pwdMD5] 交易密码的MD5转16进制(全小写)，解锁交易必须要填密码，锁定交易不需要验证密码，可不填
   * @async
   */
  trdUnlockTrade(unlock = true, pwdMD5 = '') { // 2005解锁或锁定交易
    if (pwdMD5) this.pwdMD5 = pwdMD5;
    return this.socket.send('Trd_UnlockTrade', {
      unlock,
      pwdMD5: pwdMD5 || this.pwdMD5,
    });
  }
  /**
   * Trd_SubAccPush.proto - 2008订阅接收交易账户的推送数据
   * @async
   * @param {number[]} accIDList 要接收推送数据的业务账号列表，全量非增量，即使用者请每次传需要接收推送数据的所有业务账号
   */
  async trdSubAccPush(accIDList) { // 2008订阅接收交易账户的推送数据
    return this.socket.send('Trd_SubAccPush', {
      accIDList,
    });
  }
  /**
   * 设置交易模块的公共header，调用交易相关接口前必须先调用此接口。
   * @param {TrdEnv} trdEnv 交易环境, 参见TrdEnv的枚举定义。0为仿真，1为真实，默认为1。
   * @param {number} accID 业务账号, 业务账号与交易环境、市场权限需要匹配，否则会返回错误，默认为当前userID
   * @param {TrdMarket} [trdMarket=1] 交易市场, 参见TrdMarket的枚举定义，默认为1，即香港市场。
   */
  setCommonTradeHeader(trdEnv = 1, accID, trdMarket = 1) { // 设置交易模块的公共header，调用交易相关接口前必须先调用此接口。
    this.market = trdMarket;
    this.trdHeader = {
      trdEnv,
      accID,
      trdMarket,
    };
  }
  /**
   * Trd_GetFunds.proto - 2101获取账户资金，需要先设置交易模块公共header
   * @returns {Funds}
   */
  async trdGetFunds() { // 2101获取账户资金
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_GetFunds', {
      header: this.trdHeader,
    })).funds;
  }
  /**
   * Trd_GetPositionList.proto - 2102获取持仓列表
   * @async
   * @param {TrdFilterConditions} filterConditions 过滤条件
   * @param {number} filterPLRatioMin 过滤盈亏比例下限，高于此比例的会返回，如0.1，返回盈亏比例大于10%的持仓
   * @param {number} filterPLRatioMax 过滤盈亏比例上限，低于此比例的会返回，如0.2，返回盈亏比例小于20%的持仓
   * @returns {Position[]} 持仓列表数组
   */
  async trdGetPositionList(filterConditions, filterPLRatioMin, filterPLRatioMax) { // 2102获取持仓列表
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_GetPositionList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions, // 过滤条件
      filterPLRatioMin, // 过滤盈亏比例下限，高于此比例的会返回，如0.1，返回盈亏比例大于10%的持仓
      filterPLRatioMax, // 过滤盈亏比例上限，低于此比例的会返回，如0.2，返回盈亏比例小于20%的持仓
    })).positionList || [];
  }
  /**
   * Trd_GetMaxTrdQtys.proto - 2111获取最大交易数量
   * @param {object} params
   * @param {TrdHeader} [params.header] 交易公共参数头，默认不用填写
   * @param {OrderType} params.orderType 订单类型, 参见Trd_Common.OrderType的枚举定义
   * @param {string} params.code 代码
   * @param {number} [params.price] 价格，3位精度(A股2位)
   * @param {number} params.orderID 订单号，新下订单不需要，如果是修改订单就需要把原订单号带上才行，因为改单的最大买卖数量会包含原订单数量。
   * 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
   * @param {boolean} [params.adjustPrice] 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
   * @param {number} [params.adjustSideAndLimit] 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
   * @returns {MaxTrdQtys} 最大交易数量结构体
   */
  async trdGetMaxTrdQtys(params) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_GetMaxTrdQtys', Object.assign({
      header: this.trdHeader, // 交易公共参数头
      orderType: 1, // 订单类型, 参见Trd_Common.OrderType的枚举定义
      code: '', // 代码
      price: 0, // 价格，3位精度(A股2位)
      orderID: 0, // 订单号，新下订单不需要，如果是修改订单就需要把原订单号带上才行，因为改单的最大买卖数量会包含原订单数量。
      // 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
      adjustPrice: false, // 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
      adjustSideAndLimit: 0, // 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
    }, params))).maxTrdQtys;
  }
  /**
   * Trd_GetOrderList.proto - 2201获取订单列表
   * @async
   * @param {TrdFilterConditions} filterConditions 过滤条件
   * @param {OrderStatus[]} filterStatusList 需要过滤的订单状态列表
   * @returns {Order[]} 订单列表
   */
  async trdGetOrderList(filterConditions, filterStatusList) { // 2201获取订单列表
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_GetOrderList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
      filterStatusList,
    })).orderList || [];
  }
  /**
   * Trd_PlaceOrder.proto - 2202下单
   *
    请求包标识结构参考 PacketID
    交易公共参数头结构参考 TrdHeader
    交易方向枚举参考 TrdSide
    订单类型枚举参考 OrderType
    限频接口：30秒内最多30次
   * @async
   * @param {object} params
   * @param {PacketID} [params.packetID] 交易写操作防重放攻击，默认不用填写
   * @param {TrdHeader} [params.header] 交易公共参数头，默认不用填写
   * @param {TrdSide} params.trdSide 交易方向, 参见Trd_Common.TrdSide的枚举定义
   * @param {OrderType} params.orderType 订单类型, 参见Trd_Common.OrderType的枚举定义
   * @param {string} params.code 代码
   * @param {number} params.qty 数量，2位精度，期权单位是"张"
   * @param {number} [params.price] 价格，3位精度(A股2位)
   * 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
   * @param {boolean} [params.adjustPrice] 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
   * @param {number} [params.adjustSideAndLimit] 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
   * @returns {number} orderID 订单号
   */
  async trdPlaceOrder(params) { // 2202下单
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_PlaceOrder', Object.assign({
      packetID: {
        connID: this.connID,
        serialNo: this.socket.requestId,
      }, // 交易写操作防重放攻击
      header: this.trdHeader, // 交易公共参数头
      trdSide: 0, // 交易方向，1买入，2卖出
      orderType: 1, // 订单类型, 参见Trd_Common.OrderType的枚举定义
      code: '', // 代码
      qty: 0, // 数量，2位精度，期权单位是"张"
      price: 0, // 价格，3位精度(A股2位)
      // 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
      adjustPrice: false, // 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
      adjustSideAndLimit: 0, // 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
    }, params))).orderID;
  }
  /**
   * 2202市价下单，直到成功为止，返回买入/卖出的总价格
   *
   * @async
   * @param {object} param
   * @param {TrdSide} params.trdSide 交易方向, 参见Trd_Common.TrdSide的枚举定义
   * @param {string} params.code 代码
   * @param {number} params.qty 数量，2位精度，期权单位是"张"
   * @returns {number} 卖出/买入总价
   */
  async trdPlaceOrderMarket(param) { // 市价买入卖出
    const { trdSide, code, qty } = param; // trdSide 1买入2卖出
    let remainQty = qty;
    let value = 0;
    while (remainQty > 0) {
      let orderID = null;
      let order = null;
      const orderBooks = await this.qotGetOrderBook({ market: this.market, code });// 获取盘口
      const price = trdSide === 1 ? orderBooks.sellList[0].price : orderBooks.buyList[0].price;
      if (orderID && order.orderStatus === 10) {
        await this.trdModifyOrder({// 修改订单并设置订单为有效
          modifyOrderOp: 4, orderID, price, qty: remainQty,
        });
      } else if (!orderID) {
        orderID = await this.trdPlaceOrder({
          trdSide, code, qty: remainQty, price,
        }); // 下单
      }
      // eslint-disable-next-line
      while (true) {
        // 确认了不传入过滤条件会返回所有订单
        const list = await this.trdGetOrderList({}, []);
        // eslint-disable-next-line
        order = list.filter(item => item.orderID === orderID);
        if (order) {
          if (order.orderStatus > 11) {
            order = null;
            orderID = null;
            break;
          } else if (order.orderStatus < 10) {
            await sleep(50);
          } else if (order.fillQty > 0) {
            remainQty -= order.fillQty;
            value += order.price * order.fillQty;
            if (remainQty > 0 && order.orderStatus === 10) { // 部分成交，先设置为失效
              await this.trdModifyOrder({ modifyOrderOp: 3, orderID }); // 失效
            }
          }
        } else {
          await sleep(60);
        }
      }
    }
    return value;
  }
  /**
   * Trd_ModifyOrder.proto - 2205修改订单(改价、改量、改状态等)
   *
    请求包标识结构参考 PacketID
    交易公共参数头结构参考 TrdHeader
    修改操作枚举参考 ModifyOrderOp
    限频接口：30秒内最多30次
   * @async
   * @param {object} params
   * @param {PacketID} [params.packetID] 交易写操作防重放攻击，默认不用填写
   * @param {TrdHeader} [params.header] 交易公共参数头，默认不用填写
   * @param {number} params.orderID 订单号，forAll为true时，传0
   * @param {ModifyOrderOp} params.modifyOrderOp 修改操作类型，参见Trd_Common.ModifyOrderOp的枚举定义
   * @param {boolean} [params.forAll] 是否对此业务账户的全部订单操作，true是，false否(对单个订单)，无此字段代表false，仅对单个订单
   * 下面的字段仅在modifyOrderOp为ModifyOrderOp_Normal有效
   * @param {number} [params.qty] 数量，2位精度，期权单位是"张"
   * @param {number} [params.price] 价格，3位精度(A股2位)
   * 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
   * @param {boolean} [params.adjustPrice] 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
   * @param {number} [params.adjustSideAndLimit] 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
   * @returns {number} orderID 订单号
   */
  async trdModifyOrder(params) { // 2205修改订单(改价、改量、改状态等)
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_ModifyOrder', Object.assign({
      packetID: {
        connID: this.connID,
        serialNo: this.socket.requestId,
      }, // 交易写操作防重放攻击
      header: this.trdHeader, // 交易公共参数头
      orderID: 0, // 订单号，forAll为true时，传0
      modifyOrderOp: 1, // //修改操作类型，参见Trd_Common.ModifyOrderOp的枚举定义
      forAll: false, // /是否对此业务账户的全部订单操作，true是，false否(对单个订单)，无此字段代表false，仅对单个订单
      qty: 0, // 数量，2位精度，期权单位是"张"
      price: 0, // 价格，3位精度(A股2位)
      // 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
      adjustPrice: false, // 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
      adjustSideAndLimit: 0, // 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
    }, params))).orderID;
  }
  /**
   * 注册订单更新通知
   * Trd_UpdateOrder.proto - 2208推送订单更新
   * @async
   * @param {function} callback 回调
   * @returns {Order} 订单结构
   */
  async subTrdUpdateOrder(callback) { // 注册订单更新通知
    return this.socket.subNotify(2208, data => callback(data.order));
  }
  /**
  * 取消注册订单更新通知
  * Trd_UpdateOrder.proto - 2208推送订单更新
  * @async
  */
  async unsubTrdUpdateOrder() { // 取消注册订单更新通知
    return this.socket.unsubNotify(2208);
  }
  /**
   * Trd_GetOrderFillList.proto - 2211获取成交列表
   * @async
   * @param {TrdFilterConditions} filterConditions 过滤条件
   * @returns {OrderFill[]} 成交列表
   */
  async trdGetOrderFillList(filterConditions) { // 2211获取成交列表
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_GetOrderFillList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
    })).orderFillList || [];
  }
  /**
   * 注册新成交通知
   * Trd_UpdateOrderFill.proto - 2218推送新成交
   * @param {function} callback 回调
   * @returns {OrderFill} 成交结构
   */
  async subTrdUpdateOrderFill(callback) { // 注册新成交通知
    return this.socket.subNotify(2218, data => callback(data.orderFill || []));
  }
  /**
   * Trd_GetHistoryOrderList.proto - 2221获取历史订单列表
   *
    交易公共参数头结构参考 TrdHeader
    订单结构参考 Order
    过滤条件结构参考 TrdFilterConditions
    订单状态枚举参考 OrderStatus
    限频接口：30秒内最多10次
   * @async
   * @param {TrdFilterConditions} filterConditions 过滤条件
   * @param {OrderStatus} filterStatusList OrderStatus, 需要过滤的订单状态列表
   * @returns {Order[]} 历史订单列表
   */
  async trdGetHistoryOrderList(filterConditions, filterStatusList) { // 2221获取历史订单列表
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_GetHistoryOrderList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
      filterStatusList,
    })).orderList || [];
  }
  /**
   * Trd_GetHistoryOrderFillList.proto - 2222获取历史成交列表
   *
    交易公共参数头结构参考 TrdHeader
    成交结构参考 OrderFill
    过滤条件结构参考 TrdFilterConditions
    限频接口：30秒内最多10次
   * @async
   * @param {TrdFilterConditions} filterConditions 过滤条件
   * @returns {OrderFill[]} 历史成交列表
   */
  async trdGetHistoryOrderFillList(filterConditions) { // 2222获取历史成交列表
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return (await this.socket.send('Trd_GetHistoryOrderFillList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
    })).orderFillList || [];
  }
}

module.exports = FutuQuant;