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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var errorHandler = {
  //development errorHandler, renders error page
  development: function development(err, req, res, next) {
    var message = {
      message: err.message,
      error: err
    };
    res.status(err.status || 500).send("error : " + JSON.stringify(message));
  },

  // production error handler
  // no stacktraces leaked to user
  production: function production(err, req, res, next) {
    res.status(err.status || 500).send("error");
  }
};

exports.errorHandler = errorHandler;
exports["default"] = errorHandler;
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
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//logging middleware

var morgan = _interopRequire(require("morgan"));

var join = require("path").join;

var _fs = require("fs");

var wStream = _fs.createWriteStream;
var existsSync = _fs.existsSync;

var merge = _interopRequire(require("magic-merge"));

var each = require("magic-loops").each;

var mkdirp = _interopRequire(require("mkdirp"));

var self;

var Logger = (function () {
  function Logger(app) {
    var opts = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Logger);

    var cwd = process.cwd(),
        defaultDir = join("/var", "log", "servomatic");

    self = this;
    self.dir = opts.dir || join(cwd, "log");

    if (!existsSync(self.dir)) {
      console.log("log dir at " + self.dir + " does not exist, creating " + defaultDir);
      self.dir = defaultDir;
      mkdirp(self.dir, { mode: 644 });
    }

    self.logs = merge(opts, {
      access: {
        stream: wStream(join(self.dir, "access.log"), { flags: "a" }),
        skip: function skip(req, res) {
          return res.statusCode >= 400;
        }
      },
      err: {
        stream: wStream(join(self.dir, "error.log"), { flags: "a" }),
        skip: function skip(req, res) {
          return res.statusCode < 400;
        }
      }
    });

    self.app = app;
  }

  _createClass(Logger, {
    middleware: {
      value: function middleware() {
        each(self.logs, function (log) {
          self.app.use(morgan("combined", log));
        });
      }
    }
  });

  return Logger;
})();

module.exports = Logger;
"use strict";

exports.view = view;
Object.defineProperty(exports, "__esModule", {
  value: true
});

function view(req, res, next) {
  res.render("pages/" + req.params.page, function (err, html) {
    if (err || !html) {
      next(err);
    }

    res.status(200).send(html);
  });
}

exports["default"] = view;
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var express = _interopRequire(require("express"));

var get = require("http").get;

var join = require("path").join;

var Favicon = _interopRequire(require("magic-favicon"));

var existsSync = require("fs").existsSync;

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
  "static": join(cwd, "static"),
  "public": join(cwd, "public"),
  views: join(cwd, "views"),
  favicon: join(cwd, "favicon.ico"),
  worstCase: join(__dirname, "dist")
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
"use strict";

(function () {
  console.log("hello world");
})();
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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var errorHandler = {
  //development errorHandler, renders error page
  development: function development(err, req, res, next) {
    var message = {
      message: err.message,
      error: err
    };
    res.status(err.status || 500).send("error : " + JSON.stringify(message));
  },

  // production error handler
  // no stacktraces leaked to user
  production: function production(err, req, res, next) {
    res.status(err.status || 500).send("error");
  }
};

exports.errorHandler = errorHandler;
exports["default"] = errorHandler;
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
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//logging middleware

var morgan = _interopRequire(require("morgan"));

var join = require("path").join;

var _fs = require("fs");

var wStream = _fs.createWriteStream;
var existsSync = _fs.existsSync;

var merge = _interopRequire(require("magic-merge"));

var each = require("magic-loops").each;

var mkdirp = _interopRequire(require("mkdirp"));

var self;

var Logger = (function () {
  function Logger(app) {
    var opts = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Logger);

    var cwd = process.cwd(),
        defaultDir = join("/var", "log", "servomatic");

    self = this;
    self.dir = opts.dir || join(cwd, "log");

    if (!existsSync(self.dir)) {
      console.log("log dir at " + self.dir + " does not exist, creating " + defaultDir);
      self.dir = defaultDir;
      mkdirp(self.dir, { mode: 644 });
    }

    self.logs = merge(opts, {
      access: {
        stream: wStream(join(self.dir, "access.log"), { flags: "a" }),
        skip: function skip(req, res) {
          return res.statusCode >= 400;
        }
      },
      err: {
        stream: wStream(join(self.dir, "error.log"), { flags: "a" }),
        skip: function skip(req, res) {
          return res.statusCode < 400;
        }
      }
    });

    self.app = app;
  }

  _createClass(Logger, {
    middleware: {
      value: function middleware() {
        each(self.logs, function (log) {
          self.app.use(morgan("combined", log));
        });
      }
    }
  });

  return Logger;
})();

module.exports = Logger;
"use strict";

exports.view = view;
Object.defineProperty(exports, "__esModule", {
  value: true
});

function view(req, res, next) {
  res.render("pages/" + req.params.page, function (err, html) {
    if (err || !html) {
      next(err);
    }

    res.status(200).send(html);
  });
}

exports["default"] = view;
