const express = require('express');
require('dotenv').config();
const app = express();

const port = process.env.SERVER_PORT;

const cors = require('cors');
app.use(cors());

// 使用資料庫
const mysql = require('mysql2');
let pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
  })
  .promise();

app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/ssr', (req, res, next) => {
  res.render('index', {
    stocks: ['台積電', '長榮航', '聯發科'],
  });
});

// 一般的 middleware
app.use((req, res, next) => {
  console.log('這是中間件 A');
  let now = new Date();
  console.log(`有人來訪問喔 at ${now.toISOString()}`);
  // 一定要寫，讓 express 知道要跳去下一個中間件
  next();
});

app.use((req, res, next) => {
  console.log('這是中間件 C');
  // 一定要寫，讓 express 知道要跳去下一個中間件
  next();
});

// 路由中間件
app.get('/', (req, res, next) => {
  console.log('這裡是首頁');
  res.send('Hello Express');
});
app.get('/test', (req, res, next) => {
  console.log('這裡是 test 1');
  res.send('Hello Test 1');
});

// API
// 列出所有股票代碼
app.get('/api/1.0/stocks', async (req, res, next) => {
  let [data] = await pool.execute('SELECT * FROM stocks');

  res.json(data);
});

app.use((req, res, next) => {
  console.log('在所有路由中間件的下面 -> 404 了！');
  res.status(404).send('Not Found!!');
});

app.listen(port, () => {
  console.log(`server start at ${port}`);
});
