### 0.2.0

2017.07.27

* fix: 优化自定义logger部分
* feature: 修改qotGetBasicQot方法直接返回数组
* feature: 修改qotGetOrderBook方法直接返回对象，并增加sellList和buyList两个字段，等同于orderBookAskList和orderBookBidList
* feature: 修改subQotUpdateOrderBook事件传递的摆盘结果，增加sellList和buyList两个字段，等同于orderBookAskList和orderBookBidList
* feature: 修改qotGetBroker方法返回结果，增加sellList和buyList两个字段，等同于brokerAskList和brokerBidList
* feature: 修改subQotUpdateBroker方法事件传递的经纪队列，增加sellList和buyList两个字段，等同于brokerAskList和brokerBidList
* feature: 修改qotGetStaticInfo返回结果，直接返回数组
* feature: 修改qotGetSecuritySnapShot返回结果，直接返回数组，并支持超过200支以上股票的查询。
* feature: 新增按市价下单接口：trdPlaceOrderMarket(param)，直到交易完成成功为止，返回买入/卖出总价
* feature: 新增取消注册订单更新接口：unsubTrdUpdateOrder()
* docs: 其他调整


### 0.1.3

* feature: 支持自定义日志

### 0.1.2

2017.07.20

* feature: 使用babel编译，可以直接使用require('futuquant')
* docs: 修改README.md中的示例代码
* fix: package.json中main的路径

### 0.1.1

2018.07.16

* docs: 更新完善文档；
* fix: 修复示例代码的错误。

### 0.1.0  

2018.07.16

* docs: 完善FutuQuant所有接口的文档，包括所有基础结构体的定义
* fix: 修复连包没有及时处理导致接口性能下降的bug
* fix: 修复socket断开重连后异常的bug
* fix: 加载.proto路径的bug
* feature: 调整部分接口返回结果，更方便使用

### 0.0.1  

2018.07.14

* feature: 完成对接futuquant底层协议