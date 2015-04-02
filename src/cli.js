#!/usr/local/bin/node

import minimist from 'minimist';
import Servomatic from './servomatic';
import {join, resolve, normalize} from 'path';
import {isS as isStr, isN as isNum} from 'magic-types';
import {merge} from 'magic-merge';
import {existsSync} from 'fs';

var argv  = minimist(process.argv.slice(2))
  , cwd   = process.cwd()
  , env   = 'production'
  , opts  = {
      port: 1337
    , dir: join(cwd, 'dist')
    , logDir: join('/var', 'log', 'servomatic')
  }
;

if ( argv.dir && isStr(argv.dir) ) {
  opts.dir = findFilePath('dir', argv.dir);
}

if ( argv.env && isStr(argv.env) ) {
  opts.env = argv.env;
}

if ( argv.port && isNum(argv.port) ) {
  opts.port = argv.port;
}

if ( argv.logDir && isStr(argv.logDir) ) {
  opts.logDir = findFilePath('logDir', argv.logDir);
}

opts = merge(argv, opts);

var servomatic = new Servomatic(opts);
servomatic.start();


function findFilePath(key, file) {
  var f = file;
  if ( key && ! file ) {
    return opts[key];
  }

  if ( resolve( file ) !== normalize( file ) ) {
  //~ if ( ! path.isAbsolute(themedir) ) { //needs node 0.12
    file = join( cwd, file );
    if ( existsSync(file) ) {
      return file;
    }
  }
  return f;
}
