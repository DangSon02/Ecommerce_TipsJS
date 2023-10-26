"use strict";

const JWT = require("jsonwebtoken");

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
        console.log("Verify decode::", decode);
      }
    });

    return { accesstoken, refreshtoken };
  } catch (error) {}
};

module.exports = {
  createTokenPair,
};
