"use strict";

const mongoose = require("mongoose");

const stringConnect = `mongodb://127.0.0.1:27017/shopDEV`;

mongoose
  .connect(stringConnect)
  .then((_) => console.log("Connect Mongodb Success"))
  .catch((err) => console.log("Error Connect!!", err));

//dev

if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
