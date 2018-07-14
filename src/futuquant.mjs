/**
 * FutuQuant 0.0.1
 */
import Socket from './socket';

/**
 * @class FutuQuant
 */
class FutuQuant {
  constructor(params) {
    if (typeof params !== 'object') throw new Error('传入参数类型错误');
    const {
      ip, port, userID,
    } = params;
    if (!ip) throw new Error('必须指定FutuOpenD服务的ip');
    if (!port) throw new Error('必须指定FutuOpenD服务的port');
    if (!userID) throw new Error('必须指定FutuOpenD服务的牛牛号');

    this.socket = new Socket(ip, port); // 所有行情拉取接口
    this.userID = userID;
    this.inited = false;
    this.trdHeader = null;
  }
  /**
   * InitConnect.proto - 1001初始化连接
   * @param params Object
   */
  async initConnect(params) {
    if (this.inited) throw new Error('请勿重复初始化连接');
    this.inited = true;
    await this.socket.init();
    const res = await this.socket.send('InitConnect', Object.assign({
      clientVer: 101,
      clientID: 'yisbug',
      recvNotify: true,
    }, params));
    // 保持心跳
    this.connID = res.connID;
    this.connAESKey = res.connAESKey;
    this.keepAliveInterval = res.keepAliveInterval;
    setInterval(() => this.keepAlive(), 1000 * this.keepAliveInterval);
    return res;
  }
  /**
   * GetGlobalState.proto - 1002获取全局状态
   */
  getGlobalState() {
    return this.socket.send('GetGlobalState', { userID: this.userID });
  }
  /**
   * KeepAlive.proto - 1004保活心跳
   */
  keepAlive() {
    return this.socket.send('KeepAlive', { time: Math.round(Date.now() / 1000) });
  }
  /**
   * Qot_Sub.proto - 3001订阅或者反订阅
   * @param params Object
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
   * @param params Object
   */
  qotRegQotPush(params) {
    return this.socket.send('Qot_RegQotPush', Object.assign({
      securityList: [],
      subTypeList: [],
      rehabTypeList: [],
      isRegOrUnReg: true,
      isFirstPush: true,
    }, params));
  }
  /**
   * Qot_GetSubInfo.proto - 3003获取订阅信息
   * @param isReqAllConn 是否返回所有连接的订阅状态，默认false
   */
  qotGetSubInfo(isReqAllConn = false) {
    return this.socket.send('Qot_RegQotPush', { isReqAllConn });
  }
  /**
   * Qot_GetBasicQot.proto - 3004获取股票基本行情
   * @param securityList Array 股票列表
   */
  qotGetBasicQot(securityList) {
    return this.socket.send('Qot_GetBasicQot', { securityList });
  }
  /**
   * 注册股票基本报价通知，需要先调用订阅接口
   * Qot_UpdateBasicQot.proto - 3005推送股票基本报价
   * @param callback function 回调
   */
  subQotUpdateBasicQot(callback) {
    return this.socket.subNotify(3005, callback);
  }
  /**
   * Qot_GetKL.proto - 3006获取K线

    RehabType_None = 0; //不复权
    RehabType_Forward = 1; //前复权
    RehabType_Backward = 2; //后复权

    KLType_Unknown = 0; //未知
    KLType_1Min = 1; //1分K
    KLType_Day = 2; //日K
    KLType_Week = 3; //周K
    KLType_Month = 4; //月K
    KLType_Year = 5; //年K
    KLType_5Min = 6; //5分K
    KLType_15Min = 7; //15分K
    KLType_30Min = 8; //30分K
    KLType_60Min = 9; //60分K
    KLType_3Min = 10; //3分K
    KLType_Quarter = 11; //季K
   * @param params Object
   */
  qotGetKL(params) {
    return this.socket.send('Qot_GetKL', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,复权类型
      klType: 1, // Qot_Common.KLType,K线类型
      security: {}, // 股票
      reqNum: 60, // 请求K线根数
    }, params));
  }
  /**
   * 注册K线推送，需要先调用订阅接口
   * Qot_UpdateKL.proto - 3007推送K线
   */
  subQotUpdateKL(callback) {
    return this.socket.subNotify(3007, callback);
  }
  /**
   * Qot_GetRT.proto - 3008获取分时
   */
  qotGetRT(security) {
    return this.socket.send('Qot_GetRT', { security });
  }
  /**
   * 注册分时推送，需要先调用订阅接口
   * Qot_UpdateRT.proto - 3009推送分时
   */
  subQotUpdateRT(callback) {
    return this.socket.subNotify(3009, callback);
  }
  /**
   * Qot_GetTicker.proto - 3010获取逐笔
   * @param security 股票
   * @param maxRetNum 最多返回的逐笔个数,实际返回数量不一定会返回这么多,最多返回1000个，默认100
   */
  qotGetTicker(security, maxRetNum = 100) {
    return this.socket.send('Qot_GetTicker', { security, maxRetNum });
  }
  /**
   * 注册逐笔推送，需要先调用订阅接口
   * Qot_UpdateTicker.proto - 3011推送逐笔
   * @param callback function 回调
   */
  subQotUpdateTicker(callback) {
    return this.socket.subNotify(3011, callback);
  }
  /**
   * Qot_GetOrderBook.proto - 3012获取买卖盘
   * @param security Object 股票
   * @param num 请求的摆盘个数（1-10），默认10
   */
  qotGetOrderBook(security, num = 10) {
    return this.socket.send('Qot_GetOrderBook', { security, num });
  }
  /**
   * 注册买卖盘推送，需要先调用订阅接口
   * Qot_UpdateOrderBook.proto - 3013推送买卖盘
   * @param callback function 回调
   */
  subQotUpdateOrderBook(callback) {
    return this.socket.subNotify(3013, callback);
  }
  /**
   * Qot_GetBroker.proto - 3014获取经纪队列
   * @param security Object 股票
   */
  qotGetBroker(security) {
    return this.socket.send('Qot_GetBroker', { security });
  }
  /**
   * 注册经纪队列推送，需要先调用订阅接口
   * Qot_UpdateBroker.proto - 3015推送经纪队列
   * @param callback function 回调
   */
  subQotUpdateBroker(callback) {
    return this.socket.subNotify(3015, callback);
  }
  /**
   * Qot_GetHistoryKL.proto - 3100获取单只股票一段历史K线
   * @param params Object
   */
  qotGetHistoryKL(params) {
    return this.socket.send('Qot_GetHistoryKL', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,复权类型
      klType: 1, // Qot_Common.KLType,K线类型
      security: {}, // 股票市场以及股票代码
      beginTime: '', // 开始时间字符串
      endTime: '', // 结束时间字符串
      maxAckKLNum: 60, // 最多返回多少根K线，如果未指定表示不限制
      needKLFieldsFlag: 512, // 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
    }, params));
  }
  /**
   * Qot_GetHistoryKLPoints.proto - 3101获取多只股票多点历史K线
    NoDataMode_Null = 0; //直接返回空数据
    NoDataMode_Forward = 1; //往前取值，返回前一个时间点数据
    NoDataMode_Backward = 2; //向后取值，返回后一个时间点数据
   * @param params Object
   */
  qotGetHistoryKLPoints(params) {
    return this.socket.send('Qot_GetHistoryKLPoints', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,复权类型
      klType: 1, // Qot_Common.KLType,K线类型
      noDataMode: 0, // NoDataMode,当请求时间点数据为空时，如何返回数据。0
      securityList: [], // 股票市场以及股票代码
      timeList: [], // 时间字符串
      maxReqSecurityNum: 60, // 最多返回多少只股票的数据，如果未指定表示不限制
      needKLFieldsFlag: 512, // 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
    }, params));
  }
  /**
   * Qot_GetRehab.proto - 3102获取复权信息
   * @param securityList 股票列表
   */
  qotGetRehab(securityList) {
    return this.socket.send('Qot_GetRehab', { securityList });
  }
  /**
   * Qot_GetTradeDate.proto - 3200获取市场交易日
   * @param market  Qot_Common.QotMarket,股票市场
   * @param beginTime 开始时间字符串
   * @param endTime 结束时间字符串
   */
  qotGetTradeDate(market = 1, beginTime = '2018-01-01 00:00:00', endTime = '2018-02-01 00:00:00') {
    return this.socket.send('Qot_GetTradeDate', { market, beginTime, endTime });
  }
  /**
   * Qot_GetStaticInfo.proto - 3202获取股票静态信息
   * @param market Qot_Common.QotMarket,股票市场
   * @param secType Qot_Common.SecurityType,股票类型
   */
  qotGetStaticInfo(market = 1, secType) {
    return this.socket.send('Qot_GetStaticInfo', { market, secType });
  }
  /**
   * Qot_GetSecuritySnapshot.proto - 3203获取股票快照
   * @param securityList 股票列表
   */
  qotGetSecuritySnapShot(securityList) {
    return this.socket.send('Qot_GetSecuritySnapshot', { securityList });
  }
  /**
   * Qot_GetPlateSet.proto - 3204获取板块集合下的板块
   * @param market Qot_Common.QotMarket,股票市场
   * @param plateSetType Qot_Common.PlateSetType,板块集合的类型
   */
  qotGetPlateSet(market = 1, plateSetType) {
    return this.socket.send('Qot_GetPlateSet', { market, plateSetType });
  }
  /**
   * Qot_GetPlateSecurity.proto - 3205获取板块下的股票
   * @param plate 板块
   */
  qotGetPlateSecurity(plate) {
    return this.socket.send('Qot_GetPlateSecurity', { plate });
  }
  /**
   * Trd_GetAccList.proto - 2001获取交易账户列表
   * @param userID
   */
  trdGetAccList(userID = this.userID) {
    return this.socket.send('Trd_GetAccList', { userID });
  }
  /**
   * Trd_UnlockTrade.proto - 2005解锁或锁定交易
   * 除2001协议外，所有交易协议请求都需要FutuOpenD先解锁交易
   * 密码MD5方式获取请参考 FutuOpenD配置 内的login_pwd_md5字段
   * 解锁或锁定交易针对与FutuOpenD，只要有一个连接解锁，其他连接都可以调用交易接口
   * 强烈建议有实盘交易的用户使用加密通道，参考 加密通信流程
   * 限频接口：30秒内最多10次
   * @param unlock true解锁交易，false锁定交易，默认true
   * @param pwdMD5 交易密码的MD5转16进制(全小写)，解锁交易必须要填密码，锁定交易不需要验证密码，可不填
   */
  trdUnlockTrade(unlock = true, pwdMD5 = '') {
    return this.socket.send('Trd_UnlockTrade', { unlock, pwdMD5 });
  }
  /**
   * Trd_SubAccPush.proto - 2008订阅接收交易账户的推送数据
   * @param accIDList 要接收推送数据的业务账号列表，全量非增量，即使用者请每次传需要接收推送数据的所有业务账号
   */
  trdSubAccPush(accIDList) {
    return this.socket.send('Trd_UnlockTrade', { accIDList });
  }
  /**
   * 设置交易模块的公共header
   * @param trdEnv 交易环境, 参见TrdEnv的枚举定义。0为仿真，1为真实，默认为1。
   * @param accID 业务账号, 业务账号与交易环境、市场权限需要匹配，否则会返回错误，默认为当前userID
   * @param trdMarket 交易市场, 参见TrdMarket的枚举定义，默认为1，即香港市场。
   */
  setCommonTradeHeader(trdEnv = 1, accID = this.userID, trdMarket = 1) {
    this.trdHeader = { trdEnv, accID, trdMarket };
  }
  /**
   * Trd_GetFunds.proto - 2101获取账户资金，需要先设置交易模块公共header
   */
  trdGetFunds() {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_GetFunds', { header: this.trdHeader });
  }
  /**
   * Trd_GetPositionList.proto - 2102获取持仓列表
   * @param filterConditions 过滤条件
   * @param filterPLRatioMin 过滤盈亏比例下限，高于此比例的会返回，如0.1，返回盈亏比例大于10%的持仓，默认0.1
   * @param filterPLRatioMax 过滤盈亏比例上限，低于此比例的会返回，如0.2，返回盈亏比例小于20%的持仓，默认0.2
   */
  trdGetPositionList(filterConditions = {}, filterPLRatioMin = 0.1, filterPLRatioMax = 0.2) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_GetPositionList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions, // 过滤条件
      filterPLRatioMin, // 过滤盈亏比例下限，高于此比例的会返回，如0.1，返回盈亏比例大于10%的持仓
      filterPLRatioMax, // 过滤盈亏比例上限，低于此比例的会返回，如0.2，返回盈亏比例小于20%的持仓
    });
  }
  /**
   * Trd_GetOrderList.proto - 2201获取订单列表
   * @param filterConditions 过滤条件
   * @param filterStatusList 需要过滤的订单状态列表
   */
  trdGetOrderList(filterConditions, filterStatusList) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_GetOrderList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
      filterStatusList,
    });
  }
  /**
   * Trd_PlaceOrder.proto - 2202下单
   * @param params Object
   */
  trdPlaceOrder(params) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_PlaceOrder', Object.assign({
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
    }, params));
  }
  /**
   * Trd_ModifyOrder.proto - 2205修改订单(改价、改量、改状态等)
   * @param params Object
   */
  trdModifyOrder(params) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_ModifyOrder', Object.assign({
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
    }, params));
  }
  /**
   * 注册订单更新通知
   * Trd_UpdateOrder.proto - 2208推送订单更新
   * @param callback function 回调
   */
  subTrdUpdateOrder(callback) {
    return this.socket.subNotify(2208, callback);
  }
  /**
   * Trd_GetOrderFillList.proto - 2211获取成交列表
   * @param filterConditions 过滤条件
   */
  trdGetOrderFillList(filterConditions) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_GetOrderFillList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
    });
  }
  /**
   * 注册新成交通知
   * Trd_UpdateOrderFill.proto - 2218推送新成交
   * @param callback function 回调
   */
  subTrdUpdateOrderFill(callback) {
    return this.socket.subNotify(2218, callback);
  }
  /**
   * Trd_GetHistoryOrderList.proto - 2221获取历史订单列表
   * @param filterConditions 过滤条件
   * @param filterStatusList OrderStatus, 需要过滤的订单状态列表
   */
  trdGetHistoryOrderList(filterConditions, filterStatusList) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_GetHistoryOrderList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
      filterStatusList,
    });
  }
  /**
   * Trd_GetHistoryOrderFillList.proto - 2222获取历史成交列表
   * @param filterConditions 过滤条件
   */
  trdGetHistoryOrderFillList(filterConditions) {
    if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
    return this.socket.send('Trd_GetHistoryOrderFillList', {
      header: this.trdHeader, // 交易公共参数头
      filterConditions,
    });
  }
}

export default FutuQuant;
