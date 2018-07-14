export default {
  InitConnect: 1001, // 初始化连接
  GetGlobalState: 1002, // 获取全局状态
  Notify: 1003, // 通知推送
  KeepAlive: 1004, // 通知推送

  Trd_GetAccList: 2001, // 获取业务账户列表
  Trd_UnlockTrade: 2005, // 解锁或锁定交易
  Trd_SubAccPush: 2008, // 订阅业务账户的交易推送数据

  Trd_GetFunds: 2101, // 获取账户资金
  Trd_GetPositionList: 2102, // 获取账户持仓

  Trd_GetOrderList: 2201, // 获取订单列表
  Trd_PlaceOrder: 2202, // 下单
  Trd_ModifyOrder: 2205, // 修改订单
  Trd_UpdateOrder: 2208, // 订单状态变动通知(推送)

  Trd_GetOrderFillList: 2211, // 获取成交列表
  Trd_UpdateOrderFill: 2218, // 成交通知(推送)

  Trd_GetHistoryOrderList: 2221, // 获取历史订单列表
  Trd_GetHistoryOrderFillList: 2222, // 获取历史成交列表

  // 订阅数据
  Qot_Sub: 3001, // 订阅或者反订阅
  Qot_RegQotPush: 3002, // 注册推送
  Qot_GetSubInfo: 3003, // 获取订阅信息
  Qot_GetBasicQot: 3004, // 获取股票基本行情
  Qot_UpdateBasicQot: 3005, // 推送股票基本行情
  Qot_GetKL: 3006, // 获取K线
  Qot_UpdateKL: 3007, // 推送K线
  Qot_GetRT: 3008, // 获取分时
  Qot_UpdateRT: 3009, // 推送分时
  Qot_GetTicker: 3010, // 获取逐笔
  Qot_UpdateTicker: 3011, // 推送逐笔
  Qot_GetOrderBook: 3012, // 获取买卖盘
  Qot_UpdateOrderBook: 3013, // 推送买卖盘
  Qot_GetBroker: 3014, // 获取经纪队列
  Qot_UpdateBroker: 3015, // 推送经纪队列

  // 历史数据
  Qot_GetHistoryKL: 3100, // 获取历史K线
  Qot_GetHistoryKLPoints: 3101, // 获取多只股票历史单点K线
  Qot_GetRehab: 3102, // 获取复权信息

  // 其他行情数据
  Qot_GetTradeDate: 3200, // 获取市场交易日
  Qot_GetSuspend: 3201, // 获取股票停牌信息
  Qot_GetStaticInfo: 3202, // 获取股票列表
  Qot_GetSecuritySnapshot: 3203, // 获取股票快照
  Qot_GetPlateSet: 3204, // 获取板块集合下的板块
  Qot_GetPlateSecurity: 3205, // 获取板块下的股票
};
