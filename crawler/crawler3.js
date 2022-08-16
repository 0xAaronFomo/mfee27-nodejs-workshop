// 用 axios 去目標 API 抓資料
// await 版本
// 更好的參數設定
// 1. 自動取得今日日期 （可能利用 cron 排程工具 系統每日自動執行）
// 2. 從檔案中讀取股票代碼
const axios = require('axios');
const moment = require('moment');
const fs = require('fs/promises');

// 開始抓資料
// 2330 台積電
// 2603 長榮
// axios.get(url, 設定)
(async () => {
  try {
    // 需要從 stock.txt 的檔案裡讀取股票代碼
    let stockNo = await fs.readFile('stock.txt', 'utf-8'); // 2603
    let queryDate = moment().format('YYYYMMDD'); //'20220814';
    let response = await axios.get(`https://www.twse.com.tw/exchangeReport/STOCK_DAY`, {
      params: {
        response: 'json',
        date: queryDate,
        stockNo: stockNo,
      },
    });
    console.log(response.data);
  } catch (e) {
    console.error(e);
  }
})();
