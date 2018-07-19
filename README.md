## FutuQuant量化接口Nodejs版本

基于FutuQuant v3.1.2底层协议封装的nodejs版本接口，数据格式使用protobuf，使用前请先在本地或者服务端启动FutuOpenD服务。

相关说明：

* 使用了ES6 modules，对应nodejs版本v8.5.0以上，启动时添加参数：--experimental-modules，参考：[v8.5.0 proposal #15308](https://github.com/nodejs/node/pull/15308)。

```
最新版本使用了babel编译es modules为modules.exports，可以直接使用require('futuquant')，不再限制nodejs版本，也不需要使用--experimental-modules参数。
```

* 使用了async/await语法，要求nodejs版本v7.10.1以上，v7.5.1可以使用--harmony或者--harmony-async-await开启async/await的支持。
* 底层协议基于FutuQuant v3.1.2，参考：[FutunnOpen/futuquant](https://github.com/FutunnOpen/futuquant/)。
* 数据传输格式强制使用protobuf。
* **为了方便使用，请注意相关接口参数及返回结果和富途官方版本不一致，详细请参考API文档**。
* API文档相关：[https://yisbug.github.io/futuquant/doc/index.html](https://yisbug.github.io/futuquant/doc/index.html)

### 更新记录

最新版本：v0.1.2，更新日期2018.07.20，[点击查看更新日志](https://github.com/yisbug/futuquant/blob/master/CHANGELOG.md)

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

const ft = new FtQuant({
  ip: '127.0.0.1', // FutuOpenD服务IP
  port: 11111, // FutuOpenD服务端口
  userID, // 牛牛号
});

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