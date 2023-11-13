const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandle } = require("../../helper/asyncHandler");
const { authentication, authenticationV2 } = require("../../auth/authutils");

const router = express.Router();

// signUp

router.post("/shop/signup", asyncHandle(accessController.signUp));
router.post("/shop/login", asyncHandle(accessController.login));

//authentication
router.use(authenticationV2);
///////////////
router.post("/shop/logout", asyncHandle(accessController.logout));
router.post(
  "/shop/handlerRefreshToken",
  asyncHandle(accessController.handlerRefreshToken)
);

module.exports = router;
