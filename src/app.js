require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const { checkOverLoad } = require("./helper/check.connect");

const app = express();

// init middleware

app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init db
require("./dbs/init.mongodb");
//checkOverLoad();
// init rouer

// handling error

module.exports = app;
