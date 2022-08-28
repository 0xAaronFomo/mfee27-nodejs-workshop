const express = require ('express');
// 初始化 dotenv
require('dotenv').config()


// 利用 express 這個框架/函式庫 來建立一個 web application
const app = express();
const port = process.env.SERVER_PORT;

const cors = require('cors');
app.use(cors());


//使用資料庫
const mysql = require('mysql2');
const { response } = require('express');
let pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // 限制 pool 連線數的上限
    connectionLimit: 10,
    dateStrings: true,
}).promise()

app.get('/',(req,res) => {
    res.send('Hello Express!! 這裡是首頁')
    
})

app.get('/api/stocks',async (req,res,next) => {
    let [data] = await pool.execute('SELECT * FROM stocks')
    
    res.json(data)
})


app.get('/api/stocks/:stockId',async(req,res,next) => {
    const stockId = req.params.stockId
    let page = req.query.page || 1
    const perPage = 3
    let [total] = await pool.execute(`SELECT COUNT(*) AS total FROM stock_prices WHERE stock_id =?`,[stockId])
    total = total[0].total
    let lastPage = Math.ceil(total/perPage)
    const offset = perPage * (page-1)
    let [data] = await pool.execute('SELECT * FROM stock_prices WHERE stock_id = ? ORDER BY date LIMIT ? OFFSET ? ',[stockId,perPage,offset])


    res.json({
        pagination:{
            total,
            perPage,
            page,
            lastPage,
        },
        data,
    })
})


app.listen(port,() => {
    console.log(`server start at ${port}`)
})