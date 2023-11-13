"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandle } = require("../helper/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accesstoken
    const accesstoken = await JWT.sign(payload, publicKey, {
      //algorithm: "RS256",
      expiresIn: "2 days",
    });

    // rereshtoken
    const refreshtoken = await JWT.sign(payload, privateKey, {
      //algorithm: "RS256",
      expiresIn: "7 days",
    });

    JWT.verify(accesstoken, publicKey, (err, decode) => {
      if (err) {
        console.error("error verify::", err);
      } else {
        console.error("Verify decode::", decode);
      }
    });

    return { accesstoken, refreshtoken };
  } catch (error) {}
};

const authentication = asyncHandle(async (req, res, next) => {
  /*
       1 - Check userId missing
       2 - get accesstoken
       3 - verifyToken
       4 - check user in dbs
       5 - check keyStore this userId
       6 - Ok all => return next   
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Invalid Request");
  }

  //2
  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("Invalid Request");
  }

  //3
  const accesstoken = req.headers[HEADER.AUTHORIZATION];
  if (!accesstoken) {
    throw new AuthFailureError("Invalid Request");
  }

  try {
    const decodeUser = JWT.verify(accesstoken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid UserId");
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const authenticationV2 = asyncHandle(async (req, res, next) => {
  /*
       1 - Check userId missing
       2 - get accesstoken
       3 - verifyToken
       4 - check user in dbs
       5 - check keyStore this userId
       6 - Ok all => return next   
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Invalid Request");
  }

  //2
  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("Not found keyStore");
  }

  //3
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError("Invalid UserId");
      }
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accesstoken = req.headers[HEADER.AUTHORIZATION];
  if (!accesstoken) {
    throw new AuthFailureError("Invalid Request");
  }

  try {
    const decodeUser = JWT.verify(accesstoken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid UserId");
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  const x = JWT.verify(token, keySecret);

  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authenticationV2,
  verifyJWT,
};
