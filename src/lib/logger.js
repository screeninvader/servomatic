//logging middleware
import morgan from 'morgan';
import {join} from 'path';
import {createWriteStream as wStream, existsSync} from 'fs';
import merge from 'magic-merge';
import {each} from 'magic-loops';
import mkdirp from 'mkdirp';

class Logger {
  constructor(app, opts = {}) {
    var cwd         = process.cwd()
      , defaultDir  = join('/var', 'log', 'servomatic')
    ;

    this.dir = join(opts.dir || cwd, 'log');

    if ( ! existsSync(this.dir) ) {
      console.log(`log dir at ${this.dir} does not exist, creating ${defaultDir}`);
      this.dir = defaultDir;
      mkdirp(this.dir, {mode: 644} );
    }

    this.logs = merge(opts, {
      access: {
          stream: wStream( join(this.dir, 'access.log'), {flags: 'a'} )
        //~ , skip: function (req, res) { return res.statusCode >= 400 }
      }
    //~ , err: {
          //~ stream: wStream( join(this.dir, 'error.log'), {flags: 'a'} )
        //~ , skip: function (req, res) { return res.statusCode < 400 }
      //~ }
    });

    this.app = app;
  }

  middleware() {
    var self = this;
    each(this.logs, (log) => {
      console.log('logger');
      self.app.use( morgan('combined', log) );
    });
  }
}

export default Logger;
