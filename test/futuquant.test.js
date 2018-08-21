
require('should');
const path = require('path');
const fs = require('fs');
const FtQuant = require('../src/futuquant');


const FutuOpenDXMLPath = path.join(__dirname, '../../FutuOpenD_1.01_Mac/FutuOpenD.xml');
const ftOpenDConfig = fs.readFileSync(FutuOpenDXMLPath, { encoding: 'utf8' });
const userID = ftOpenDConfig.match(/login_account>(\d*?)<\/login_account/)[1];
const pwdMd5 = ftOpenDConfig.match(/trade_pwd_md5>(.*?)<\/trade_pwd_md5/)[1];

console.log('userID', userID, 'pwdMd5', pwdMd5);

const ft = new FtQuant({
  ip: '127.0.0.1',
  port: 11111,
  userID,
});

describe('FtQuant', () => {
  before(async () => {
    console.log('test start.');
    const res = await ft.initConnect();
    (typeof res.serverVer !== 'undefined').should.be.true();
    (typeof res.loginUserID !== 'undefined').should.be.true();
    (typeof res.connID !== 'undefined').should.be.true();
    (typeof res.connAESKey !== 'undefined').should.be.true();
    (typeof res.keepAliveInterval === 'number').should.be.true();
    const { accID } = (await ft.trdGetAccList())[0];
    await ft.setCommonTradeHeader(1, accID, 1); // 设置为港股的真实环境
  });
  after(async () => {
    console.log('test end.');
  });

  it('getGlobalState', async () => {
    const res = await ft.getGlobalState();
    (typeof res.marketHK !== 'undefined').should.be.true();
    (typeof res.marketUS !== 'undefined').should.be.true();
    (typeof res.marketSH !== 'undefined').should.be.true();
    (typeof res.marketSZ !== 'undefined').should.be.true();
    (typeof res.marketHKFuture !== 'undefined').should.be.true();
    (typeof res.qotLogined !== 'undefined').should.be.true();
    (typeof res.trdLogined !== 'undefined').should.be.true();
    (typeof res.serverVer !== 'undefined').should.be.true();
    (typeof res.serverBuildNo !== 'undefined').should.be.true();
    (typeof res.time !== 'undefined').should.be.true();
  });

  it('qotGetStaticInfo', async () => {
    const res = await ft.qotGetStaticInfo(1, 5); // 获取涡轮
    res.length.should.be.above(100);
  });

  it('trdUnlockTrade', async () => {
    await ft.trdUnlockTrade(true, pwdMd5);
  });

  it('qotGetTradeDate', async () => {
    const res = await ft.qotGetTradeDate();
    // console.log('qotGetTradeDate', res);
    res.tradeDateList.length.should.be.eql(23);
  });

  it('trdGetMaxTrdQtys', async () => {
    const res = await ft.trdGetMaxTrdQtys({ code: '00700' });
    (typeof res.maxCashBuy !== 'undefined').should.be.true();
  });

  it('qotGetReference', async () => {
    const res = await ft.qotGetReference({ code: '00700', market: 1 });
    // console.log('res', res.length, res[0]);
    (typeof res[0].basic !== 'undefined').should.be.true();
  });

  it('trdGetHistoryOrderList', async () => {
    const res = await ft.trdGetHistoryOrderList({
      beginTime: '2018-08-01 00:00:00',
      endTime: '2018-08-16 00:00:00',
    }, [10, 11]);
    Array.isArray(res).should.be.true();
  });

  it('qotGetRT', async () => {
    await ft.qotSub({
      securityList: [{ code: '00700', market: 1 }],
      subTypeList: [5],
    });
    const res = await ft.qotGetRT({ code: '00700', market: 1 });
    Array.isArray(res).should.be.true();
    res.length.should.be.above(0);
    const item = res[0];
    (typeof item.time !== 'undefined').should.be.true();
    (typeof item.minute !== 'undefined').should.be.true();
    (typeof item.isBlank !== 'undefined').should.be.true();
    (typeof item.price !== 'undefined').should.be.true();
    (typeof item.lastClosePrice !== 'undefined').should.be.true();
    (typeof item.avgPrice !== 'undefined').should.be.true();
    (typeof item.volume !== 'undefined').should.be.true();
    (typeof item.turnover !== 'undefined').should.be.true();
  });
});
