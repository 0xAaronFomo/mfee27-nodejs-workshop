const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.SERVER_PORT;

app.get('/', (req, res) => {
  res.send('Hello Express');
});

app.listen(port, () => {
  console.log(`server start at ${port}`);
});
