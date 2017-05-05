const fs = require('fs');
const path = require('path');
const serializeexports = require("./serializeexports.js");

if(fs.existsSync(process.cwd() + '/component.config.js'))
    config = require(process.cwd() + '/component.config.js');
else
    config = require("./default.config.js");

var patterncommentsml = /\/\*([\s\S]*?)\*\//gim;
var patternrequire = /require[(]["'](.*?)['"][)]/gi;
var patternselectfilerequire = /[(]["'](.*?)['"][)]/;
var counter = 0;
var modules_register = [];
var nameload;
global.path = "";
function requiremodule (filestring, _path, _typereturn, _nameload){

counter++;
nameload = _nameload !== undefined ? _nameload : nameload;
arguments[4] !== undefined ? (/*console.log(arguments[4], _path, _nameload),*/ global.path = _path) : null;
var file = "";
var res;
var match;
var final_file;
var pathname = "";

if(filestring !== "" && filestring !== null && filestring !== undefined){

    if(path.extname(filestring) === ".js")
        file = fs.readFileSync(filestring, 'utf8');
    else
        file = filestring;
    file = file.replace(patterncommentsml, (x, y) => x.indexOf("import") >= 0 ? '/*replaced*/' : x);
}
else
    (console.log("nenhum arquivo ou string foi passado por parâmetro"), console.log(global.path), process.exit())

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
    var readpackagejson;
    var script_in_module;
    var rec_path;
    var typeexport;
    var typemodule;

    if(res !== null){
      res.map(matchs =>{

          call_module = null;

          filename = matchs.match(patternselectfilerequire)[1];


          // filename = _path !== undefined ? _path + "/" + filename : filename;
          name_module = path.join(process.cwd(), './node_modules', filename);

          condiction_nodemodules = fs.existsSync(name_module);

          if(nameload !== undefined && nameload in config.load_modules && condiction_nodemodules)
              pathname = path.join(process.cwd(), './node_modules', config.load_modules[nameload].path);
          else {
              // console.log(name_module, condiction_nodemodules)
              if(global.modules_register[filename] === undefined){

              script_in_module = fs.existsSync(name_module + ".js");
              // console.log(filename , name_module, script_in_module);
              // console.log(_path + "./"+name_module + ".js")
              // console.log(condiction_nodemodules, script_in_module)

              if(filename.indexOf(".") >= 0){
                  // console.log("here", filename, _path)
                  // console.log(1)
                  if(_path !== undefined){
                      pathname = path.join(_path, filename);
                      // console.log(pathname)
                  }
                  else {
                      // console.log(2)
                      pathname = path.join(global.path, filename);
                  }
                  global.path = path.dirname(pathname);
                  // console.log(global.path)
              }
              else {

                  if(!condiction_nodemodules){
                      // console.log(3)
                      // global.path = path.dirname(filename);
                      // console.log("here", filename)
                      rec_path = path.dirname(name_module);
                      pathname = script_in_module ? path.join(path.dirname(name_module), path.basename(filename + ".js")) : filename;
                      // global.path = path.dirname(pathname);
                  }
                  else{
                      // console.log(4)
                      pathname = filename;
                  }
              }

              // console.log("2", pathname)
              // console.log(rec_path)
              condiction_filemodule = fs.existsSync(pathname) ? "file_d" : fs.existsSync(pathname + ".js") ? "file_s" : false;
              }
          }

          // console.log(condiction_nodemodules, condiction_filemodule, pathname);
          // console.log("1", _path, pathname);

          if((condiction_nodemodules || condiction_filemodule || script_in_module)){
              // console.log(condiction_nodemodules , condiction_filemodule)
              fs.existsSync(name_module + "/package.json") ? readpackagejson = JSON.parse(fs.readFileSync(name_module + "/package.json", 'utf8')) : null;

              let fileload;
              if(script_in_module || nameload !== undefined && nameload in config.load_modules){
                  fileload = pathname;
              }
              else {
                  fileload = readpackagejson !== undefined && readpackagejson.files !== undefined && readpackagejson.files.indexOf('index.js') >= 0 ?
                  readpackagejson.files[readpackagejson.files.indexOf('index.js')] :
                  readpackagejson !== undefined && readpackagejson.main !== undefined ? readpackagejson.main : "";
                  // console.log(filename, fileload === "")
                  fileload === "" ? fileload = "index.js" : null;
                  fileload  = name_module + "/" + fileload;
              }
              // console.log(fileload, condiction_nodemodules, script_in_module)

              condiction_nodemodules || script_in_module ? requirefile = fs.readFileSync(fileload, 'utf8') :
              requirefile = res !== null && condiction_filemodule == 'file_d' ? fs.readFileSync(pathname, 'utf8') : condiction_filemodule == "file_s" ? fs.readFileSync(pathname + ".js", 'utf8') : '';

              let extra  =`var process = module.exports;\nprocess.env = {NODE_ENV:'production'};\nprocess.argv = [];\n`;

              requirefile.indexOf("module.exports") !== -1 ? typemodule = "withenv" : typemodule = "withoutenv";

              functionRequire = requirefile !== "" ? `(function _getModule_${filename.replace(/[^a-zA-Z ]|\//gi, "_")}() {\n\nvar exports = {};\nvar module = {exports};\n${typemodule === "withenv" ? extra : ''}\n\n${requirefile}\nreturn module.exports;\n\n})();` : "";

              // console.log(filename, name_module)

              if(global.modules_register[filename] !== undefined){
                  call_module = global.modules_register[filename]["call"];
              }
              else
              {

                global.modules_register[filename] = [];
                global.modules_register[filename]["call"] = `_getModule_${filename.replace(/[^a-zA-Z ]|\//gi, "_")}()\n`;
                call_module = global.modules_register[filename]["call"];

                  if(patternrequire.exec(functionRequire)){

                      if(condiction_nodemodules)
                          rec_path = name_module;
                      else if(condiction_filemodule !== false)
                          rec_path = path.dirname(pathname);

                      functionRequire = requiremodule(functionRequire, rec_path, 1);
                  }
                  // console.log(fileload)
                  final_file += requiremodule(functionRequire, rec_path, 1);
              }

              if(_typereturn === 1)
                  final_file = final_file.replace(matchs, call_module);
              else if(_typereturn === 2)
                  final_file = final_file.replace(matchs, "");
          }
          else
          {

            if(global.modules_register[filename] !== undefined){
                call_module = global.modules_register[filename]["call"];
                final_file = final_file.replace(matchs, call_module);
            }
            else
              final_file = final_file.replace(matchs, "null");

          }

      });
    }
    return patternrequire.test(final_file) ? requiremodule(final_file) : final_file;
}
else
  return final_file;

}

module.exports = requiremodule;
