"use strict";

const { Response } = require("../core/sucess.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
  createProduct = async (req, res, next) => {
    new Response({
      message: "Create new Product success!!",
      data: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new Response({
      message: "publishProductByShop success!!",
      data: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new Response({
      message: "unPublishProductByShop success!!",
      data: await ProductServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // QUERY
  /**
   * @description: get all drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */

  getAllDraftsForShop = async (req, res, next) => {
    new Response({
      message: "Get list all Draft success!!",
      data: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishsForShop = async (req, res, next) => {
    new Response({
      message: "Get list all Publish success!!",
      data: await ProductServiceV2.findAllPublishsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  // search product
  getListSearchProduct = async (req, res, next) => {
    new Response({
      message: "Get list search Product success!!",
      data: await ProductServiceV2.getListsearchProduct(req.params.keySearch),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new Response({
      message: "Get list find all Product success!!",
      data: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };

  findOneProduct = async (req, res, next) => {
    new Response({
      message: "Get list find one Product success!!",
      data: await ProductServiceV2.findOneProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
  // END QUERY
}

module.exports = new ProductController();
