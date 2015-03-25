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
//# sourceMappingURL=view.js.map