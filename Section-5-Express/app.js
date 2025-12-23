const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const adminData = require('./routes/admin');
const shopRoute = require('./routes/shop');
const path = require('path');
const rootDir = require('./utils/path');

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.redirect('/shop');
});

app.set('view engine', 'pug');
app.set('views', 'views');

app.use('/shop', shopRoute);
app.use('/admin', adminData.routes);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});

app.listen(8000);
