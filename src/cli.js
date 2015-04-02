#!/usr/local/bin/node

import minimist from 'minimist';
import Servomatic from './servomatic';
import {join} from 'path';
import {isS as isStr, isN as isNum} from 'magic-types';
import {merge} from 'magic-merge';
import {existsSync} from 'fs';

var argv  = minimist(process.argv.slice(2))
  , cwd   = process.cwd()
  , env   = 'production'
  , opts  = {
    port: 1337
  }
;

if ( argv.dir && isStr(argv.dir) ) {
  let wd = argv.dir;
  if ( argv.dir.indexOf('/') !== 0 ) {
    wd = join( cwd, argv.dir );
  }

  if ( existsSync(wd) ) {
    opts.dir = wd;
  }
}

if ( argv.env && isStr(argv.env) ) {
  opts.env = argv.env;
}

if ( argv.port && isNum(argv.port) ) {
  opts.port = argv.port;
}

if ( argv.logDir && isStr(argv.logDir) ) {
  if ( existsSync(argv.logDir) ) {
    opts.logDir = argv.logDir;
  }
}

opts = merge(argv, opts);

var servomatic = new Servomatic(opts);
servomatic.start();
