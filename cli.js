#!/usr/local/bin/node
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var minimist = _interopRequire(require("minimist"));

var Servomatic = _interopRequire(require("./servomatic"));

var _path = require("path");

var join = _path.join;
var resolve = _path.resolve;
var normalize = _path.normalize;

var _magicTypes = require("magic-types");

var isStr = _magicTypes.isS;
var isNum = _magicTypes.isN;

var merge = require("magic-merge").merge;

var existsSync = require("fs").existsSync;

var argv = minimist(process.argv.slice(2)),
    cwd = process.cwd(),
    env = "production",
    opts = {
  port: 1337,
  dir: join(cwd, "dist"),
  logDir: join("/var", "log", "servomatic")
};

if (argv.dir && isStr(argv.dir)) {
  opts.dir = findFilePath("dir", argv.dir);
}

if (argv.env && isStr(argv.env)) {
  opts.env = argv.env;
}

if (argv.port && isNum(argv.port)) {
  opts.port = argv.port;
}

if (argv.logDir && isStr(argv.logDir)) {
  opts.logDir = findFilePath("logDir", argv.logDir);
}

opts = merge(argv, opts);

var servomatic = new Servomatic(opts);
servomatic.start();

function findFilePath(key, file) {
  var f = file;
  if (key && !file) {
    return opts[key];
  }

  if (resolve(file) !== normalize(file)) {
    //~ if ( ! path.isAbsolute(themedir) ) { //needs node 0.12
    file = join(cwd, file);
    if (existsSync(file)) {
      return file;
    }
  }
  return f;
}
