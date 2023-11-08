const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandle } = require("../../helper/asyncHandler");
const { authentication } = require("../../auth/authutils");

const router = express.Router();

// signUp

router.post("/shop/signup", asyncHandle(accessController.signUp));
router.post("/shop/login", asyncHandle(accessController.login));

//authentication
router.use(authentication);
///////////////
router.post("/shop/logout", asyncHandle(accessController.logout));

module.exports = router;
