// 用 axios 去目標 API 抓資料
// await 版本
// 更好的參數設定
// 1. 自動取得今日日期 （可能利用 cron 排程工具 系統每日自動執行）
// 2. 從檔案中讀取股票代碼
// 查到股票代碼的中文名稱
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

    // 去查詢股票代碼的中文名稱
    // https://www.twse.com.tw/zh/api/codeQuery?query=2330
    let queryNameResponse = await axios.get('https://www.twse.com.tw/zh/api/codeQuery', {
      params: {
        query: stockNo,
      },
    });
    // 觀察抓回來的資料的格式，把他處理成自己要的樣子
    // console.log(queryNameResponse.data);
    let suggestions = queryNameResponse.data.suggestions;
    let suggestion = suggestions[0];
    if (suggestion === '(無符合之代碼或名稱)') {
      console.error(suggestion);
      throw new Error(suggestion);
    }
    // 觀察到股票代碼跟名稱之間是用 \t 連接，那我們就用 \t 切開(splice)，
    // 利用 pop 拿出最後一個
    // Q:資料可能是髒的，例如可能根本沒有 \t，這樣用 \t splice，就只會拿到一個長度為 1 的陣列
    // 如果是用 suggestion.split('\t')[1] 去拿，就可能會錯
    // -> 資料不總是如我們預期地符合規範
    let stockName = suggestion.split('\t').pop();
    console.log('stockName', stockName);

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
