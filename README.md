## FutuQuant量化接口Nodejs版本

### 说明

基于 FutuQuant v3.2 底层协议封装的 nodejs 版本接口，数据格式使用 protobuf，使用前请先在本地或者服务端启动 FutuOpenD 服务。

* 使用了async/await语法，要求nodejs版本v7.10.1以上，v7.5.1以上可以使用`--harmony`或者`--harmony-async-await`参数开启async/await的支持，v7.6.x 以可以不用开启 flag 直接使用。。
* 底层协议基于FutuQuant v3.2，参考：[FutunnOpen/futuquant](https://github.com/FutunnOpen/futuquant/)。
* 数据传输格式目前只支持 protobuf。
* API文档相关：[https://yisbug.github.io/nodejs-for-FutuOpenD/doc/index.html](https://yisbug.github.io/nodejs-for-FutuOpenD/doc/index.html)

> 为了方便使用，请注意部分接口参数及返回结果和富途官方版本不完全一致，详细请参考[API文档](https://yisbug.github.io/nodejs-for-FutuOpenD/doc/index.html)。

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
/**
-  **所有行情相关协议获取数据都需要先通过（1005）协议订阅成功后才能查询**
-  **订阅的上限为500个订阅单位。一只股票的一个K线类型占2个订阅单位、分时占2个订阅单位、
-  报价占1个订阅单位、摆盘占5个订阅单位（牛熊为1）、逐笔占5个订阅单位（牛熊为1）、经纪队列占5个订阅单位（牛熊为1）。**
-  **反订阅（1006）的时间限制为１分钟，即订阅某支股票某个订阅位１分钟之后才能反订阅**
-  **30秒内不能超过20次交易请求。**
-  **建议所有行情拉取接口在同一条长连接上。推送数据在第二条长连接上。交易接口在第三条长连接上。**
 */
const fs = require('fs');
const path = require('path');
const FtQuant = require('./src/futuquant');

// 自定义日志对象
const bunyan = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');

const bunyanLogger = bunyan.createLogger({
  name: 'sys',
  streams: [{
    level: 'debug',
    type: 'raw',
    serializers: bunyanDebugStream.serializers,
    stream: bunyanDebugStream({ forceColor: true }),
  }],
});

// 从 opend 的配置文件中获取 userID，pwd
const FutuOpenDXMLPath = path.join(__dirname, '../FutuOpenD_1.01_Mac/FutuOpenD.xml');
const ftOpenDConfig = fs.readFileSync(FutuOpenDXMLPath);
const userID = ftOpenDConfig.match(/login_account>(\d*?)<\/login_account/)[1];
const pwdMd5 = ftOpenDConfig.match(/trade_pwd_md5>(.*?)<\/trade_pwd_md5/)[1];

// openD 配置
const ftConfig = {
  ip: '127.0.0.1',
  port: 11111,
  userID,
  market: 1, // 港股环境
  pwdMd5,
  env: 1, // 0为仿真，1为真实，默认为1。
};

const ft = new FtQuant(ftConfig, bunyanLogger);

const init = async () => {
  await ft.init(); // 初始化 ft 模块，包括调用initConnect、解锁交易接口、设置 TradeHeader

  let res = null;
  res = await ft.getGlobalState(); // 获取全局状态
  console.log('getGlobalState', res);

  // 获取历史成交记录，不再需要手动解锁交易密码以及调用setCommonTradeHeader
  await ft.trdGetHistoryOrderFillList({
    beginTime: '2018-01-01 00:00:00',
    endTime: '2018-02-01 00:00:00',
  });
};

init();
```

### 测试

请先修改`test/futuquant.test.js`中`FutuOpenDXMLPath`的路径，然后执行`npm install`或`yarn`安装相关依赖。

运行测试：

```
npm test
```
