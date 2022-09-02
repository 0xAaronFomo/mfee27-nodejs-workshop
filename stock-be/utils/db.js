require("dotenv").config();
// solution 1
const mysql = require("mysql2");

let pool = mysql
  // 建立一個pool
  .createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // 設定pool連線上限
    connectionLimit: 10,
  })
  .promise();

module.exports = pool;
