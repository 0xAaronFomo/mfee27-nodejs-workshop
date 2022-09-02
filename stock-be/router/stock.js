// router: mini app
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// API - 列出所有股票 GET /stocks
router.get('/', async (req, res) => {
  // let result = await pool.execute('SELECT * FROM stocks');
  let [data] = await pool.execute('SELECT * FROM stocks');
  console.log(data);
  // res.json(['台積電', '聯發科', '長榮航']);
  res.json(data);
});

// API - 列出特定股票的成交資訊
router.get('/:stockId', async (req, res) => {
  let id = req.params.stockId;

  // 透過query string 取得目前要第幾頁的資料
  let page = req.query.page || 1;
  let perPage = 5;
  // get Total Page
  let [total] = await pool.query('SELECT COUNT(*) AS total FROM stock_prices WHERE stock_id = ?', [id]);
  total = total[0].total;
  // 計算總頁數
  let lastPage = Math.ceil(total / perPage);

  // 計算 offset
  let offset = perPage * (page - 1);

  let [data] = await pool.query('SELECT * FROM stock_prices WHERE stock_id = ? ORDER BY date LIMIT ? OFFSET ?', [id, perPage, offset]);
  res.json({
    pagination: {
      total,
      page,
      perPage,
      lastPage,
    },
    data,
  });
});

module.exports = router;