"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandle } = require("../helper/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
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

module.exports = {
  createTokenPair,
  authentication,
};
