// requirements of modules

global.modules_register = [];
global.filenameregisters = [];
var included_pack = [];

var fs = require('fs');
var path = require('path');

var requirecomponente = require('./getComponent.js');
var serializeexports = require('./serializeexports.js');

var requiremodule = require('./reqmodule.js');
var patterncommentsml = /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gim;

var patternImportsMatch = [
  /import\s?"\w+[.\-\w/$/]+"/gi,
  /import\s?{<(.*?)\/>}/gi,
  /(\n*)import\s([{]*(.*?)[}]*|[\w.]+|[^a-zA-Z]+)\sfrom\s(["']?[\w\s\d./-]+['"]?|{<(.*?)\/>})/gi,
  // /import\s([\w]+|[^a-zA-Z]+)\s\w{4,}\s(["']?[\w\s\d./-]+['"]?|{<(.*?)\/>})/gi,
  //  /import\s{1}\w+\s{1}\w+\s{1}(.\w+[^a-zA-Z]+[./\-\w]+|[^a-zA-Z]+[.\w]+[^a-zA-Z]?[.\w]+[^a-zA-Z]{3})/gi
];

function importmodules (filetext, typerender, _config, road, unopt){
  // if(arguments[4])
  //     console.log(arguments[4])
  var _path = road !== undefined ? path.dirname(road) : process.cwd();
  var file = "";

  if(typerender === 2){
        file = filetext;
  }
  else if(typerender === 1)
      file = fs.readFileSync(_path + "/" + filetext, 'utf8');

  file = "\n" + file;
  var patternexportstring = /module.exports+\s+=\s+[{]?([^\n]*\n+)+[};]?/gi;

  var file_result = file;
  var requirefile;
  var subcomponents;
  var fileload;
  var functionmodule;
  var extension;
  var namefile;
  var type;
  var typeload;
  var call_module;
  var main_var = null;
  var prop_vars = [];
  var typeimportvar = null;
  var _blocksctx;
  var modulebasename;

  patternImportsMatch.map(regex => {

      var res = file.match(regex);

      var importers = [];

      if(res !== null){

          res.map(codeforimport =>{
              codeforimport = codeforimport.replace(/\n(\s*)/g, "");
              importers.push(codeforimport.split(" "));
          });

          importers.map(Import =>{

              typeimportvar = /{[^<>{}](.*?)}/gi.test(Import.join(" ")) ? "blc" : "normal";
              fileload = '';
              requirefile = '';
              type = '';
              // console.log(Import)
              if(typeimportvar === "blc"){

                  let endblock;

                  fileload = Import[Import.indexOf("from")+1];
                  if(Import[1] === "{"){

                      endblock = Import.indexOf("}");
                      _blocksctx = Import.slice(2, endblock).join("").split(",");
                      // main_var = `_module_${fileload.replace(/"|'|[.-/]?|/gi, "").split("").reverse().join("_")}`;
                      main_var = null;
                  }
                  else {
                      main_var = Import[1].replace(",", "");

                      _blocksctx = Import.slice(Import.indexOf("{")+1, Import.indexOf("}")).join("").split(",");
                  }

                  /["'](.*?)['"]/gi.test(fileload) ?  fileload = fileload.replace(/\s|'|"/g, "") : null;

                  prop_vars = _blocksctx.map(res => `\nvar ${res} = _get${path.basename(fileload).replace(/[\W]|'|"|\//g, "_")}()["${res}"];`);
              }
              else{

                  if(Import[0] !== "import")
                      return;
                  // console.log(Import)
                  if(/["']{1}(.*?)['"]{1}/.test(Import[1])){

                      var matchcapture = /"(.*?)"/gi.exec(Import[1]);
                      fileload = matchcapture[1];
                      typeload = "requirefile";
                  }
                  else if(/{<(.*?)\/>}/.test(Import[1])){
                      fileload = Import[1];
                      typeload = "requirecomponent";
                  }
                  else if(/{<(.*?)\/>}/.test(Import[3])){
                      fileload = Import[3];
                      typeload = "requirecomponent_module";
                      main_var = Import[1];
                  }
                  else{
                      fileload = Import[3];
                      main_var = Import[1];
                  }

                  if(Import[3] !== undefined && Import[2] !== "from")
                      return;

              }

              /["'](.*?)['"]/gi.test(fileload) ?  fileload = fileload.replace(/\s|'|"/g, "") : null;

              modulebasename = path.basename(fileload);

              fs.existsSync(path.join(_path, fileload + ".js")) ? fileload += ".js" : null;

              extension = path.extname(fileload);

              (extension === ".js" || extension === ".jsx") && Import[3] !== undefined ? typeload = "requirescript" : null;

              if(fileload !== undefined && /{<(.*?)\/>}/i.test(fileload)){

                  fileload = fileload.replace(/{<(.*?)\/>}/i, (x, y) =>{
                      /\w+\-\w+/i.test(y) ? type = "vue" : y[0] === y[0].toUpperCase() ? type = "react" : console.log('undefined type');
                      return `${y.replace(/\s\n/gi, "")}`;
                  });

                  requirefile = requirecomponente(fileload, _config)[type]
                  subcomponents = requirefile[fileload + "subcomponents"];
                  requirefile = requirefile[fileload];


              }
              else {
                  if(extension === ".html" || extension === ".pug" || extension === ".jade" || extension === ".vue" || extension === ".react"){

                      (requirefile = requirecomponente(fileload, _config))
                      Object.keys(requirefile.vue).length > 0 ? type = "vue" : Object.keys(requirefile.react).length > 0 ? type = "react" : null;
                      requirefile = requirefile[type][fileload.replace(extension, "")];
                  }
                  else {

                      if(fileload.indexOf(".") === -1 && fs.existsSync(path.join(_path, 'node_modules', fileload)) || fs.existsSync(path.join(_path, 'node_modules', fileload + ".js"))){

                          let readpackagejson, _fileload;

                          requirefile = requiremodule(`require('${fileload}')`, 2);

                          // console.log(requirefile)
                          // console.log(global.filenameregisters);
                          typeload = "requirenodemodules";
                      }

                      else if(fs.existsSync(_path + "/"+ fileload) || fs.existsSync(path.join(_path, fileload + ".js"))){


                          global.path = path.dirname(fileload);

                          requirefile = requiremodule(`require('${fileload}')`, 2);

                          // fs.writeFileSync('debug.txt', global.modules_register.join(","));
                          patternImportsMatch.map(pat =>{
                              pat.test(requirefile) ? requirefile = importmodules(requirefile, 2, _config, path.join(_path, fileload)) : null;
                          });

                          // fs.readFileSync(_path + "/" + fileload, "utf8");
                      }
                      else if (typeload === "requirecomponent" || typeload === "requirecomponent_module"){
                          requirefile = requirecomponente(fileload, _config);
                      }
                      else
                          (console.log(`modulo ${fileload} não encontrado !!! ${_path}`), process.exit())
                  }

              }

              var extra = '';
              requirefile = serializeexports(requirefile, main_var, _blocksctx);

              // let envType = `'${_config.NODE_ENV}'` || 'development';

              // if(typeload === "requirenodemodules")
                  // extra  =`var process = module.exports = {};\nprocess.env = {NODE_ENV:${envType}};\nprocess.argv = [];\n`;


              file_result = file_result.replace(Import.join(" "), (x, y) =>{
                  var functionrequiremodule;
                  if(typeload === "requirecomponent"){
                      if(type === "vue"){
                          requirefile = `Vue.component('${fileload}', ${requirefile});\n\n${subcomponents}`;
                          return requirefile;
                      }
                      else if(type === "react"){
                          return requirefile;
                      }
                  }
                  else if(typeload === "requirecomponent_module"){
                      if(type === "vue"){
                          requirefile = `\n${subcomponents}\nmodule.exports = ${requirefile}`;

                          functionmodule = `function __getModule${Import[3].replace(/[\W]|'|"/gi, "_")}(){\nvar module = {};\n\n/*scope of module imported*/\n${requirefile}\nreturn module.exports;\n}\nvar ${Import[1]} = __getModule${Import[3].replace(/[^a-zA-Z ]|'|"/g, "_")}();`;
                          return functionmodule;
                      }
                      if(type === "react"){
                          functionmodule = `var ${Import[1]} = (function() { \n${requirefile}\n\n return ${fileload};\n\n })();`;
                          return functionmodule;
                      }
                  }
                  else if(typeload === "requirescript"){

                    // fileload = path.basename(fileload.replace(path.extname(fileload, "")));
                    // console.log('here', fileload)

                    if(global.modules_register[modulebasename] !== undefined && included_pack[modulebasename] !== undefined){
                        call_module = global.modules_register[modulebasename]["call"];
                    }
                    else{
                        included_pack.push(modulebasename);
                        global.modules_register[modulebasename] = [];

                        global.modules_register[modulebasename]["call"] = `_get${modulebasename.replace(/[\W]|'|"|\//g, "_")}()`;
                        call_module = global.modules_register[modulebasename]["call"];
                        let applymain_var = main_var !== null ? `var ${main_var} = ${call_module};\n` : '';
                        // functionrequiremodule = `${requirefile}\n \nvar ${main_var} = ${call_module};\n${prop_vars.join("")}\n`;

                        functionrequiremodule = `\n${requirefile}\n${applymain_var}\n${prop_vars.join("")}\n`;
                        // call_module = global.modules_register[fileload]["call"];
                        // functionrequiremodule = `function ${call_module}{\n\nvar exports = {};\nvar module ={exports}; \n${extra}\n ${requirefile} return module.exports;} \nvar ${main_var} = ${call_module};\n${prop_vars.join("")}\n`;
                        return functionrequiremodule;
                    }

                    return `var ${main_var} = ${call_module};`;

                  }
                  else if(typeload === "requirenodemodules"){

                      if(global.modules_register[modulebasename] !== undefined && included_pack[modulebasename] !== undefined){
                          call_module = global.modules_register[modulebasename]["call"];
                      }
                      else{

                          included_pack.push(modulebasename);
                          global.modules_register[modulebasename] = [];

                          global.modules_register[modulebasename]["call"] = `_get${modulebasename.replace(/[\W]|'|"|\//g, "_")}()`;
                          call_module = global.modules_register[modulebasename]["call"];

                          let applymain_var = main_var !== null ? `var ${main_var} = ${call_module};\n` : '';

                          functionrequiremodule = `${requirefile}\n\n${applymain_var}${prop_vars.join("")}\n\n`;
                          return functionrequiremodule;
                      }

                      return `var ${main_var} = ${call_module};${prop_vars.join("")}\n`;
                  }
                  else
                      return requirefile;
              });
          });
       }
  });

  patternImportsMatch.map(regex =>{

      regex.test(file_result) ? (file_result = importmodules(file_result, 2, _config)) : null;

  });

  if(file_result !== undefined && file_result !== null){

      return requiremodule(file_result, 2);
  }

  return "";
}

module.exports = importmodules;
