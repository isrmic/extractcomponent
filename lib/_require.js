const fs = require('fs');
const path = require('path');
var patterncommentsml = /\/\*([\s\S]*?)\*\//gim;
var patternrequire = /require[(]["'](.*?)['"][)]/gi;
var patternselectfilerequire = /[(]["'](.*?)['"][)]/;
var counter = 0;
var modules_register = [];
global.path = "";
function requiremodule (filestring, _path){

counter++;
// console.log(_path)
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
    var readpackagejson;
    var script_in_module;
    var rec_path;


    if(res !== null){
      res.map(matchs =>{

          call_module = null;

          filename = matchs.match(patternselectfilerequire)[1];
          // filename = _path !== undefined ? _path + "/" + filename : filename;
          console.log(filename)
          name_module = path.join('./node_modules', filename);

          if(global.modules_register[filename] === undefined){

          condiction_nodemodules = fs.existsSync(name_module);

          script_in_module = fs.existsSync("./"+name_module + ".js");
          // console.log(filename , script_in_module);
          // console.log(condiction_nodemodules, script_in_module)

          if(filename.indexOf(".") >= 0){

              if(_path !== undefined){
                  pathname = path.join(_path, filename);
              }
              else {
                  pathname = path.join(global.path, filename);
              }
              global.path = path.dirname(pathname);
              // console.log(global.path)
          }
          else {

              if(!condiction_nodemodules){
                  // global.path = path.dirname(filename);
                  // console.log("here", filename)
                  rec_path = path.dirname(name_module);
                  pathname = script_in_module ? path.join(path.dirname(name_module), path.basename(filename + ".js")) : filename;
                  // global.path = path.dirname(pathname);
              }
              else{
                  pathname = filename;
              }
          }
          // console.log("2", pathname)
          // console.log(rec_path)
          condiction_filemodule = fs.existsSync(pathname) ? "file_d" : fs.existsSync(pathname + ".js") ? "file_s" : false;
          }

          // console.log(condiction_nodemodules, condiction_filemodule);
          // console.log("1", _path, pathname);
          if((condiction_nodemodules || condiction_filemodule || script_in_module)){
              // console.log(condiction_nodemodules , condiction_filemodule)
              fs.existsSync(name_module + "/package.json") ? readpackagejson = JSON.parse(fs.readFileSync(name_module + "/package.json", 'utf8')) : null;

              let fileload;
              if(script_in_module){
                  fileload = pathname;
              }
              else {
                  fileload = readpackagejson !== undefined && readpackagejson.files !== undefined && readpackagejson.files.indexOf('index.js') >= 0 ?
                  readpackagejson.files[readpackagejson.files.indexOf('index.js')] :
                  readpackagejson !== undefined && readpackagejson.main !== undefined ? readpackagejson.main : "";
                  fileload  = name_module + "/" + fileload;
              }

              condiction_nodemodules || script_in_module ? requirefile = fs.readFileSync(fileload, 'utf8') :
              requirefile = res !== null && condiction_filemodule == 'file_d' ? fs.readFileSync(pathname, 'utf8') : condiction_filemodule == "file_s" ? fs.readFileSync(pathname + ".js", 'utf8') : '';
              let extra  =`var process = module.exports = {};\nprocess.env = {};\nprocess.argv = [];\n`;
              functionRequire = requirefile !== "" ? `function _getModule_${filename.replace(/[^a-zA-Z ]/gi, "_")}() {\n\nvar exports = {};\nvar module = {exports};\n${extra}\n\n${requirefile}\nreturn module.exports;\n\n}\n\n` : "";


              if(global.modules_register[filename] !== undefined){
                  call_module = global.modules_register[filename]["call"];
              }
              else
              {
                  global.modules_register[filename] = [];
                  global.modules_register[filename]["call"] = `_getModule_${filename.replace(/[^a-zA-Z ]/gi, "_")}()`;
                  call_module = global.modules_register[filename]["call"];

                  if(patternrequire.test(functionRequire)){

                      if(script_in_module || condiction_filemodule !== false){
                          global.path = path.dirname(pathname);
                      }
                      else
                          global.path = name_module;
                      // console.log(filename, global.path)
                      final_file += requiremodule(functionRequire, global.path);
                  }
                  // console.log(filename, global.path, _path);
                  final_file += requiremodule(functionRequire, global.path);
              }
              final_file = final_file.replace(matchs, call_module);
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
    return requiremodule(final_file);
}
else
  return final_file;

}

module.exports = requiremodule;
