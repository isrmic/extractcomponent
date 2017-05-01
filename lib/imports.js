// requirements of modules

global.modules_register = [];

var fs = require('fs');
var path = require('path');

var requirecomponente = require('./getComponent.js');

var requiremodule = require('./require.js');
var patterncommentsml = /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gim;

var patternImportsMatch = [
  /import\s?"\w+[.\-\w/]+"/gi,
  /import\s?{<(.*?)\/>}/gi,
  /import\s\w+\s\w{4,}\s(["']?[\w\s\d./-]+['"]?|{<(.*?)\/>})/gi,
  //  /import\s{1}\w+\s{1}\w+\s{1}(.\w+[^a-zA-Z]+[./\-\w]+|[^a-zA-Z]+[.\w]+[^a-zA-Z]?[.\w]+[^a-zA-Z]{3})/gi
];

function importmodules (filetext, typerender, _config){

  var _path = process.cwd();
  var file = "";

  if(typerender === 2){
        file = filetext;
  }
  else if(typerender === 1)
      file = fs.readFileSync(_path + "/" + filetext, 'utf8');


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

  patternImportsMatch.map(regex => {

      var res = file.match(regex);

      var importers = [];

      if(res !== null){

          res.map(codeforimport =>{
              importers.push(codeforimport.split(" "));
          });

          typeload = '';
          importers.map(Import =>{

              fileload = '';
              requirefile = '';
              type = '';

              if(Import[0] !== "import")
                  return;

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
              }
              else
                  fileload = Import[3];



              if(Import[3] !== undefined && Import[2] !== "from")
                  return;

              /["'](.*?)['"]/gi.test(fileload) ?  fileload = fileload.replace(/\s|'|"/g, "") : null;

              extension = path.extname(fileload);

              extension === ".js" && Import[3] !== undefined ? typeload = "requirescript" : null;
              
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

                      if(fs.existsSync('./node_modules/' + fileload + "/dist/" + fileload + ".js"))
                          (requirefile = fs.readFileSync('./node_modules/' + fileload + "/dist/" + fileload + ".js", 'utf8'), typeload = "requirenodemodules")

                      else if(fs.existsSync(_path + "/"+ fileload)){

                          global.path = path.dirname(fileload);
                          requirefile = fs.readFileSync(_path + "/" + fileload, "utf8");

                      }
                      else{
                          requirefile = requirecomponente(fileload, _config);
                      }
                  }
              }

              var extra = '';
              if(typeload === "requirenodemodules")
                  extra  =`var process = module.exports = {};\nprocess.env = {};\nprocess.argv = [];\n`;

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
                          requirefile = `module.exports = ${requirefile}`;
                          functionmodule = `function __getModule${Import[3].replace(/[^a-zA-Z ]|'|"/gi, "_")}(){\nvar module = {};\n${extra}\n/*scope of module imported*/\n${requirefile}\nreturn module.exports;\n}\nvar ${Import[1]} = __getModule${Import[3].replace(/[^a-zA-Z ]|'|"/g, "_")}();`;
                          return functionmodule;
                      }
                      if(type === "react"){
                          functionmodule = `var ${Import[1]} = (function() { \n${requirefile}\n\n return ${fileload};\n\n })();`;
                          return functionmodule;
                      }
                  }
                  else if(typeload === "requirescript"){

                    if(global.modules_register[fileload] !== undefined){
                        call_module = global.modules_register[fileload]["call"];
                    }
                    else{

                        global.modules_register[fileload] = [];
                        global.modules_register[fileload]["call"] = `_getModule_${Import[1].replace(/[^a-zA-Z ]|'|"/gi, "_")}()`;
                        call_module = global.modules_register[fileload]["call"];
                        functionrequiremodule = `function ${call_module}{\n\nvar exports = {};\nvar module ={exports}; \n${extra}\n ${requirefile} return module.exports;} \nvar ${Import[1]} = ${call_module};\n\n`;
                        return functionrequiremodule;
                    }

                    return `var ${Import[1]} = ${call_module};`;

                  }
                  else if(typeload === "requirenodemodules"){
                      if(global.modules_register[fileload] !== undefined){
                          call_module = global.modules_register[fileload]["call"];

                      }
                      else{

                          global.modules_register[fileload] = [];
                          global.modules_register[fileload]["call"] = `_getModule_${Import[3].replace(/[^a-zA-Z ]|'|"/g, "_")}()`;
                          call_module = global.modules_register[fileload]["call"];
                          functionrequiremodule = `function ${call_module}{\n\nvar exports = {};\nvar module ={exports}; \n${extra}\n ${requirefile} return module.exports;} \nvar ${Import[1]} = ${call_module};\n\n`;
                          return functionrequiremodule;
                      }

                      return `var ${Import[1]} = ${call_module};`;
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

  if(file_result !== undefined && file_result !== null)
      return requiremodule(file_result);
  return "";
}

module.exports = importmodules;
