const express = require('express');
const router = express.Router();
const path = require('path');
const app = express();

let products = [];
// /admin/add-product => GET
router.get('/add-product', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'));
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect('/shop');
});

exports.routes = router;
exports.products = products;
