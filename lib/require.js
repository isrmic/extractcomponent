const fs = require('fs');
const extname = require('path').extname;
var patterncommentsml = /\/\*([\s\S]*?)\*\//gim;
var patternrequire = /require[(]["'](.*?)['"][)]/gi;
var patternselectfilerequire = /[(]["'](.*?)['"][)]/;
var counter = 0;
var modules_register = [];

function requiremodule (filestring){

counter++;

var file = "";
var res;
var match;
var final_file;

if(filestring !== "" && filestring !== null && filestring !== undefined){

    if(extname(filestring) === ".js")
        file = fs.readFileSync(filestring, 'utf8');
    else
        file = filestring;
    file = file.replace(patterncommentsml, "/*replace on import*/");
}
else
    (console.log("nenum arquivo ou string foi passado por parâmetro"), process.exit())

final_file = file;

if(patternrequire.test(file)){
    res = file.match(patternrequire);

    var filename;
    var requirefile
    var functionRequire
    var condiction_nodemodules;
    var condiction_filemodule;
    var name_module;
    var call_module;

    if(res !== null){
      res.map(matchs =>{

          filename = matchs.match(patternselectfilerequire)[1];

          name_module = './node_modules/'+filename;

          condiction_nodemodules = fs.existsSync(name_module);
          condiction_filemodule = fs.existsSync(filename);

          if(filename !== "" && filename !== null && filename !== undefined && (condiction_nodemodules | condiction_filemodule)){

              condiction_nodemodules ? requirefile = fs.readFileSync(name_module + '/dist/' + filename + ".js", 'utf8') :
              requirefile = res !== null && condiction_filemodule ? fs.readFileSync(filename, 'utf8') : '';

              functionRequire = requirefile !== "" ? `function _getModule_${filename.replace(/[^a-zA-Z ]/, "_")}() {\n\nvar exports = {};\nvar module = {exports};\n\n${requirefile}\nreturn module.exports;\n\n}\n\n` : "";

              if(global.modules_register[filename] !== undefined){
                  call_module = global.modules_register[filename]["call"];
              }
              else
              {
                  global.modules_register[filename] = [];
                  global.modules_register[filename]["call"] = `_getModule_${filename.replace(/[^a-zA-Z ]/, "_")}()`;
                  call_module = global.modules_register[filename]["call"];
                  final_file += functionRequire;
                  
              }

              final_file = final_file.replace(matchs, call_module);

          }
          else
            final_file = final_file.replace(matchs, "// file module does not exists ...");

      });

    }
    return requiremodule(final_file);
}
else
  return final_file;

}

module.exports = requiremodule;
