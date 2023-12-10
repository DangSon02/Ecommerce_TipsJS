"use strict";

const _ = require("lodash");

const getinFoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};

// ['a', 'b'] => {a:0, b: 0}
const getUnSelect = (select = []) => {
  const unSelect = {};
  select.map((el) => {
    unSelect[el] = 0;
  });
  return unSelect;
};

module.exports = {
  getinFoData,
  getUnSelect,
};
