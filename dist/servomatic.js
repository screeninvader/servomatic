#!/usr/bin/node
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var express = _interopRequire(require("express"));

var get = require("http").get;

var join = require("path").join;

var Favicon = _interopRequire(require("magic-favicon"));

var existsSync = require("fs").existsSync;

var api = _interopRequire(require("./lib/api"));

var errorHandler = _interopRequire(require("./lib/errorHandler"));

var killer = _interopRequire(require("./lib/killer"));

var view = _interopRequire(require("./lib/view"));

var Logger = _interopRequire(require("./lib/logger"));

var minimist = _interopRequire(require("minimist"));

var servomatic = express(),
    env = servomatic.get("env"),
    cwd = process.cwd(),
    argv = minimist(process.argv.slice(2));

if (argv.dir && typeof argv.dir === "string") {
  if (argv.dir.indexOf("/") === 0) {
    cwd = argv.dir;
  } else {
    cwd = join(cwd, argv.dir);
  }
}

var dirs = {
  "static": join(cwd),
  "public": join(cwd, "public"),
  views: join(cwd, "views"),
  favicon: join(cwd, "favicon.ico"),
  worstCase: join(__dirname, "static")
},
    logger = new Logger(servomatic);

console.log("executing in cwd: " + cwd);

servomatic.set("port", process.env.PORT || 80);

// view engine setup for the rare cases where no html file exists
servomatic.set("views", dirs.views);
servomatic.set("view engine", "jade");

new Favicon(servomatic, dirs.favicon);

//if requested path exists in /public it gets served from there
servomatic.use(express["static"](dirs["public"]));

logger.middleware(servomatic);

//servomaticomatic api redirect
servomatic.use("/slackomatic/*", api);

servomatic.use(killer);

servomatic.use(express["static"](dirs["static"], {
  extensions: ["html"] //automatically add html extension to urls
  , index: ["index.html"] //always load index.html files on /
}));

//renders :page from views/pages if static html does not exist
servomatic.use("/:page", view);

servomatic.use(express["static"](dirs.worstCase));

// catch 404 and forwarding to error handler
servomatic.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers
// development error handler prints stacktrace
if (!errorHandler.hasOwnProperty(env)) {
  env = "production";
}

servomatic.use(errorHandler[env]);

servomatic.listen(servomatic.get("port"), function () {
  console.log("servomatic listens on port : " + servomatic.get("port"));
});
//# sourceMappingURL=servomatic.js.map