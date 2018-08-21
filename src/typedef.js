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
 * 最大交易数量
 * @description 因目前服务器实现的问题，卖空需要先卖掉持仓才能再卖空，是分开两步卖的，买回来同样是逆向两步；而看多的买是可以现金加融资一起一步买的，请注意这个差异
 * @typedef {object} MaxTrdQtys
 * @property {number} maxCashBuy 不使用融资，仅自己的现金最大可买整手股数
 * @property {number} [maxCashAndMarginBuy] 使用融资，自己的现金 + 融资资金总共的最大可买整手股数
 * @property {number} maxPositionSell 不使用融券(卖空)，仅自己的持仓最大可卖整手股数
 * @property {number} [maxSellShort] 使用融券(卖空)，最大可卖空整手股数，不包括多仓
 * @property {number} [maxBuyBack] 卖空后，需要买回的最大整手股数。因为卖空后，必须先买回已卖空的股数，还掉股票，才能再继续买多。
 */
/**
 * 过滤条件，条件组合是"与"不是"或"，用于获取订单、成交、持仓等时二次过滤
 * @typedef {object} TrdFilterConditions
 * @property {string[]} codeList 代码过滤，只返回包含这些代码的数据，没传不过滤
 * @property {number[]} idList ID主键过滤，只返回包含这些ID的数据，没传不过滤，订单是orderID、成交是fillID、持仓是positionID
 * @property {string} [beginTime] 开始时间，严格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式传，对持仓无效，拉历史数据必须填
 * @property {string} [endTime] 结束时间，严格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式传，对持仓无效，拉历史数据必须填
 */
