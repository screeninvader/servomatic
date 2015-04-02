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

console.log('starting slackomatic with opts', opts);

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
