#!/usr/local/bin/node
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var minimist = _interopRequire(require("minimist"));

var Servomatic = _interopRequire(require("./servomatic"));

var join = require("path").join;

var _magicTypes = require("magic-types");

var isStr = _magicTypes.isS;
var isNum = _magicTypes.isN;

var merge = require("magic-merge").merge;

var existsSync = require("fs").existsSync;

var argv = minimist(process.argv.slice(2)),
    cwd = process.cwd(),
    env = "production",
    opts = {
  port: 1337
};

if (argv.dir && isStr(argv.dir)) {
  var wd = argv.dir;
  if (argv.dir.indexOf("/") !== 0) {
    wd = join(cwd, argv.dir);
  }

  if (existsSync(wd)) {
    opts.dir = wd;
  }
}

if (argv.env && isStr(argv.env)) {
  opts.env = argv.env;
}

if (argv.port && isNum(argv.port)) {
  opts.port = argv.port;
}

if (argv.logDir && isStr(argv.logDir)) {
  if (existsSync(argv.logDir)) {
    opts.logDir = argv.logDir;
  }
}

opts = merge(argv, opts);

var servomatic = new Servomatic(opts);
servomatic.start();
