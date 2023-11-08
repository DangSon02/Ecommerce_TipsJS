"use strict";

const {
  CreatedResponse,
  OKResponse,
  Response,
} = require("../core/sucess.response");
const AccessService = require("../services/access.service");

class AccessController {
  logout = async (req, res, next) => {
    new Response({
      message: "Logout success",
      data: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new Response({
      data: await AccessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    console.log(`[P]::signUp::`, req.body);

    /*
         200 OK
         201 CREATE
       */
    new CreatedResponse({
      message: "Regiserted OK!",
      data: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new AccessController();
