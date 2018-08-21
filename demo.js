const FtQuant = require('./src/futuquant');
const fs = require('fs');
const path = require('path');
const bunyan = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');

const FutuOpenDXMLPath = path.join(__dirname, '../FutuOpenD_1.01_Mac/FutuOpenD.xml');
const ftOpenDConfig = fs.readFileSync(FutuOpenDXMLPath);

// 从 opend 的配置文件中获取 userID，pwd
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
  const { accID } = (await ft.trdGetAccList())[0];
  await ft.setCommonTradeHeader(1, accID, 1); // 设置为港股的真实环境
};

init();