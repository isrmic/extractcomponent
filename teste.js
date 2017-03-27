var babel = require('babel-core');

var code = babel.transformFileSync("main.js", {presets:["es2015", "babili"]}).code;

console.log(code);
