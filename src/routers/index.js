const express = require("express");
const app = require("../app");

const router = express.Router();

router.use("/v1/api", require("./access"));

// router.get("", (req, res, next) => {
//   return res.status(200).json({
//     message: "Ok Roi Do",
//   });
// });

module.exports = router;
