const path = require('path');
const express = require('express');

const rootDir = require('../utils/path');
const router = express.Router();
const adminData = require('./admin');

router.get('/', (req, res) => {
  console.log(adminData.products);
  res.render('');
});

module.exports = router;
