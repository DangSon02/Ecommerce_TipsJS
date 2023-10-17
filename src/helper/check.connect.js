"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;
// count connect

const countConnect = () => mongoose.connections.length;

// check over load

const checkOverLoad = () => {
  setInterval(() => {
    const numberConnect = mongoose.connections.length;

    const numCores = os.cpus().length; // Kiem tra CPU

    const memoryUsage = process.memoryUsage().rss; // Memory da su dung

    const maxConnect = numCores * 5;

    console.log(`Active Connect:: ${numberConnect}`);

    console.log(`Memory Usage:: ${memoryUsage / 1024 / 1024} MB`);

    if (numberConnect > maxConnect) {
      console.log("Connection overload detected!!");
    }
  }, _SECONDS); // monitor every 5 seconds
};

module.exports = {
  countConnect,
  checkOverLoad,
};
