#### 3.2.0 - 2018-8-15

* opt: 修改版本号和官方 futuquant 的大版本号一致，即前两位3.2和官方保持一致，小版本号的更新用于bugfix 和其他的接口调整。
* opt: 彻底去除 es6 modules，不再需要 babel 编译。
* feat: 同步更新到官方最新版本 v3.2 。
* feat: 增加 qotGetReference 获取正股相关股票接口。
* feat: 增加 trdGetMaxTrdQtys 获取最大交易数量接口。
* fix: 获取 k 线相关接口返回的数组增加兼容性支持。
* feat: qotGetHistoryKLPoints 接口返回参数调整为直接返回数组。
* feat: qotGetTicker 接口返回参数调整为直接返回数组。
* feat: qotGetRT 接口返回参数调整为直接返回数组。
* docs: 相关文档更新。

#### 0.2.0 - 2018.07.27

* fix: 优化自定义logger部分
* feat: 修改qotGetBasicQot方法直接返回数组
* feat: 修改qotGetOrderBook方法直接返回对象，并增加sellList和buyList两个字段，等同于orderBookAskList和orderBookBidList
* feat: 修改subQotUpdateOrderBook事件传递的摆盘结果，增加sellList和buyList两个字段，等同于orderBookAskList和orderBookBidList
* feat: 修改qotGetBroker方法返回结果，增加sellList和buyList两个字段，等同于brokerAskList和brokerBidList
* feat: 修改subQotUpdateBroker方法事件传递的经纪队列，增加sellList和buyList两个字段，等同于brokerAskList和brokerBidList
* feat: 修改qotGetStaticInfo返回结果，直接返回数组
* feat: 修改qotGetSecuritySnapShot返回结果，直接返回数组，并支持超过200支以上股票的查询。
* feat: 新增按市价下单接口：trdPlaceOrderMarket(param)，直到交易完成成功为止，返回买入/卖出总价
* feat: 新增取消注册订单更新接口：unsubTrdUpdateOrder()
* docs: 其他调整


### 0.1.3

* feat: 支持自定义日志

### 0.1.2

2017.07.20

* feat: 使用babel编译，可以直接使用require('futuquant')
* docs: 修改README.md中的示例代码
* fix: package.json中main的路径

### 0.1.1 - 2018-07-16

* docs: 更新完善文档；
* fix: 修复示例代码的错误。

### 0.1.0  - 2018-07-16

* docs: 完善FutuQuant所有接口的文档，包括所有基础结构体的定义
* fix: 修复连包没有及时处理导致接口性能下降的bug
* fix: 修复socket断开重连后异常的bug
* fix: 加载.proto路径的bug
* feat: 调整部分接口返回结果，更方便使用

### 0.0.1 - 2018-07-14

* feat: 完成对接futuquant底层协议