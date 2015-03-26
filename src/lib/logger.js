//logging middleware
import morgan from 'morgan';
import {join} from 'path';
import {createWriteStream as wStream, existsSync} from 'fs';
import merge from 'magic-merge';
import {each} from 'magic-loops';
import mkdirp from 'mkdirp';

var self;

class Logger {
  constructor(app, opts = {}) {
    var cwd         = process.cwd()
      , defaultDir  = join('/var', 'log', 'servomatic')
    ;

    self     = this;
    self.dir = opts.dir || join(cwd, 'log')

    if ( ! existsSync(self.dir) ) {
      console.log(`log dir at ${self.dir} does not exist, creating ${defaultDir}`);
      self.dir = defaultDir;
      mkdirp(self.dir, {mode: 644} );
    }

    self.logs = merge(opts, {
        access: {
          stream: wStream( join(self.dir, 'access.log'), {flags: 'a'} )
        , skip: function (req, res) { return res.statusCode >= 400 }
      }
      , err   : {
          stream: wStream( join(self.dir, 'error.log'), {flags: 'a'} )
        , skip: function (req, res) { return res.statusCode < 400 }
      }
    });

    self.app = app;
  }

  middleware() {
    each(self.logs, (log) => {
      self.app.use( morgan('combined', log) )
    });
  }
}

export default Logger;
