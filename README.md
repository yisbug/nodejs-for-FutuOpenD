## FutuQuant量化接口Nodejs版本

基于FutuQuant v3.1.2底层协议封装的nodejs版本接口，数据格式使用protobuf，使用前请先在本地或者服务端启动FutuOpenD服务。

相关说明：

* ~~使用了ES6 modules，对应nodejs版本v8.5.0以上，启动时添加参数：`--experimental-modules`，参考：[v8.5.0 proposal #15308](https://github.com/nodejs/node/pull/15308)。~~

* 最新版本使用了babel编译，可以直接使用`require('futuquant')`或者`import FtQuant from 'futuquant'`语法。

* 使用了async/await语法，要求nodejs版本v7.10.1以上，v7.5.1可以使用`--harmony`或者`--harmony-async-await`参数开启async/await的支持。
* 底层协议基于FutuQuant v3.1.2，参考：[FutunnOpen/futuquant](https://github.com/FutunnOpen/futuquant/)。
* 数据传输格式只支持protobuf。
* API文档相关：[https://yisbug.github.io/futuquant/doc/index.html](https://yisbug.github.io/futuquant/doc/index.html)

> 为了方便使用，请注意部分接口参数及返回结果和富途官方版本不完全一致，详细请参考[API文档](https://yisbug.github.io/futuquant/doc/index.html)。

### 更新

#### 0.2.0

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

更多请[点击查看更新日志](https://github.com/yisbug/futuquant/blob/master/CHANGELOG.md)

### 安装

``` 
npm install futuquant --save
```

或者

``` 
yarn add futuquant
```

### 使用

``` javascript
const FtQuant = require('./src/futuquant');
const fs = require('fs');
const bunyan = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');
const path = require('path');

const FILENAME = typeof __filename !== 'undefined' ? __filename : (/^ +at (?:file:\/*(?=\/)|)(.*?):\d+:\d+$/m.exec(Error().stack) || '')[1];
const DIRARR = FILENAME.split('/');
DIRARR.pop();
const DIRNAME = typeof __dirname !== 'undefined' ? __dirname : DIRARR.join('/');

const FutuOpenDXMLPath = path.join(DIRNAME, '../FutuOpenD_1.01_Mac/FutuOpenD.xml');
const ftOpenDConfig = fs.readFileSync(FutuOpenDXMLPath, {
  encoding: 'utf8'
});
const userID = ftOpenDConfig.match(/login_account>(\d*?)<\/login_account/)[1];
const pwdMd5 = ftOpenDConfig.match(/trade_pwd_md5>(.*?)<\/trade_pwd_md5/)[1];

// 自定义日志对象
const bunyanLogger = bunyan.createLogger({
  name: 'sys',
  streams: [{
    level: 'debug',
    type: 'raw',
    serializers: bunyanDebugStream.serializers,
    stream: bunyanDebugStream({ forceColor: true }),
  }],
});

const ft = new FtQuant({
  ip: '127.0.0.1', // FutuOpenD服务IP
  port: 11111, // FutuOpenD服务端口
  userID, // 牛牛号
}, bunyanLogger);

const init = async () => {
  let res = null;
  res = await ft.initConnect(); // 初始化连接
  console.log('initConnect', res);
  res = await ft.getGlobalState(); // 获取全局状态
  console.log('getGlobalState', res);
  await ft.trdUnlockTrade(true, pwdMd5); // 解锁交易密码
  const accID = (await ft.trdGetAccList())[0].accID;
  await ft.setCommonTradeHeader(1, accID, 1); // 设置为港股的真实环境
};

init();

```

### 测试

请先修改`test/futuquant.test.js`中`FutuOpenDXMLPath`的路径，然后执行`npm install`或`yarn`安装相关依赖。

运行测试：

```
npm test
```

### 广告

如有需要，请填写推荐人牛牛号：5894668，谢谢！