#!node_modules/.bin/babel-node

import minimist from 'minimist';
import Servomatic from '../servomatic';
import {join} from 'path';
import {isS as isStr, isN as isNum} from 'magic-types';
import {merge} from 'magic-merge';

var argv  = minimist(process.argv.slice(2))
  , cwd   = process.cwd()
  , env   = 'production'
  , opts  = {
    port: 80
  }
;

if ( argv.dir && isStr(argv.dir) ) {
  if ( argv.dir.indexOf('/') === 0 ) {
    opts.cwd = argv.dir;
  } else {
    opts.cwd = join( cwd, argv.dir );
  }
}

if ( argv.env && isStr(argv.env) ) {
  opts.env = argv.env;
}

if ( argv.port && isNum(argv.port) ) {
  opts.port = argv.port;
}

opts = merge(argv, opts);
var servomatic = new Servomatic(opts);

servomatic.start();
