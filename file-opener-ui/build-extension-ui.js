#!/usr/bin/env node

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

function copySync(src, dest) {
  if (!fs.existsSync(src)) {
    return false;
  }

  var data = fs.readFileSync(src, 'utf-8');
  fs.writeFileSync(dest, data);
}

child_process.execFileSync('yarn', ['build'], {cwd: __dirname});
const buildDir = path.join(__dirname, 'build');
const manifest = JSON.parse(
  fs.readFileSync(path.join(buildDir, 'asset-manifest.json'), 'utf8')
);
const js = path.join(buildDir, manifest['main.js']);
const css = path.join(buildDir, manifest['main.css']);

copySync(js, path.join(buildDir, 'out.js'));
copySync(css, path.join(buildDir, 'out.css'));
