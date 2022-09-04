const express = require("express");
const router = express.Router();
const pool = require("../utils/db");
const bcrypt = require("bcrypt");
const { body, validationResult } = require('express-validator');
const registerRules = [
  body('email').isEmail().withMessage('Email 欄位請填寫正確格式'),
  body('password').isLength({ min: 8 }).withMessage('密碼長度至少為8'),
  body('confirmPassword')
    .custom((value, { req }) => {
      console.log('{req}', { req });
      return value === req.body.password;
    })
    .withMessage('密碼驗證不一致'),
];

const authRules = [
  body('email').isEmail().withMessage('登入登入登入登入登入Email 欄位請填寫正確格式'),
  body('password').isLength({ min: 8 }).withMessage('登入登入登入登入登入密碼長度至少為 8'),
];
const path = require('path');

// npm i multer
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },

  // 記得設定圖片名稱
  filename: function (req, file, cb) {
    // 要把使用者上傳的檔案名稱改掉－＞避免重複／名字過長等等的狀況
    console.log('file', file);
    const ext = file.originalname.split('.').pop();
    cb(null, `member-${Date.now()}.${ext}`);
  },
});

const uploader = multer({
  storage: storage,
  // 過濾圖片
  fileFilter: function (req, file, cb) {
    if ((file.mimetype !== 'image/jpeg') & (file.mimetype !== 'image/jpg') && file.mimetype !== 'image/png') {
      cb(new Error('上傳的檔案型態不接受'), false);
    } else {
      cb(null, true);
    }
  },
  // 過濾檔案的大小
  limits: {
    // 1k = 1024  -> 200k = 200 *1024
    fileSize: 200 * 1024,
  },
});

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

let hashedPassword = await bcrypt.hash(req.body.password, 10);
  let filename = req.file ? '/uploads/' + req.file.filename : '';
  let result = await pool.execute('INSERT INTO members (email, password,name,photo)VALUES (?,?,?,?)', [req.body.email, hashedPassword, req.body.name, filename]);
  console.log('insert new member', result);
  // 回覆前端
  res.json({ message: 'OK' });
});

router.post('/api/1.0/auth/login', authRules, async (req, res, next) => {
  console.log('login', req.body);
  const authValidateResult = validationResult(req);
  console.log('登入authValidateResult', authValidateResult);
  if (!authValidateResult.isEmpty()) {
    return res.status(400).json({ error: authvalidateResult.array() });
  }
  // 確認這個email有沒有註冊過
  let [members] = await pool.execute('SELECT * FROM members WHERE email = ?', [req.body.email]);
  if (members.length == 0) {
    return res.status(402).json({ message: '登入的帳號或密碼錯誤' });
  }
  let member = members[0];
  // 比較密碼有無一致
  let compareResult = await bcrypt.compare(req.body.password, member.password);
  if (!compareResult) {
    // 如果密碼不對，就回覆 401
    return res.status(401).json({ message: '帳號或密碼錯誤' });
  }
  res.json({});
});



module.exports = router;