const mySql2 = require("mysql2");

const pool = mySql2.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "node-complete",
});

module.exports = pool.promise();
