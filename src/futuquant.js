'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Common
/**
 * 协议返回值
 *
    RetType 定义协议请求返回值
    请求失败情况，除网络超时外，其它具体原因参见各协议定义的retMsg字段

    RetType_Succeed = 0; //成功
    RetType_Failed = -1; //失败
    RetType_TimeOut = -100; //超时
    RetType_Unknown = -400; //未知结果
 * @typedef {number} RetType
 */
/**
 * 请求包标识，包的唯一标识，用于回放攻击的识别和保护
 *
    PacketID 用于唯一标识一次请求
    serailNO 由请求方自定义填入包头，为防回放攻击要求自增，否则新的请求将被忽略
 * @typedef {object} PacketID
 * @property {number} connID 当前TCP连接的连接ID，一条连接的唯一标识，InitConnect协议会返回
 * @property {number} serialNo 包头中的包自增序列号
 */

// Qot_Common
/**
 * 行情市场
 *
    QotMarket定义一支证券所属的行情市场分类
    QotMarket_HK_Future 港股期货，目前仅支持 999010(恒指当月期货)、999011(恒指下月期货)
    QotMarket_US_Option 美股期权，牛牛客户端可以查看行情，API 后续支持

    QotMarket_Unknown = 0; //未知市场
    QotMarket_HK_Security = 1; //港股
    QotMarket_HK_Future = 2; //港期货(目前是恒指的当月、下月期货行情)
    QotMarket_US_Security = 11; //美股
    QotMarket_US_Option = 12; //美期权,暂时不支持期权
    QotMarket_CNSH_Security = 21; //沪股
    QotMarket_CNSZ_Security = 22; //深股
 *
 * @typedef {number} QotMarket
 */
/**
 * 股票类型
 *
    SecurityType_Unknown = 0; //未知
    SecurityType_Bond = 1; //债券
    SecurityType_Bwrt = 2; //一揽子权证
    SecurityType_Eqty = 3; //正股
    SecurityType_Trust = 4; //信托,基金
    SecurityType_Warrant = 5; //涡轮
    SecurityType_Index = 6; //指数
    SecurityType_Plate = 7; //板块
    SecurityType_Drvt = 8; //期权
    SecurityType_PlateSet = 9; //板块集
 * @typedef {number} SecurityType
 */
/**
 * 板块集合的类型
 *
    Qot_GetPlateSet 请求参数类型

    PlateSetType_All = 0; //所有板块
    PlateSetType_Industry = 1; //行业板块
    PlateSetType_Region = 2; //地域板块,港美股市场的地域分类数据暂为空
    PlateSetType_Concept = 3; //概念板块
 * @typedef {number} PlateSetType
 */
/**
 * 窝轮子类型
 *
    WarrantType_Unknown = 0; //未知
    WarrantType_Buy = 1; //认购
    WarrantType_Sell = 2; //认沽
    WarrantType_Bull = 3; //牛
    WarrantType_Bear = 4; //熊
 * @typedef {number} WarrantType
 */
/**
 * 行情市场状态
 *
    QotMarketState_None = 0; // 无交易,美股未开盘
    QotMarketState_Auction = 1; // 竞价
    QotMarketState_WaitingOpen = 2; // 早盘前等待开盘
    QotMarketState_Morning = 3; // 早盘
    QotMarketState_Rest = 4; // 午间休市
    QotMarketState_Afternoon = 5; // 午盘
    QotMarketState_Closed = 6; // 收盘
    QotMarketState_PreMarketBegin = 8; // 盘前
    QotMarketState_PreMarketEnd = 9; // 盘前结束
    QotMarketState_AfterHoursBegin = 10; // 盘后
    QotMarketState_AfterHoursEnd = 11; // 盘后结束
    QotMarketState_NightOpen = 13; // 夜市开盘
    QotMarketState_NightEnd = 14; // 夜市收盘
    QotMarketState_FutureDayOpen = 15; // 期指日市开盘
    QotMarketState_FutureDayBreak = 16; // 期指日市休市
    QotMarketState_FutureDayClose = 17; // 期指日市收盘
    QotMarketState_FutureDayWaitForOpen = 18; // 期指日市等待开盘
    QotMarketState_HkCas = 19; // 盘后竞价,港股市场增加CAS机制对应的市场状态
 * @typedef {number} QotMarketState
 */
/**
 * 复权类型
 *
    RehabType_None = 0; //不复权
    RehabType_Forward = 1; //前复权
    RehabType_Backward = 2; //后复权
 * @typedef {number} RehabType
 */
/**
 * K线类型，枚举值兼容旧协议定义，新类型季K,年K,3分K暂时没有支持历史K线
 *
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
 * @typedef {number} KLType
 */
/**
 * 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
 *
    KLFields_None = 0; //
    KLFields_High = 1; //最高价
    KLFields_Open = 2; //开盘价
    KLFields_Low = 4; //最低价
    KLFields_Close = 8; //收盘价
    KLFields_LastClose = 16; //昨收价
    KLFields_Volume = 32; //成交量
    KLFields_Turnover = 64; //成交额
    KLFields_TurnoverRate = 128; //换手率
    KLFields_PE = 256; //市盈率
    KLFields_ChangeRate = 512; //涨跌幅
 * @typedef {number} KLFields
 */
/**
 * 行情定阅类型，订阅类型，枚举值兼容旧协议定义
 *
    SubType_None = 0;
    SubType_Basic = 1; //基础报价
    SubType_OrderBook = 2; //摆盘
    SubType_Ticker = 4; //逐笔
    SubType_RT = 5; //分时
    SubType_KL_Day = 6; //日K
    SubType_KL_5Min = 7; //5分K
    SubType_KL_15Min = 8; //15分K
    SubType_KL_30Min = 9; //30分K
    SubType_KL_60Min = 10; //60分K
    SubType_KL_1Min = 11; //1分K
    SubType_KL_Week = 12; //周K
    SubType_KL_Month = 13; //月K
    SubType_Broker = 14; //经纪队列
    SubType_KL_Qurater = 15; //季K
    SubType_KL_Year = 16; //年K
    SubType_KL_3Min = 17; //3分K
 * @typedef {number} SubType
 */
/**
 * 逐笔方向
 *
    TickerDirection_Unknown = 0; //未知
    TickerDirection_Bid = 1; //外盘
    TickerDirection_Ask = 2; //内盘
    TickerDirection_Neutral = 3; //中性盘
 * @typedef {number} TickerDirection
 */
/**
 * 股票，两个字段确定一支股票
 * @typedef {object} Security
 * @property {QotMarket} market QotMarket,股票市场
 * @property {string} code 股票代码
 */
/**
 * K线数据点
 * @typedef {object} KLine
 * @property {string} time 时间戳字符串
 * @property {boolean} isBlank 是否是空内容的点,若为ture则只有时间信息
 * @property {number} [highPrice] 最高价
 * @property {number} [openPrice] 开盘价
 * @property {number} [lowPrice] 最低价
 * @property {number} [closePrice] 收盘价
 * @property {number} [lastClosePrice] 昨收价
 * @property {number} [volume] 成交量
 * @property {number} [turnover] 成交额
 * @property {number} [turnoverRate] 换手率
 * @property {number} [pe] 市盈率
 * @property {number} [changeRate] 涨跌幅
 */
/**
 * 基础报价
 * @typedef {object} BasicQot
 * @property {security} security 股票
 * @property {boolean} isSuspended 是否停牌
 * @property {string} listTime 上市日期字符串
 * @property {number} priceSpread 价差
 * @property {string} updateTime 更新时间字符串
 * @property {number} highPrice 最高价
 * @property {number} openPrice 开盘价
 * @property {number} lowPrice 最低价
 * @property {number} curPrice 最新价
 * @property {number} lastClosePrice 昨收价
 * @property {number} volume 成交量
 * @property {number} turnover 成交额
 * @property {number} turnoverRate 换手率
 * @property {number} amplitude 振幅
 */
/**
 * 分时数据点
 * @typedef {object} TimeShare
 * @property {string} time 时间字符串
 * @property {number} minute 距离0点过了多少分钟
 * @property {boolean} isBlank 是否是空内容的点,若为ture则只有时间信息
 * @property {number} [price] 当前价
 * @property {number} [lastClosePrice] 昨收价
 * @property {number} [avgPrice] 均价
 * @property {number} [volume] 成交量
 * @property {number} [turnover] 成交额
 */
/**
 * 证券基本静态信息
 * @typedef {object} SecurityStaticBasic
 * @property {security} security 股票
 * @property {number} id 股票ID
 * @property {number} lotSize 每手数量
 * @property {SecurityType} secType Qot_Common.SecurityType,股票类型
 * @property {string} name 股票名字
 * @property {string} listTime 上市时间字符串
 */
/**
 * 窝轮额外股票静态信息
 * @typedef {object} WarrantStaticExData
 * @property {WarrantType} type Qot_Common.WarrantType,涡轮类型
 * @property {Security} owner 所属正股
 */
/**
 * 证券静态信息
 * @typedef {object} SecurityStaticInfo
 * @property {SecurityStaticBasic} basic 基本股票静态信息
 * @property {WarrantStaticExData} [warrantExData] 窝轮额外股票静态信息
 */
/**
 * 买卖经纪摆盘
 * @typedef {object} Broker
 * @property {number} id 经纪ID
 * @property {string} name 经纪名称
 * @property {number} pos 经纪档位
 */
/**
 * 逐笔成交
 * @typedef {object} Ticker
 * @property {string} time 时间字符串
 * @property {number} sequence 唯一标识
 * @property {TickerDirection} dir TickerDirection, 买卖方向
 * @property {number} price 价格
 * @property {number} volume 成交量
 * @property {number} turnover 成交额
 * @property {number} [recvTime] 收到推送数据的本地时间戳，用于定位延迟
 */
/**
 * 买卖十档摆盘
 * @typedef {object} OrderBook
 * @property {number} price 委托价格
 * @property {number} volume 委托数量
 * @property {number} orederCount 委托订单个数
 */
/**
 * 单个定阅类型信息
 * @typedef {object} SubInfo
 * @property {SubType} subType Qot_Common.SubType,订阅类型
 * @property {Security[]} securityList 订阅该类型行情的股票
 */
/**
 * 单条连接定阅信息
 *
    一条连接重复定阅其它连接已经订阅过的，不会额外消耗订阅额度
 * @typedef ConnSubInfo
 * @property {SubInfo[]} subInfoList 该连接订阅信息
 * @property {number} usedQuota 该连接已经使用的订阅额度
 * @property {boolean} isOwnConnData 用于区分是否是自己连接的数据
 */
// Trd_Common
/**
 * 交易环境
 *
    TrdEnv_Simulate = 0; //仿真环境(模拟环境)
    TrdEnv_Real = 1; //真实环境
 * @typedef {number} TrdEnv
 */
/**
 * 交易市场，是大的市场，不是具体品种
 *
    TrdMarket_Unknown = 0; //未知市场
    TrdMarket_HK = 1; //香港市场
    TrdMarket_US = 2; //美国市场
    TrdMarket_CN = 3; //大陆市场
    TrdMarket_HKCC = 4; //香港A股通市场
 * @typedef {number} TrdMarket
 */
/**
 * 交易方向，客户端下单只传Buy或Sell即可，SellShort是服务器返回有此方向，BuyBack目前不存在，但也不排除服务器会传
 *
    TrdSide_Unknown = 0; //未知方向
    TrdSide_Buy = 1; //买入
    TrdSide_Sell = 2; //卖出
    TrdSide_SellShort = 3; //卖空
    TrdSide_BuyBack = 4; //买回
 * @typedef {number} TrdSide
 */
/**
 * 订单类型
 *
    OrderType_Unknown = 0; //未知类型
    OrderType_Normal = 1; //普通订单(港股的增强限价单、A股的限价委托、美股的限价单)
    OrderType_Market = 2; //市价订单(目前仅美股)
    OrderType_AbsoluteLimit = 5; //绝对限价订单(目前仅港股)，只有价格完全匹配才成交，比如你下价格为5元的买单，卖单价格必须也要是5元才能成交，低于5元也不能成交。卖出同理
    OrderType_Auction = 6; //竞价订单(目前仅港股)，A股的早盘竞价订单类型不变还是OrderType_Normal
    OrderType_AuctionLimit = 7; //竞价限价订单(目前仅港股)
    OrderType_SpecialLimit = 8; //特别限价订单(目前仅港股)，成交规则同OrderType_AbsoluteLimit，且如果当前没有对手可成交，不能立即成交，交易所自动撤销订单
 * @typedef {number} OrderType
 */
/**
 * 订单状态
 *
    OrderStatus_Unsubmitted = 0; //未提交
    OrderStatus_Unknown = -1; //未知状态
    OrderStatus_WaitingSubmit = 1; //等待提交
    OrderStatus_Submitting = 2; //提交中
    OrderStatus_SubmitFailed = 3; //提交失败，下单失败
    OrderStatus_TimeOut = 4; //处理超时，结果未知
    OrderStatus_Submitted = 5; //已提交，等待成交
    OrderStatus_Filled_Part = 10; //部分成交
    OrderStatus_Filled_All = 11; //全部已成
    OrderStatus_Cancelling_Part = 12; //正在撤单_部分(部分已成交，正在撤销剩余部分)
    OrderStatus_Cancelling_All = 13; //正在撤单_全部
    OrderStatus_Cancelled_Part = 14; //部分成交，剩余部分已撤单
    OrderStatus_Cancelled_All = 15; //全部已撤单，无成交
    OrderStatus_Failed = 21; //下单失败，服务拒绝
    OrderStatus_Disabled = 22; //已失效
    OrderStatus_Deleted = 23; //已删除，无成交的订单才能删除
 * @typedef {number} OrderStatus
 */
/**
 * 持仓方向类型
 *
    PositionSide_Long = 0; //多仓，默认情况是多仓
    PositionSide_Unknown = -1; //未知方向
    PositionSide_Short = 1; //空仓
 * @typedef {number} PositionSide
 */
/**
 * 修改订单的操作类型，港股支持全部操作，美股目前仅支持ModifyOrderOp_Normal和ModifyOrderOp_Cancel
 *
    ModifyOrderOp_Unknown = 0; //未知操作
    ModifyOrderOp_Normal = 1; //修改订单的价格、数量等，即以前的改单
    ModifyOrderOp_Cancel = 2; //撤单
    ModifyOrderOp_Disable = 3; //失效
    ModifyOrderOp_Enable = 4; //生效
    ModifyOrderOp_Delete = 5; //删除
 * @typedef {number} ModifyOrderOp
 */
/**
 * 需要再次确认订单的原因枚举
 *
    ReconfirmOrderReason_Unknown = 0; //未知原因
    ReconfirmOrderReason_QtyTooLarge = 1; //订单数量太大，确认继续下单并否拆分成多个小订单
    ReconfirmOrderReason_PriceAbnormal = 2; //价格异常，偏离当前价太大，确认继续下单
 * @typedef {number} ReconfirmOrderReason
 */
/**
 * 交易协议公共参数头
 * @typedef {object} TrdHeader
 * @property {TrdEnv} trdEnv 交易环境, 参见TrdEnv的枚举定义
 * @property {number} accID 业务账号, 业务账号与交易环境、市场权限需要匹配，否则会返回错误
 * @property {TrdMarket} trdMarket 交易市场, 参见TrdMarket的枚举定义
 */
/**
 * 交易业务账户结构
 * @typedef {object} TrdAcc
 * @property {TrdEnv} trdEnv 交易环境, 参见TrdEnv的枚举定义
 * @property {number} accID 业务账号, 业务账号与交易环境、市场权限需要匹配，否则会返回错误
 * @property {TrdMarket} trdMarketAuthList 业务账户支持的交易市场权限，即此账户能交易那些市场, 可拥有多个交易市场权限，目前仅单个，取值参见TrdMarket的枚举定义
 */
/**
 * 账户资金结构
 * @typedef {object} Funds
 * @property {number} power 购买力，3位精度(A股2位)，下同
 * @property {number} totalAssets 资产净值
 * @property {number} cash 现金
 * @property {number} marketVal 证券市值
 * @property {number} frozenCash 冻结金额
 * @property {number} debtCash 欠款金额
 * @property {number} avlWithdrawalCash 可提金额
 */
/**
 * 账户持仓结构
 * @typedef {object} Position
 * @property {number} positionID 持仓ID，一条持仓的唯一标识
 * @property {PositionSide} positionSide 持仓方向，参见PositionSide的枚举定义
 * @property {string} code 代码
 * @property {string} name 名称
 * @property {number} qty 持有数量，2位精度，期权单位是"张"，下同
 * @property {number} canSellQty 可卖数量
 * @property {number} price 市价，3位精度(A股2位)
 * @property {number} [costPrice] 成本价，无精度限制，如果没传，代表此时此值无效
 * @property {number} val 市值，3位精度(A股2位)
 * @property {number} plVal 盈亏金额，3位精度(A股2位)
 * @property {number} [plRatio] 盈亏比例，无精度限制，如果没传，代表此时此值无效
 * @property {number} [td_plVal] 今日盈亏金额，3位精度(A股2位)，下同
 * @property {number} [td_trdVal] 今日交易额
 * @property {number} [td_buyVal] 今日买入总额
 * @property {number} [td_buyQty] 今日买入总量
 * @property {number} [td_sellVal] 今日卖出总额
 * @property {number} [td_sellQty] 今日卖出总量
 */
/**
 * 订单结构
 * @typedef {object} Order
 * @property {TrdSide} trdSide 交易方向, 参见TrdSide的枚举定义
 * @property {OrderType} orderType 订单类型, 参见OrderType的枚举定义
 * @property {OrderStatus} orderStatus 订单状态, 参见OrderStatus的枚举定义
 * @property {number} orderID 订单号
 * @property {string} orderIDEx 扩展订单号
 * @property {string} code 代码
 * @property {string} name 名称
 * @property {number} qty 订单数量，2位精度，期权单位是"张"
 * @property {number} [price] 订单价格，3位精度(A股2位)
 * @property {string} createTime 创建时间，严格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式传
 * @property {string} updateTime 最后更新时间，严格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式传
 * @property {number} [fillQty] 成交数量，2位精度，期权单位是"张"
 * @property {number} [fillAvgPrice] 成交均价，无精度限制
 * @property {string} [lastErrMsg] 最后的错误描述，如果有错误，会有此描述最后一次错误的原因，无错误为空
 */
/**
 * 成交结构
 * @typedef {object} OrderFill
 * @property {number} trdSide 交易方向, 参见TrdSide的枚举定义
 * @property {number} fillID 成交号
 * @property {string} fillIDEx 扩展成交号
 * @property {number} [orderID] 订单号
 * @property {string} [orderIDEx] 扩展订单号
 * @property {string} code 代码
 * @property {string} name 名称
 * @property {number} qty 订单数量，2位精度，期权单位是"张"
 * @property {number} price 订单价格，3位精度(A股2位)
 * @property {string} createTime 创建时间（成交时间），严格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式传
 * @property {number} [counterBrokerID] 对手经纪号，港股有效
 * @property {string} [counterBrokerName] 对手经纪名称，港股有效
 */
/**
 * 过滤条件，条件组合是"与"不是"或"，用于获取订单、成交、持仓等时二次过滤
 * @typedef {object} TrdFilterConditions
 * @property {string[]} codeList 代码过滤，只返回包含这些代码的数据，没传不过滤
 * @property {number[]} idList ID主键过滤，只返回包含这些ID的数据，没传不过滤，订单是orderID、成交是fillID、持仓是positionID
 * @property {string} [beginTime] 开始时间，严格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式传，对持仓无效，拉历史数据必须填
 * @property {string} [endTime] 结束时间，严格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式传，对持仓无效，拉历史数据必须填
 */

/**
 * 封装FutuQuant底层协议模块
 */
var FutuQuant = function () {
  /**
   * Creates an instance of FutuQuant.
   * @param {object} params 初始化参数
   * @param {string} params.ip FutuOpenD服务IP
   * @param {number} params.port FutuOpenD服务端口
   * @param {number} params.userID 牛牛号
   * @memberof FutuQuant
   */
  function FutuQuant(params) {
    _classCallCheck(this, FutuQuant);

    if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) !== 'object') throw new Error('传入参数类型错误');
    var ip = params.ip,
        port = params.port,
        userID = params.userID;

    if (!ip) throw new Error('必须指定FutuOpenD服务的ip');
    if (!port) throw new Error('必须指定FutuOpenD服务的port');
    if (!userID) throw new Error('必须指定FutuOpenD服务的牛牛号');

    /**
     * 实例化的socket对象
     * @type {Socket}
     */
    this.socket = new _socket2.default(ip, port); // 所有行情拉取接口
    /**
     * 牛牛号
     * @type {number}
     */
    this.userID = userID;
    /**
     * 是否已经初始化
     * @type {boolean}
     */
    this.inited = false;
    /**
     * 交易公共头部信息
     * @type {TrdHeader}
     */
    this.trdHeader = null;
    /**
     * 保持心跳定时器
     * @type {number}
     */
    this.timerKeepLive = null;
  }
  /**
   * InitConnect.proto协议返回对象
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


  _createClass(FutuQuant, [{
    key: 'initConnect',
    value: async function initConnect(params) {
      var _this = this;

      if (this.inited) throw new Error('请勿重复初始化连接');
      return new Promise(async function (resolve) {
        _this.inited = true;
        _this.socket.onConnect(async function () {
          var res = await _this.socket.send('InitConnect', Object.assign({
            clientVer: 101,
            clientID: 'yisbug',
            recvNotify: true
          }, params));
          // 保持心跳
          _this.connID = res.connID;
          _this.connAESKey = res.connAESKey;
          _this.keepAliveInterval = res.keepAliveInterval;
          if (_this.timerKeepLive) {
            clearInterval(_this.timerKeepLive);
            _this.timerKeepLive = null;
          }
          _this.timerKeepLive = setInterval(function () {
            return _this.keepAlive();
          }, 1000 * _this.keepAliveInterval);
          resolve(res);
        });
        await _this.socket.init();
      });
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

  }, {
    key: 'getGlobalState',
    value: function getGlobalState() {
      return this.socket.send('GetGlobalState', {
        userID: this.userID
      });
    }
    /**
     * KeepAlive.proto - 1004保活心跳
     * @returns {number} time 服务器回包时的格林威治时间戳，单位秒
     */

  }, {
    key: 'keepAlive',
    value: async function keepAlive() {
      var time = await this.socket.send('KeepAlive', {
        time: Math.round(Date.now() / 1000)
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

  }, {
    key: 'qotSub',
    value: function qotSub(params) {
      return this.socket.send('Qot_Sub', Object.assign({
        securityList: [],
        subTypeList: [],
        isSubOrUnSub: true,
        isRegOrUnRegPush: true,
        regPushRehabTypeList: [],
        isFirstPush: true
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

  }, {
    key: 'qotRegQotPush',
    value: function qotRegQotPush(params) {
      return this.socket.send('Qot_RegQotPush', Object.assign({
        securityList: [],
        subTypeList: [],
        rehabTypeList: [],
        isRegOrUnReg: true,
        isFirstPush: true
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

  }, {
    key: 'qotGetSubInfo',
    value: function qotGetSubInfo() {
      var isReqAllConn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      return this.socket.send('Qot_RegQotPush', {
        isReqAllConn: isReqAllConn
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

  }, {
    key: 'qotGetBasicQot',
    value: function qotGetBasicQot(securityList) {
      return this.socket.send('Qot_GetBasicQot', {
        securityList: securityList
      });
    }
    /**
     * 注册股票基本报价通知，需要先调用订阅接口
     * Qot_UpdateBasicQot.proto - 3005推送股票基本报价
     * @async
     * @param {function} callback  回调
     * @returns {BasicQot[]} basicQotList
     */

  }, {
    key: 'subQotUpdateBasicQot',
    value: function subQotUpdateBasicQot(callback) {
      return this.socket.subNotify(3005, function (data) {
        return callback(data.basicQotList);
      });
    }
    /**
     * Qot_GetKL.proto协议返回对象
     * @typedef QotGetKLResponse
     * @property {Security} security 股票
     * @property {KLine[]} klList k线点
     */
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
     * @returns {QotGetKLResponse}
     */

  }, {
    key: 'qotGetKL',
    value: function qotGetKL(params) {
      return this.socket.send('Qot_GetKL', Object.assign({
        rehabType: 1, // Qot_Common.RehabType,复权类型
        klType: 1, // Qot_Common.KLType,K线类型
        security: {}, // 股票
        reqNum: 60 // 请求K线根数
      }, params));
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
     * @returns {QotUpdateKLResponse}
     */

  }, {
    key: 'subQotUpdateKL',
    value: function subQotUpdateKL(callback) {
      return this.socket.subNotify(3007, callback);
    }
    /**
     * Qot_GetRT.proto协议返回对象
     * @typedef QotGetRTResponse
     * @property {Security} security 股票
     * @property {TimeShare[]} rtList 分时点
     */
    /**
     * Qot_GetRT.proto - 3008获取分时
     * @async
     * @param {Security} security 股票
     * @returns {QotGetRTResponse}
     */

  }, {
    key: 'qotGetRT',
    value: function qotGetRT(security) {
      return this.socket.send('Qot_GetRT', {
        security: security
      });
    }
    /**
     * 注册分时推送，需要先调用订阅接口
     * Qot_UpdateRT.proto - 3009推送分时
     * @async
     * @returns {QotGetRTResponse}
     */

  }, {
    key: 'subQotUpdateRT',
    value: function subQotUpdateRT(callback) {
      return this.socket.subNotify(3009, callback);
    }
    /**
     * Qot_GetTicker.proto协议返回对象
     * @typedef QotGetTickerResponse
     * @property {Security} security 股票
     * @property {Ticker[]} tickerList 逐笔
     */
    /**
     * Qot_GetTicker.proto - 3010获取逐笔
     *
      股票结构参考 Security
      逐笔结构参考 Ticker
      请求逐笔目前最多最近1000个
     * @param {Security} security 股票
     * @param {number} maxRetNum 最多返回的逐笔个数,实际返回数量不一定会返回这么多,最多返回1000个，默认100
     * @returns {QotGetTickerResponse}
     * @async
     */

  }, {
    key: 'qotGetTicker',
    value: function qotGetTicker(security) {
      var maxRetNum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

      return this.socket.send('Qot_GetTicker', {
        security: security,
        maxRetNum: maxRetNum
      });
    }
    /**
     * 注册逐笔推送，需要先调用订阅接口
     * Qot_UpdateTicker.proto - 3011推送逐笔
     * @async
     * @param {function} callback  回调
     * @returns {QotGetTickerResponse}
     */

  }, {
    key: 'subQotUpdateTicker',
    value: function subQotUpdateTicker(callback) {
      return this.socket.subNotify(3011, callback);
    }
    /**
     * Qot_GetOrderBook.proto协议返回对象
     * @typedef QotGetOrderBookResponse
     * @property {Security} security 股票
     * @property {OrderBook[]} orderBookAskList 卖盘
     * @property {OrderBook[]} orderBookBidList 买盘
     */
    /**
     * Qot_GetOrderBook.proto - 3012获取买卖盘，需要先调用订阅接口
     * @async
     * @param {Security} security 股票
     * @param {number} num 请求的摆盘个数（1-10），默认10
     * @returns {QotGetOrderBookResponse}
     */

  }, {
    key: 'qotGetOrderBook',
    value: function qotGetOrderBook(security) {
      var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      return this.socket.send('Qot_GetOrderBook', {
        security: security,
        num: num
      });
    }
    /**
     * 注册买卖盘推送，需要先调用订阅接口
     * Qot_UpdateOrderBook.proto - 3013推送买卖盘
     * @async
     * @param {function} callback 回调
     * @returns {QotGetOrderBookResponse}
     */

  }, {
    key: 'subQotUpdateOrderBook',
    value: function subQotUpdateOrderBook(callback) {
      return this.socket.subNotify(3013, callback);
    }
    /**
     * Qot_GetBroker.proto协议返回对象
     * @typedef QotGetBrokerResponse
     * @property {Security} security 股票
     * @property {Broker[]} brokerAskList 经纪Ask(卖)盘
     * @property {Broker[]} brokerBidList 经纪Bid(买)盘
     */
    /**
     * Qot_GetBroker.proto - 3014获取经纪队列
     * @async
     * @param {Security} security Object 股票
     * @returns {QotGetBrokerResponse}
     */

  }, {
    key: 'qotGetBroker',
    value: function qotGetBroker(security) {
      return this.socket.send('Qot_GetBroker', {
        security: security
      });
    }
    /**
     * 注册经纪队列推送，需要先调用订阅接口
     * Qot_UpdateBroker.proto - 3015推送经纪队列
     * @async
     * @param {function} callback 回调
     * @returns {QotGetBrokerResponse}
     */

  }, {
    key: 'subQotUpdateBroker',
    value: function subQotUpdateBroker(callback) {
      return this.socket.subNotify(3015, callback);
    }
    /**
     * Qot_GetHistoryKL.proto协议返回对象
     * @typedef QotGetHistoryKLResponse
     * @property {Security} security 股票
     * @property {KLine[]} klList K线数据
     * @property {string} nextKLTime 如请求不指定maxAckKLNum值，则不会返回该字段，该字段表示超过指定限制的下一K线时间字符串
     */
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
     * @returns {QotGetHistoryKLResponse}
     */

  }, {
    key: 'qotGetHistoryKL',
    value: function qotGetHistoryKL(params) {
      return this.socket.send('Qot_GetHistoryKL', Object.assign({
        rehabType: 1, // Qot_Common.RehabType,复权类型
        klType: 1, // Qot_Common.KLType,K线类型
        security: {}, // 股票市场以及股票代码
        beginTime: '', // 开始时间字符串
        endTime: '', // 结束时间字符串
        maxAckKLNum: 60, // 最多返回多少根K线，如果未指定表示不限制
        needKLFieldsFlag: 512 // 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
      }, params));
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
     * Qot_GetHistoryKLPoints.proto协议返回对象
     * @typedef QotGetHistoryKLPointsResponse
     * @property {SecurityHistoryKLPoints[]} klPointList 多只股票的多点历史K线点
     * @property {boolean} hasNext 如请求不指定maxReqSecurityNum值，则不会返回该字段，该字段表示请求是否还有超过指定限制的数据
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
     * @returns {QotGetHistoryKLPointsResponse}
     */

  }, {
    key: 'qotGetHistoryKLPoints',
    value: function qotGetHistoryKLPoints(params) {
      return this.socket.send('Qot_GetHistoryKLPoints', Object.assign({
        rehabType: 1, // Qot_Common.RehabType,复权类型
        klType: 1, // Qot_Common.KLType,K线类型
        noDataMode: 0, // NoDataMode,当请求时间点数据为空时，如何返回数据。0
        securityList: [], // 股票市场以及股票代码
        timeList: [], // 时间字符串
        maxReqSecurityNum: 60, // 最多返回多少只股票的数据，如果未指定表示不限制
        needKLFieldsFlag: 512 // 指定返回K线结构体特定某几项数据，KLFields枚举值或组合，如果未指定返回全部字段
      }, params));
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

  }, {
    key: 'qotGetRehab',
    value: function qotGetRehab(securityList) {
      return this.socket.send('Qot_GetRehab', {
        securityList: securityList
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
     * @param {string} beginTime 开始时间字符串
     * @param {string} endTime 结束时间字符串
     * @return {TradeDate[]} tradeDateList 交易日
     */

  }, {
    key: 'qotGetTradeDate',
    value: function qotGetTradeDate() {
      var market = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var beginTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '2018-01-01 00:00:00';
      var endTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '2018-02-01 00:00:00';

      return this.socket.send('Qot_GetTradeDate', {
        market: market,
        beginTime: beginTime,
        endTime: endTime
      });
    }
    /**
     * Qot_GetStaticInfo.proto - 3202获取股票静态信息
     * @async
     * @param {QotMarket} market Qot_Common.QotMarket,股票市场
     * @param {SecurityType} secType Qot_Common.SecurityType,股票类型
     * @returns {SecurityStaticInfo[]} staticInfoList 静态信息
     */

  }, {
    key: 'qotGetStaticInfo',
    value: function qotGetStaticInfo() {
      var market = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var secType = arguments[1];

      return this.socket.send('Qot_GetStaticInfo', {
        market: market,
        secType: secType
      });
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

  }, {
    key: 'qotGetSecuritySnapShot',
    value: function qotGetSecuritySnapShot(securityList) {
      return this.socket.send('Qot_GetSecuritySnapshot', {
        securityList: securityList
      });
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
     * @returns {PlateInfo[]} plateInfoList 板块集合下的板块信息
     */

  }, {
    key: 'qotGetPlateSet',
    value: function qotGetPlateSet() {
      var market = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var plateSetType = arguments[1];

      return this.socket.send('Qot_GetPlateSet', {
        market: market,
        plateSetType: plateSetType
      });
    }
    /**
     * Qot_GetPlateSecurity.proto - 3205获取板块下的股票
     * @async
     * @param {Security} plate 板块
     * @returns {SecurityStaticInfo[]} staticInfoList 板块下的股票静态信息
     */

  }, {
    key: 'qotGetPlateSecurity',
    value: function qotGetPlateSecurity(plate) {
      return this.socket.send('Qot_GetPlateSecurity', {
        plate: plate
      });
    }
    /**
     * Trd_GetAccList.proto - 2001获取交易账户列表
     * @async
     * @param {number} userID 需要跟FutuOpenD登陆的牛牛用户ID一致，否则会返回失败
     * @param {QotMarket} [market=1] Qot_Common.QotMarket,股票市场
     * @returns {TrdAcc[]} 交易业务账户列表
     */

  }, {
    key: 'trdGetAccList',
    value: async function trdGetAccList() {
      var userID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.userID;
      var market = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      var _ref = await this.socket.send('Trd_GetAccList', {
        userID: userID
      }),
          accList = _ref.accList;

      return accList.filter(function (acc) {
        return acc.trdMarketAuthList.includes(market);
      });
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

  }, {
    key: 'trdUnlockTrade',
    value: function trdUnlockTrade() {
      var unlock = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var pwdMD5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      return this.socket.send('Trd_UnlockTrade', {
        unlock: unlock,
        pwdMD5: pwdMD5
      });
    }
    /**
     * Trd_SubAccPush.proto - 2008订阅接收交易账户的推送数据
     * @async
     * @param {number[]} accIDList 要接收推送数据的业务账号列表，全量非增量，即使用者请每次传需要接收推送数据的所有业务账号
     */

  }, {
    key: 'trdSubAccPush',
    value: function trdSubAccPush(accIDList) {
      return this.socket.send('Trd_SubAccPush', {
        accIDList: accIDList
      });
    }
    /**
     * 设置交易模块的公共header，调用交易相关接口前必须先调用此接口。
     * @param {TrdEnv} trdEnv 交易环境, 参见TrdEnv的枚举定义。0为仿真，1为真实，默认为1。
     * @param {number} accID 业务账号, 业务账号与交易环境、市场权限需要匹配，否则会返回错误，默认为当前userID
     * @param {TrdMarket} [trdMarket=1] 交易市场, 参见TrdMarket的枚举定义，默认为1，即香港市场。
     */

  }, {
    key: 'setCommonTradeHeader',
    value: function setCommonTradeHeader(trdEnv, accID) {
      var trdMarket = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      this.trdHeader = {
        trdEnv: trdEnv,
        accID: accID,
        trdMarket: trdMarket
      };
    }
    /**
     * Trd_GetFunds.proto - 2101获取账户资金，需要先设置交易模块公共header
     * @returns {Funds}
     */

  }, {
    key: 'trdGetFunds',
    value: async function trdGetFunds() {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_GetFunds', {
        header: this.trdHeader
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

  }, {
    key: 'trdGetPositionList',
    value: async function trdGetPositionList(filterConditions, filterPLRatioMin, filterPLRatioMax) {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_GetPositionList', {
        header: this.trdHeader, // 交易公共参数头
        filterConditions: filterConditions, // 过滤条件
        filterPLRatioMin: filterPLRatioMin, // 过滤盈亏比例下限，高于此比例的会返回，如0.1，返回盈亏比例大于10%的持仓
        filterPLRatioMax: filterPLRatioMax // 过滤盈亏比例上限，低于此比例的会返回，如0.2，返回盈亏比例小于20%的持仓
      })).positionList;
    }
    /**
     * Trd_GetOrderList.proto - 2201获取订单列表
     * @async
     * @param {TrdFilterConditions} filterConditions 过滤条件
     * @param {OrderStatus[]} filterStatusList 需要过滤的订单状态列表
     * @returns {Order[]} 订单列表
     */

  }, {
    key: 'trdGetOrderList',
    value: async function trdGetOrderList(filterConditions, filterStatusList) {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_GetOrderList', {
        header: this.trdHeader, // 交易公共参数头
        filterConditions: filterConditions,
        filterStatusList: filterStatusList
      })).orderList;
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

  }, {
    key: 'trdPlaceOrder',
    value: async function trdPlaceOrder(params) {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_PlaceOrder', Object.assign({
        packetID: {
          connID: this.connID,
          serialNo: this.socket.requestId
        }, // 交易写操作防重放攻击
        header: this.trdHeader, // 交易公共参数头
        trdSide: 0, // 交易方向，1买入，2卖出
        orderType: 1, // 订单类型, 参见Trd_Common.OrderType的枚举定义
        code: '', // 代码
        qty: 0, // 数量，2位精度，期权单位是"张"
        price: 0, // 价格，3位精度(A股2位)
        // 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
        adjustPrice: false, // 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
        adjustSideAndLimit: 0 // 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
      }, params))).orderID;
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

  }, {
    key: 'trdModifyOrder',
    value: async function trdModifyOrder(params) {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_ModifyOrder', Object.assign({
        packetID: {
          connID: this.connID,
          serialNo: this.socket.requestId
        }, // 交易写操作防重放攻击
        header: this.trdHeader, // 交易公共参数头
        orderID: 0, // 订单号，forAll为true时，传0
        modifyOrderOp: 1, // //修改操作类型，参见Trd_Common.ModifyOrderOp的枚举定义
        forAll: false, // /是否对此业务账户的全部订单操作，true是，false否(对单个订单)，无此字段代表false，仅对单个订单
        qty: 0, // 数量，2位精度，期权单位是"张"
        price: 0, // 价格，3位精度(A股2位)
        // 以下为调整价格使用，目前仅对港、A股有效，因为港股有价位，A股2位精度，美股不需要
        adjustPrice: false, // 是否调整价格，如果价格不合法，是否调整到合法价位，true调整，false不调整
        adjustSideAndLimit: 0 // 调整方向和调整幅度百分比限制，正数代表向上调整，负数代表向下调整，具体值代表调整幅度限制，如：0.015代表向上调整且幅度不超过1.5%；-0.01代表向下调整且幅度不超过1%
      }, params))).orderID;
    }
    /**
     * 注册订单更新通知
     * Trd_UpdateOrder.proto - 2208推送订单更新
     * @async
     * @param {function} callback 回调
     * @returns {Order} 订单结构
     */

  }, {
    key: 'subTrdUpdateOrder',
    value: function subTrdUpdateOrder(callback) {
      return this.socket.subNotify(2208, function (data) {
        return callback(data.order);
      });
    }
    /**
     * Trd_GetOrderFillList.proto - 2211获取成交列表
     * @async
     * @param {TrdFilterConditions} filterConditions 过滤条件
     * @returns {OrderFill[]} 成交列表
     */

  }, {
    key: 'trdGetOrderFillList',
    value: async function trdGetOrderFillList(filterConditions) {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_GetOrderFillList', {
        header: this.trdHeader, // 交易公共参数头
        filterConditions: filterConditions
      })).orderFillList;
    }
    /**
     * 注册新成交通知
     * Trd_UpdateOrderFill.proto - 2218推送新成交
     * @param {function} callback 回调
     * @returns {OrderFill} 成交结构
     */

  }, {
    key: 'subTrdUpdateOrderFill',
    value: function subTrdUpdateOrderFill(callback) {
      return this.socket.subNotify(2218, function (data) {
        return callback(data.orderFill);
      });
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

  }, {
    key: 'trdGetHistoryOrderList',
    value: async function trdGetHistoryOrderList(filterConditions, filterStatusList) {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_GetHistoryOrderList', {
        header: this.trdHeader, // 交易公共参数头
        filterConditions: filterConditions,
        filterStatusList: filterStatusList
      })).orderList;
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

  }, {
    key: 'trdGetHistoryOrderFillList',
    value: async function trdGetHistoryOrderFillList(filterConditions) {
      if (!this.trdHeader) throw new Error('请先调用setCommonTradeHeader接口设置交易公共header');
      return (await this.socket.send('Trd_GetHistoryOrderFillList', {
        header: this.trdHeader, // 交易公共参数头
        filterConditions: filterConditions
      })).orderFillList;
    }
  }]);

  return FutuQuant;
}();

exports.default = FutuQuant;
module.exports = exports['default'];