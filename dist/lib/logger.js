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
//# sourceMappingURL=logger.js.map