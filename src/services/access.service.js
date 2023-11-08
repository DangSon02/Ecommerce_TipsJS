"use strict";

const shopModel = require("../models/shop.model");
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authutils");
const { getinFoData } = require("../utils/index");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const { log } = require("console");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static logout = async (keyStore) => {
    return await KeyTokenService.removeKeyById(keyStore._id);
  };

  static login = async ({ email, password, refreshToken = null }) => {
    /*
   1 - check email in db
   2 - match password
   3 - create AT vs RT and save
   4 - generate token
   5 - get data  return login
  */

    // 1 - check email in db
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered");
    }

    // 2 - match password
    const match = bycrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication error");
    }

    // 3 - create AT vs RT and save
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4 - generate token
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshtoken,
      privateKey,
      publicKey,
      userId,
    });

    return {
      shop: getinFoData({
        fileds: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // step 1: check email exists?
    // lean giup query rat la nhanh

    const hoderShop = await shopModel.findOne({ email }).lean();

    if (hoderShop) {
      throw new BadRequestError("Shop already registered");
    }

    const passwordHash = await bycrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      role: [RoleShop.SHOP],
    });

    if (newShop) {
      // create privateKey , publicKey
      // privatekey đưa cho người dùng không lưu ở hệ thống và nó có tác dụng size token
      // publickey thì được lưu ở hệ thống và có tác dụng verify token
      // Cái này bự lắm để dùng cho google hay amazon thôi {
      /*const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },

          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });
          */
      // }

      // cách triển khai bình thường:

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); // save collection KeyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        new BadRequestError("keyStore error");
      }
      // console.log("publickeyString::", publicKeyString);
      // const publicKeyOject = crypto.createPublicKey(publicKeyString);

      // create token pair

      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      console.log("Create Token Success::", tokens);

      return {
        //code: 201,
        metaData: {
          shop: getinFoData({
            fileds: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metaData: null,
    };
  };
}

module.exports = AccessService;
