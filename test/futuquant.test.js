
import 'should';
import path from 'path';
import fs from 'fs';
import FtQuant from '../src/futuquant';


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
    const res = await ft.initConnect();
    console.log('initConnect', res);
  });

  it('getGlobalState', async () => {
    const res = await ft.getGlobalState();
    console.log('getGlobalState', res);
    (typeof res.marketHK !== 'undefined').should.be.true();
  });

  it('qotGetStaticInfo', async () => {
    const res = await ft.qotGetStaticInfo(1, 5); // 获取涡轮
    res.length.should.be.above(100);
  });

  it('trdUnlockTrade', async () => {
    const res = await ft.trdUnlockTrade(true, pwdMd5);
    console.log('trdUnlockTrade', res);
  });

  it('qotGetTradeDate', async () => {
    const res = await ft.qotGetTradeDate();
    // console.log('qotGetTradeDate', res);
    res.tradeDateList.length.should.be.eql(23);
  });
});
