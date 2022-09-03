const express = require("express");
const router = express.Router();
const pool = require("../utils/db");
const bcrypt = require("bcrypt");

// /api/1.0/auth/register
router.post("/api/1.0/auth/register", async (req, res, next) => {
  //  確認資料有沒有收到
  console.log("register recieve", req.body);

  //  檢查 email 有沒有重複
  // 方法一: 在db把e-maill欄位設成 unique
  // 方法二: 自己檢查->把資料撈出來檢查有沒有存在
  let [members] = await pool.execute("SELECT * FROM members WHERE email = ? ", [
    req.body.email,
  ]);

  if (members.length === 0) {
    // 密碼要雜湊 hash 使用 bcrypt
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    // 資料存到資料庫
    let result = await pool.execute(
      "INSERT INTO members (email, password, name) VALUES (?, ?, ?);",
      [req.body.email, hashedPassword, req.body.name]
    );
    console.log("insert success", result);
    // 回覆前端
    res.json({ message: "註冊成功" });
  } else {
    // 此 email 已使用過 回覆 400 跟錯誤訊息
    return res.status(400).json({ message: "email 已被使用過囉" });
  }
});
module.exports = router;