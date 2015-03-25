"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var router = require("express").Router;

var killer = router();

exports.killer = killer;
killer.get("/killkillkill", function (req, res, next) {
  res.status(200).send("killed process");
  process.exit(0);
});

exports["default"] = killer;
//# sourceMappingURL=killer.js.map