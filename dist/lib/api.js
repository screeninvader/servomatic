"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var router = require("express").Router;

var get = require("http").get;

var api = router();

exports.api = api;
var debugLogging = true,
    lastRequestFinished = true,
    lastUrl;

function debugLog(str) {
  if (debugLogging) {
    console.log(str);
  }
}

api.use(function (req, res, next) {
  var url = "http://127.0.0.1:8080" + req.originalUrl;
  debugLog("loading url: " + url);

  get(url, function (result) {
    debugLog("slackomatic get res " + result.statusCode);
    res.status(200).send("Slackomatic get request <span color=\"green\">succeeded</span>: redirected request to backend url " + url);
  }).on("error", function (e) {
    debugLog("Got error: " + e.errno);
    res.status(500).send("Slackomatic <span color=\"red\">" + e.errno + " errored</span>: " + e.message);
  });
});

exports["default"] = api;
//# sourceMappingURL=api.js.map