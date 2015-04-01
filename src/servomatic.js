import express from 'express';
import {get} from 'http';
import {join} from 'path';
import {existsSync} from 'fs';
import minimist from 'minimist';
import Favicon from 'magic-favicon';
import isObj from 'magic-types';
import merge from 'magic-merge';

class Servomatic {
  constructor(opts, app) {
    var cwd = process.cwd()
      , defaultDirs = {
          static           : join(cwd, 'dist')
        , public           : join(cwd, 'public')
        , views            : join(cwd, 'views')
        , favicon          : join(cwd, 'favicon.ico')
        , worstCaseFallBack: join(__dirname, 'dist')
      }
    ;

    this.app = opts.app || express();
    this.env  = opts.env || this.app.get('env');
    this.cwd  = opts.cwd || cwd;
    this.app.set('env', this.env);
    this.dirs = merge(defaultDirs, opts.dirs);
    this.logger = new Logger( this.app );
    this.port = opts.port || process.env.PORT || 80;
  }

  start() {
    var dirs = this.dirs;
    console.log(`executing in cwd: ${this.cwd} with dirs ${JSON.stringify(this.dirs)}`);

    this.app.set('port', this.port);

    // view engine setup for the rare cases where no html file exists
    this.app.set('views', dirs.views);
    this.app.set('view engine', 'jade');

    new Favicon(this.app, dirs.favicon);

    //if requested path exists in /public it gets served from there
    this.app.use( express.static(dirs.public) );

    this.logger.middleware(this.app);

    this.app.use( express.static( dirs.static, {
      extensions: ['html'] //automatically add html extension to urls
    , index: ['index.html'] //always load index.html files on /
    }));

    //servomatic api redirect
    //lib/api.js, gets included by babelify
    this.app.use('/slackomatic/*', api);

    // lib/killer.js, gets included by babelify
    this.app.use(killer);

    //renders :page from views/pages if static html does not exist
    this.app.use('/:page', view);

    this.app.use( express.static(dirs.worstCaseFallBack) );

    // catch 404 and forwarding to error handler
    this.app.use( (req, res, next) => {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handlers
    // development error handler prints stacktrace
    if ( ! this.env ||  ! errorHandler.hasOwnProperty(this.env) ) {
      env = 'production';
    }

    this.app.use( errorHandler[this.env] );

    this.app.listen( this.app.get('port'), () => {
      console.log(`this.app listens on port : ${this.app.get('port')}`);
    } );
  }
}

export default Servomatic;
