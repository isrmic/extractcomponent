// requirements of modules

global.modules_register = [];
global.filenameregisters = [];
var included_pack = [];

const fs = require('fs');
const path = require('path');

var requirecomponente = require('./getComponent.js');
var serializeexports = require('./serializeexports.js');

var requiremodule = require('./reqmodule.js');
var patterncommentsml = /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gim;
var patternrequire = /require[(]["'](.*?)['"][)][;]?/gi;
var patternImportsMatch = [
  /import\s?"\w+[.\-\w/$/]+"/gi,
  /import\s?{<(.*?)\/>}/gi,
  /(\n*)import\s([{]*(.*?)[}]*|[\w.]+|[^a-zA-Z]+)\sfrom\s(["']?[\w\s\d./-]+['"]?|{<(.*?)\/>})[;]?/gi,
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
                  let nscop = [];

                  fileload = Import[Import.indexOf("from")+1];
                  if(Import[1] === "{"){

                      endblock = Import.indexOf("}");

                      let captDestructing = Import.slice(2, endblock).join(" ").match(/[a-zA-Z]+(\sas\s)[a-zA-Z]+[,\s]?/g);
                      let declarationDestructing;
                      let refat;

                      if(captDestructing !== null){

                        refat = Import.join(" ");

                        captDestructing.forEach(eachCapt =>{

                            declarationDestructing = eachCapt.split(/as/g).join("").replace(/\s/, "").replace(',', "").split(" ");

                            nscop.push(declarationDestructing);

                            refat = refat.replace(eachCapt, "").replace(/\s{2,}/g, " ");

                        });

                        refat = refat.split(" ");

                        let endBlockRefat = refat.indexOf("}");

                        refat = refat.slice(2, endBlockRefat).join("");

                        _blocksctx = /[a-zA-Z]/gi.test(refat) ? refat.slice(2, endBlockRefat).join("").split(",") : null;

                      }
                      else{

                          _blocksctx = Import.slice(2, endblock).join("").split(",");

                      }

                      // main_var = `_module_${fileload.replace(/"|'|[.-/]?|/gi, "").split("").reverse().join("_")}`;
                      main_var = null;
                  }
                  else {
                      // console.log(">>>>>>> passou aqui");
                      main_var = Import[1].replace(",", "");

                      let captDestructing = Import.slice(Import.indexOf("{")+1, Import.indexOf("}")).join(" ").match(/[a-zA-Z]+(\sas\s)[a-zA-Z]+[,\s]?/gi);
                      let declarationDestructing;
                      let refat;

                      if(captDestructing !== null){

                        refat = Import.join(" ");

                        captDestructing.forEach(eachCapt =>{

                            // console.log(eachCapt, declarationDestructing)

                            declarationDestructing = eachCapt.split(/as/g).join("").replace(/\s/, "").replace(',', "").split(" ");

                            nscop.push(declarationDestructing);

                            refat = refat.replace(eachCapt, "").replace(/\s{2,}/g, " ");

                        });

                        refat = refat.slice(refat.indexOf("{")+1, refat.indexOf("}")).replace(/\s/g,"");

                        _blocksctx = /[a-zA-Z]/gi.test(refat) ? refat.split(",") : null;

                      }
                      else {

                          _blocksctx = Import.slice(Import.indexOf("{")+1, Import.indexOf("}")).join("").split(",");

                      }

                  }

                  /["'](.*?)['"]/gi.test(fileload) ?  fileload = fileload.replace(/\s|'|"|;/g, "") : null;

                  // console.log(_blocksctx);
                  if(_blocksctx !== null)
                      prop_vars = _blocksctx.map(res => `\nvar ${res} = _get_module['${"modulemain"+path.basename(fileload).replace(/[\W]/gi, "_")}']["${res}"];`);

                  nscop.forEach(res => {
                        prop_vars.push(`\nvar ${res[1]} = _get_module['${"modulemain"+path.basename(fileload).replace(/[\W]/gi, "_")}']["${res[0]}"];`);
                  });

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

              /["'](.*?)['"]/gi.test(fileload) ?  fileload = fileload.replace(/\s|'|"|;/g, "") : null;

              modulebasename = path.basename(fileload).replace(/[\W]/gi, "_");

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
                  beforescope = requirefile[fileload + "scope1"];
                  requirefile = requirefile[path.basename(fileload)];

                  if(requirefile === undefined){
                    file_result = file_result.replace(Import.join(" "), (x, y) =>{
                        return "";
                    });
                    return file_result;
                  }
              }
              else {
                  if(extension === ".html" || extension === ".pug" || extension === ".jade" || extension === ".vue" || extension === ".react"){

                      (requirefile = requirecomponente(fileload, _config, _path))

                      // console.log(requirefile);

                      Object.keys(requirefile.vue).length > 0 ? type = "vue" : Object.keys(requirefile.react).length > 0 ? type = "react" : null;

                      beforescope = requirefile[path.basename(fileload.replace(extension, "")) + "scope1"];
                      requirefile = requirefile[type][path.basename(fileload.replace(extension, ""))];

                      typeload = "requirecomponent_module";
                  }
                  else if (extension === ".css") {

                      let filecss = fs.readFileSync(path.join(_path, fileload), 'utf8');

                      global.components.allStyle += filecss;
                      
                      file_result = file_result.replace(Import.join(" "), () => "");

                      return file_result;
                  }
                  else {

                      if(fileload.indexOf(".") === -1 && fs.existsSync(path.join(_path, 'node_modules', fileload)) || fs.existsSync(path.join(_path, 'node_modules', fileload + ".js")) || fs.existsSync(path.join(process.cwd(), 'node_modules', fileload)) ){

                          let readpackagejson, _fileload;

                          requirefile = requiremodule(`require('${fileload}')`, 2, "noncallapply");

                          // console.log(requirefile)
                          // console.log(global.filenameregisters);
                          typeload = "requirenodemodules";
                      }

                      else if(fs.existsSync(_path + "/"+ fileload) || fs.existsSync(path.join(_path, fileload + ".js"))){

                          // global.path = path.dirname(fileload);

                          requirefile = requiremodule(`require('${fileload}')`, 2, "noncallapply", _path);

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

              typeload !== "requirecomponent_module" ? requirefile = serializeexports(requirefile, main_var, _blocksctx) : null;

              // let envType = `'${_config.NODE_ENV}'` || 'development';

              // if(typeload === "requirenodemodules")
                  // extra  =`var process = module.exports = {};\nprocess.env = {NODE_ENV:${envType}};\nprocess.argv = [];\n`;

              file_result = file_result.replace(Import.join(" "), (x, y) =>{

                  var functionrequiremodule;
                  if(typeload === "requirecomponent"){
                      if(type === "vue"){
                          requirefile = `Vue.component('${fileload.replace(extension, "")}', ${requirefile});\n\n${subcomponents || ''}`;
                          return requirefile;
                      }
                      else if(type === "react"){
                          return requirefile;
                      }
                  }
                  else if(typeload === "requirecomponent_module"){
                      if(type === "vue"){
                          requirefile = `\n${subcomponents || ''}\nmodule.exports = ${requirefile}`;

                          functionmodule = `function __getModule${Import[3].replace(/[\W]|'|"/gi, "_")}(){\nvar module = {};\n\n/*scope of module imported*/\n${beforescope || ''}\n${requirefile}\nreturn module.exports;\n}\nvar ${Import[1]} = __getModule${Import[3].replace(/[^a-zA-Z ]|'|"/g, "_")}();`;
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

                        global.modules_register[modulebasename]["call"] = `_get_module['${"modulemain"+modulebasename}']`;
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

                          // global.modules_register[modulebasename]["call"] = `_get${modulebasename.replace(/[\W]|'|"|\//g, "_")}()`;
                          global.modules_register[modulebasename]["call"] = `_get_module['${"modulemain"+modulebasename}']`;
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
              // console.log(file_result)
          });
       }
  });

  patternImportsMatch.map(regex =>{

      regex.test(file_result) ? (file_result = importmodules(file_result, 2, _config)) : null;

  });

  if(file_result !== undefined && file_result !== null){

      return patternrequire.test(file_result) ? requiremodule(file_result, 2) : file_result;
  }

  return "";
}

module.exports = importmodules;
