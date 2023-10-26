"use strict";

const _ = require("lodash");

const getinFoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};

module.exports = {
  getinFoData,
};
