const mongoDb = require("mongodb");
const MongoClient = mongoDb.MongoClient;

let _db;
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://mohsinjavedpc_db:235Mohsin548@cluster0.pyfvfmp.mongodb.net/?appName=Cluster0"
  )
    .then((client) => {
      console.log("Connected to MongoDB");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

exports.getDb = getDb;

module.exports = {
  mongoConnect,
  getDb,
};
