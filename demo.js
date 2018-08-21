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
  let res = null;
  await ft.init(); // 初始化 ft 模块
  res = await ft.getGlobalState(); // 获取全局状态
  console.log('getGlobalState', res);

  // 获取历史成交记录，不再需要手动解锁交易密码以及调用setCommonTradeHeader
  await ft.trdGetHistoryOrderFillList({
    beginTime: '2018-01-01 00:00:00',
    endTime: '2018-02-01 00:00:00',
  });
};

init();