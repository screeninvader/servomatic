"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//logging middleware

var morgan = _interopRequire(require("morgan"));

var join = require("path").join;

var wStream = require("fs").createWriteStream;

var mkdirp = _interopRequire(require("mkdirp"));

var merge = _interopRequire(require("magic-merge"));

var each = require("magic-loops").each;

var Logger = function Logger(app) {
  var opts = arguments[1] === undefined ? {} : arguments[1];

  _classCallCheck(this, Logger);

  var cwd = process.cwd(),
      dir = join(cwd, "log"),
      defaultOpts = {
    access: {
      stream: wStream(join(dir, "access.log"), { flags: "a" }),
      skip: function skip(req, res) {
        return res.statusCode >= 400;
      }
    },
    err: {
      stream: wStream(join(dir, "error.log"), { flags: "a" }),
      skip: function skip(req, res) {
        return res.statusCode < 400;
      }
    }
  },
      logs = merge(opts, defaultOpts);
  ;

  each(logs, function (log) {
    app.use(morgan("combined", log));
  });
};

module.exports = Logger;
//# sourceMappingURL=logger.js.map