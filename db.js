var mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.LOCAL_URL; //local monoDb
// const mongoURL = process.env.MONGODB_URL;  //Global Database
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

var conn = mongoose.connection;
conn.on("connected", function () {
  console.log("database is connected successfully");
});
conn.on("disconnected", function () {
  console.log("database is disconnected successfully");
});
conn.on("error", console.error.bind(console, "connection error:"));
module.exports = conn;

//mongo pass = Saurav@123 but @ = %23
