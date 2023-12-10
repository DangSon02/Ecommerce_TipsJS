"use strict";

const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishsForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findOneProduct,
} = require("../models/repositories/product.repo");

// define Factory class to create product

class ProductFactory {
  static productRegistry = {}; // key-class

  static registryProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
      throw new BadRequestError(`Invalid Product Types ${type}`);
    }
    return new productClass(payload).createProduct();
  }

  // PUT: publishProdct

  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  // END PUT

  // query
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishsForShop({ query, limit, skip });
  }

  static async getListsearchProduct(keySearch) {
    return await searchProductByUser(keySearch);
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      filter,
      page,
      select: ["product_name", "product_price", "product_thumb"],
    });
  }

  static async findOneProduct({ product_id }) {
    return await findOneProduct({
      product_id,
      unSelect: ["__v", "product_variations"],
    });
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  // create new product
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

// Define sub-class for different product types clothing

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestError("create new Clothing error");
    }

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestError("create new Product error");
    }
    return newProduct;
  }
}

// Define sub-class for different product types electronics

class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) {
      throw new BadRequestError("create new Electronics error");
    }

    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) {
      throw new BadRequestError("create new Product error");
    }
    return newProduct;
  }
}

// Define sub-class for different product types furniture

class Furniture extends Product {
  async createProduct() {
    const newFurnitures = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurnitures) {
      throw new BadRequestError("create new Furnitures error");
    }

    const newProduct = await super.createProduct(newFurnitures._id);
    if (!newProduct) {
      throw new BadRequestError("create new Product error");
    }
    return newProduct;
  }
}

// register product types

ProductFactory.registryProductType("Electronics", Electronics);
ProductFactory.registryProductType("Clothing", Clothing);
ProductFactory.registryProductType("Furniture", Furniture);

module.exports = ProductFactory;
