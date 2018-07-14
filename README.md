## futuquant的nodejs版本

基于futuquant v3.1.2，使用前需要先安装futuquant，并启动FutuOpenD服务。

依赖：

* ES6，对应nodejs版本v8.5.0以上，启动时添加参数：--experimental-modules，参考：[v8.5.0 proposal #15308](https://github.com/nodejs/node/pull/15308)
* futuquant v3.1.2，参考：[FutunnOpen/futuquant](https://github.com/FutunnOpen/futuquant/)

### 安装

```
npm install futuquant
```

### 文档

[点击查看文档](http://htmlpreview.github.io/?https://github.com/yisbug/futuquant/blob/master/doc/FutuQuant/0.0.1/index.html)

### 使用

```javascript
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
  await ft.setCommonTradeHeader(0); // 设置为港股的仿真环境
};

init();

```

### 测试

请先修改`test/futuquant.test.js`中`FutuOpenDXMLPath`的路径。

```
npm test
```

### 广告

如有需要，请填写推荐人牛牛号：5894668，谢谢！