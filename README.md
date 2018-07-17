## FutuQuant量化接口Nodejs版本

基于FutuQuant v3.1.2底层协议封装的nodejs版本接口，数据格式使用protobuf，使用前请先在本地或者服务端启动FutuOpenD服务。

相关说明：

* 使用了ES6 modules，对应nodejs版本v8.5.0以上，启动时添加参数：--experimental-modules，参考：[v8.5.0 proposal #15308](https://github.com/nodejs/node/pull/15308)。
* 底层协议基于FutuQuant v3.1.2，参考：[FutunnOpen/futuquant](https://github.com/FutunnOpen/futuquant/)。
* 数据传输格式强制使用protobuf。
* **为了方便使用，请注意相关接口参数及返回结果和富途官方版本不一致，详细请参考API文档**。
* API文档相关：[https://yisbug.github.io/futuquant/doc/index.html](https://yisbug.github.io/futuquant/doc/index.html)

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
import FtQuant from 'futuquant';

const ft = new FtQuant({
  ip: '127.0.0.1', // FutuOpenD服务IP
  port: 11111, // FutuOpenD服务端口
  userID: '5894668', // 牛牛号
});

const init = async () => {
  let res = null;
  res = await ft.initConnect(); // 初始化连接
  console.log('initConnect', res);
  res = await ft.getGlobalState(); // 获取全局状态
  console.log('getGlobalState', res);
  await ft.trdUnlockTrade(true, 'md5'); // 解锁交易密码
  const accID = (await this.ft.trdGetAccList())[0].accID;
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