"use strict";
const mongoose = require("mongoose");
const { countConnect } = require("../helper/check.connect");
const {
  db: { host, port, name },
} = require("../config/config.mongodb");
const stringConnect = `mongodb://${host}:${port}/${name}`;

console.log(`ConnectingString::${stringConnect}`);

class Database {
  constructor() {
    this.connect();
  }
  // Connect

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(stringConnect, {
        maxConnecting: 50,
      })
      .then((_) =>
        console.log(`Connect Mongodb Success With ${countConnect()} Connection`)
      )
      .catch((err) => console.log("Error Connect!!", err));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceDataBase = Database.getInstance();

module.exports = instanceDataBase;
