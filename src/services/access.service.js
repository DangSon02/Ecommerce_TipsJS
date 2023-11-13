"use strict";

const shopModel = require("../models/shop.model");
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authutils");
const { getinFoData } = require("../utils/index");
const {
  BadRequestError,
  AuthFailureError,
  FobiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const { log } = require("console");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /*
     check this token used?
   */

  static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new FobiddenError("Something wrng happend !! Pls relogin");
    }
    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registeted");
    }
    // check user
    const foundShop = await findByEmail({ email });

    if (!foundShop) {
      throw new AuthFailureError("Shop not registeted");
    }

    // tao mot cap token moi
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );
    console.log("Token::", tokens);
    // update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshtoken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // da duoc su dung de lay mot token moi roi
      },
    });

    return {
      user,
      tokens,
    };
  };

  // nay bi loi
  static handlerRefreshToken = async (refreshToken) => {
    // check xem token nay da duoc xu dung chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );

    // neu co roi
    if (foundToken) {
      //decode xem thu may la thang nao
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });
      // xoa tat ca token trong keystore
      await KeyTokenService.deleteKeyById(userId);
      throw new FobiddenError("Something wrng happend !! Pls relogin");
    }

    // neu ma khong thi sao

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    if (!holderToken) {
      throw new AuthFailureError("Shop not registeted 1");
    }
    //verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("---2", { userId, email });

    // check user
    const foundShop = await findByEmail({ email });

    if (!foundShop) {
      throw new AuthFailureError("Shop not registeted 2");
    }

    // tao mot cap token moi
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshtoken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // da duoc su dung de lay mot token moi roi
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

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
