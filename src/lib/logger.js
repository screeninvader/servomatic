//logging middleware
import morgan from 'morgan';
import {join} from 'path';
import {createWriteStream as wStream} from 'fs';
import mkdirp from 'mkdirp';
import merge from 'magic-merge';
import {each} from 'magic-loops';

class Logger {
  constructor(app, opts = {}) {
    var cwd         = process.cwd()
      , dir         = join(cwd, 'log')
      , defaultOpts = {
          access: {
            stream: wStream( join(dir, 'access.log'), {flags: 'a'} )
          , skip: function (req, res) { return res.statusCode >= 400 }
        }
        , err   : {
            stream: wStream( join(dir, 'error.log'), {flags: 'a'} )
          , skip: function (req, res) { return res.statusCode < 400 }
        }
      }
      , logs        = merge(opts, defaultOpts);
    ;

    each(logs, (log) => {
      app.use( morgan('combined', log) )
    });
  }
}

export default Logger;
