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

var Logger = (function () {
  function Logger(app) {
    var opts = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Logger);

    var cwd = process.cwd(),
        defaultDir = join("/var", "log", "servomatic");

    this.dir = join(opts.dir || cwd, "log");

    if (!existsSync(this.dir)) {
      console.log("log dir at " + this.dir + " does not exist, creating " + defaultDir);
      this.dir = defaultDir;
      mkdirp(this.dir, { mode: 644 });
    }

    this.logs = merge(opts, {
      access: {
        stream: wStream(join(this.dir, "access.log"), { flags: "a" })
        //~ , skip: function (req, res) { return res.statusCode >= 400 }
      }
      //~ , err: {
      //~ stream: wStream( join(this.dir, 'error.log'), {flags: 'a'} )
      //~ , skip: function (req, res) { return res.statusCode < 400 }
      //~ }
    });

    this.app = app;
  }

  _createClass(Logger, {
    middleware: {
      value: function middleware() {
        var self = this;
        each(this.logs, function (log) {
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

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var express = _interopRequire(require("express"));

var get = require("http").get;

var join = require("path").join;

var existsSync = require("fs").existsSync;

var minimist = _interopRequire(require("minimist"));

var Favicon = _interopRequire(require("magic-favicon"));

var isObj = _interopRequire(require("magic-types"));

var merge = _interopRequire(require("magic-merge"));

var Servomatic = (function () {
  function Servomatic(opts, app) {
    _classCallCheck(this, Servomatic);

    var cwd = process.cwd(),
        defaultDirs = {
      "static": join(cwd, "dist"),
      "public": join(cwd, "public"),
      views: join(cwd, "views"),
      favicon: join(cwd, "favicon.ico"),
      worstCaseFallBack: join(__dirname, "dist")
    };

    this.app = opts.app || express();
    this.env = opts.env || this.app.get("env");
    this.cwd = opts.cwd || cwd;
    this.app.set("env", this.env);
    this.dirs = merge(defaultDirs, opts.dirs);
    this.logger = new Logger(this.app);
    this.port = opts.port || process.env.PORT || 1337;
  }

  _createClass(Servomatic, {
    start: {
      value: function start() {
        var _this = this;

        var dirs = this.dirs;
        console.log("servomatic serving from: " + this.cwd);

        this.app.set("port", this.port);

        // view engine setup for the rare cases where no html file exists
        this.app.set("views", dirs.views);
        this.app.set("view engine", "jade");

        new Favicon(this.app, dirs.favicon);

        //if requested path exists in /public it gets served from there
        this.app.use(express["static"](dirs["public"]));

        this.logger.middleware(this.app);

        this.app.use(express["static"](dirs["static"], {
          extensions: ["html"] //automatically add html extension to urls
          , index: ["index.html"] //always load index.html files on /
        }));

        //servomatic api redirect
        //lib/api.js, gets included by babelify
        this.app.use("/slackomatic/*", api);

        // lib/killer.js, gets included by babelify
        this.app.use(killer);

        //renders :page from views/pages if static html does not exist
        this.app.use("/:page", view);

        this.app.use(express["static"](dirs.worstCaseFallBack));

        // catch 404 and forwarding to error handler
        this.app.use(function (req, res, next) {
          var err = new Error("Not Found");
          err.status = 404;
          next(err);
        });

        // error handlers
        // development error handler prints stacktrace
        if (!this.env || !errorHandler.hasOwnProperty(this.env)) {
          env = "production";
        }

        this.app.use(errorHandler[this.env]);

        this.app.listen(this.app.get("port"), function () {
          console.log("this.app listens on port : " + _this.app.get("port"));
        });
      }
    }
  });

  return Servomatic;
})();

module.exports = Servomatic;
