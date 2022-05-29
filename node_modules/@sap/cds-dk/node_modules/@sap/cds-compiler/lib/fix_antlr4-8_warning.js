#!/usr/bin/env node

// ANTLR 4.8 has a circular dependency bug.
// NodeJS 14 warns about this on _every_ call to cds-compiler.
//
// Because we can't update to ANTLR 4.9, yet, since it requires NodeJS 14 and
// we need to support NodeJS 12, this script is run as a postinstall step to
// fix the ANTLR circular dependency bug.
//
// THIS SCRIPT MODIFIES ANOTHER NODEJS MODULE!
//
// We look for `require()` calls to `INVALID_ALT_NUMBER` and replace it
// with its underlying value.

const path = require('path');
const fs = require('fs');

const antlrIndexFile = require.resolve('antlr4');

if (!antlrIndexFile) {
  errorAndExit('Could not find antlr4 dependency');
}
if (!fs.existsSync(antlrIndexFile)) {
  errorAndExit('Could not find antlr4\'s index.js');
}

const antlr_path = path.dirname(antlrIndexFile);
const files = [
  path.join(antlr_path, 'RuleContext.js'),
  path.join(antlr_path, 'tree/Trees.js'),
];

const search = /var INVALID_ALT_NUMBER = require\('[^']+'\)\.INVALID_ALT_NUMBER;/;
const replacement = 'var INVALID_ALT_NUMBER = 0;'

for (const file of files) {
  try {
    let contents = fs.readFileSync(file, 'utf-8');
    contents = contents.replace(search, replacement);
    fs.writeFileSync(file, contents);

  } catch(e) {
    errorAndExit('Could NOT fix Antlr\'s circular dependency');
  }
}

success('Successfully fixed Antlr\'s circular dependency');

function errorAndExit(err) {
  console.error(`postinstall cds-compiler: ${err}`);
  // Emit "success" return code. After all, this script is _optional_.
  process.exit(0);
}
function success(msg) {
  console.error(`postinstall cds-compiler: ${msg}`);
}
