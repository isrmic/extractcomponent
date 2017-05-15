const fs = require('fs');
const path = require('path');

global.path = "";
global.maproad = [];

if(fs.existsSync(process.cwd() + '/component.config.js'))
    config = require(process.cwd() + '/component.config.js');
else
    config = require("./default.config.js");

var patterncommentsml = /\/\*(import|export|exports)\*\//gim;
var patternrequire = /require[(]["'](.*?)['"][)]/gi;
var patternselectfilerequire = /[(]["'](.*?)['"][)]/;
var counter = 0;
var modules_register = [];
var nameload;

var registersfilename = [];
function requiremodule (filestring, _path, _typereturn, _nameload){

nameload = _nameload !== undefined ? _nameload : nameload;

arguments[4] !== undefined ? (/*console.log(arguments[4], _path, _nameload),*/ global.path = _path) : null;
var file = "";
var res;
var match;
var final_file;
var pathname = "";
var extname;

if(filestring !== "" && filestring !== null && filestring !== undefined){

    if(path.extname(filestring) === ".js")
        file = fs.readFileSync(filestring, 'utf8');
    else
        file = filestring;
    // file = file.replace(patterncommentsml, (x, y) => x.indexOf("//") >= 0 || x.indexOf("import") >= 0 || x.indexOf("export") >= 0 || x.indexOf(/exports+/gi)? '/*replaced*/' : x);
}
else
    (console.log("nenhum arquivo ou string foi passado por parâmetro"), console.log(global.path), process.exit())

final_file = file;

if(patternrequire.test(file)){
    res = file.match(patternrequire);

    var filename;
    var requirefile;
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
          if(filename.indexOf("..") === -1)
              name_module = path.join(process.cwd(), './node_modules', filename);

          condiction_nodemodules = fs.existsSync(name_module);

          if(nameload !== undefined && config.load_modules !== undefined && nameload in config.load_modules && condiction_nodemodules)
              pathname = path.join(process.cwd(), './node_modules', config.load_modules[nameload].path);
          else {
              // console.log(name_module, condiction_nodemodules)
              if(global.modules_register[filename] === undefined){

              script_in_module = fs.existsSync(name_module + ".js") || fs.existsSync(path.join(_path, filename + ".js"));
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
          // console.log(filename, _nameload, 'pathaname: ', pathname);

          // if(_nameload)
          // console.log(_nameload, filename)

          extname = path.extname(filename);
          // console.log(condiction_nodemodules, condiction_filemodule, pathname);
          // console.log("1", _path, pathname);

          if((condiction_nodemodules || condiction_filemodule || script_in_module)){

              // console.log(condiction_nodemodules , condiction_filemodule)
              fs.existsSync(name_module + "/package.json") ? readpackagejson = JSON.parse(fs.readFileSync(name_module + "/package.json", 'utf8')) : null;

              let fileload;
              if(script_in_module || nameload !== undefined && config.load_modules !== undefined && nameload in config.load_modules){
                  if(fs.existsSync(path.join(_path, filename + ".js")))
                      fileload = path.join(_path, filename + ".js")
                  else if(fs.existsSync(pathname + ".js"))
                      fileload = pathname + ".js";
                  else
                      fileload = pathname;

              }
              else {
                  fileload = readpackagejson !== undefined && readpackagejson.files !== undefined && readpackagejson.files.indexOf('index.js') >= 0 ?
                  readpackagejson.files[readpackagejson.files.indexOf('index.js')] :
                  readpackagejson !== undefined && readpackagejson.main !== undefined ? readpackagejson.main : "";
                  // console.log(filename, fileload === "")
                  // console.log("foi aqui", fileload, 'teste')

                  fileload === "" ? fileload = "index.js" : null;
                  fileload  = name_module + "/" + fileload;
                  if(path.extname(fileload) === "" && script_in_module)
                      fileload += ".js";

              }
              // console.log(fileload, condiction_nodemodules, script_in_module)

              condiction_nodemodules || script_in_module ? requirefile = fs.readFileSync(fileload, 'utf8') :
              requirefile = res !== null && condiction_filemodule == 'file_d' ? fs.readFileSync(pathname, 'utf8') : condiction_filemodule == "file_s" ? fs.readFileSync(pathname + ".js", 'utf8') : '';

              let envType = `'${config.NODE_ENV}'` || 'development';
              let extra  =`let process = module.exports;\nprocess.env = {NODE_ENV:${envType}};\nprocess.argv = [];\n`;
              let difext = extname === ".json" ? requirefile = "module.exports = " + requirefile : null;
              requirefile.indexOf("module.exports") !== -1 ? typemodule = "withenv" : typemodule = "withoutenv";
              if(typemodule === "withoutenv")
                  functionRequire = requirefile !== "" ? `function _getModule_${filename.replace(/[^a-zA-Z ]|\//gi, "_")}() {\n\nlet exports = {};\nvar module = {exports};\n\n${requirefile}\nreturn module.exports;\n\n};` : "";
              else
                  functionRequire = requirefile !== "" ? `function _getModule_${filename.replace(/[^a-zA-Z ]|\//gi, "_")}() {\n\nlet exports = {};\nvar module = {exports};\n${extra}\n\n${requirefile}\nreturn module.exports;\n\n}` : "";

              // console.log(filename, name_module)

              if(global.modules_register[filename] !== undefined){
                  call_module = global.modules_register[filename]["call"];
              }
              else
              {
                // counter++;
                // console.log(counter, filename)

                  global.modules_register[filename] = [];
                  global.modules_register[filename]["call"] = `_getModule_${filename.replace(/[^a-zA-Z ]|\//gi, "_")}()`;
                  call_module = global.modules_register[filename]["call"];
                  global.filenameregisters.push(filename);


                  if(patternrequire.test(functionRequire)){

                      if(condiction_nodemodules)
                          rec_path = name_module;
                      else if(condiction_filemodule !== false)
                          rec_path = path.dirname(pathname);

                      functionRequire += requiremodule(functionRequire, rec_path, 1);

                  }
                  functionRequire = requiremodule(functionRequire, rec_path, 1);
                  rec_path !== undefined  && global.maproad.indexOf(rec_path) === -1 ? global.maproad.push(rec_path) : null;

                  // final_file += requiremodule(functionRequire, rec_path, 1);
                  final_file += functionRequire;


              }

              if(_typereturn === 1)
                  final_file = final_file.replace(matchs, call_module);
              else if(_typereturn === 2)
                  final_file = final_file.replace(matchs, "");
          }
          else
          {

            if(global.modules_register[filename] !== undefined && filename !== "./factoryWithTypeCheckers"){
                // console.log(filename)
                call_module = global.modules_register[filename]["call"];
                final_file = final_file.replace(matchs, call_module);
            }
            else{
              let newmap = null;
              global.maproad.forEach(each =>{
                  if(fs.existsSync(path.join(each, filename)) || fs.existsSync(path.join(each, filename + ".js")) )
                      newmap = path.join(each, filename);

              });
              if(newmap !== null){

                  final_file = fs.readFileSync(newmap+".js", 'utf8');
                  // final_file = requiremodule(final_file, path.dirname(newmap), 1, 'testeload');
                  fs.writeFileSync('depure7.js', final_file);
              }
              // final_file = final_file.
              final_file = final_file.replace(matchs, "null");
            }
          }
      });
    }
    return patternrequire.test(final_file) ? requiremodule(final_file, _path, 1) : final_file;
}
else{

  return final_file;
}

}

module.exports = requiremodule;
