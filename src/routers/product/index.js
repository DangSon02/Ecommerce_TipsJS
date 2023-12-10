const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandle } = require("../../helper/asyncHandler");
const { authenticationV2 } = require("../../auth/authutils");

const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandle(productController.getListSearchProduct)
);

router.get("", asyncHandle(productController.findAllProducts));
router.get("/:product_id", asyncHandle(productController.findOneProduct));

//authentication
router.use(authenticationV2);
///////////////

router.post("", asyncHandle(productController.createProduct));
router.post(
  "/publish/:id",
  asyncHandle(productController.publishProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandle(productController.unPublishProductByShop)
);

// QUERY
router.get("/drafts/all", asyncHandle(productController.getAllDraftsForShop));
router.get(
  "/published/all",
  asyncHandle(productController.getAllPublishsForShop)
);

module.exports = router;
