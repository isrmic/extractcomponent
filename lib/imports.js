
var fs = require('fs');
var path = require('path');

var requirecomponente = require('./getComponent.js');


function importmodules (filetext, typerender, _config){

  var _path = process.cwd();
  var file = "";

  if(typerender === 2)
      file = filetext;
  else if(typerender === 1)
      file = fs.readFileSync(_path + "/" + filetext, 'utf8');

  var patternImportsMatch = [
    /import\s?"\w+[.\-\w/]+"/gi,
    /import\s?<{(.*?)}\/>/gi,
     /import\s{1}\w+\s{1}\w+\s{1}(\w+[^a-zA-Z]+[./\-\w]+|[^a-zA-Z]+[\w]+[^a-zA-Z]?\w+[^a-zA-Z]{3})/gi
  ];

  var patternexportstring = /module.exports+\s+=\s+[{]([^\n]*\n+)+[};]+/gi;

  var file_result = file;
  var requirefile;
  var fileload;
  var functionmodule;
  var extension;
  var namefile;
  var type;

  patternImportsMatch.map(regex => {

      var res = file.match(regex);
      
      var importers = [];

      if(res !== null){

          res.map(codeforimport =>{
              importers.push(codeforimport.split(" "));
          });


          importers.map(Import =>{

              fileload = '';
              requirefile = '';

              if(Import[0] !== "import")
                  return;

              if(/"(.*?)"/.test(Import[1])){
                  var matchcapture = /"(.*?)"/gi.exec(Import[1]);
                  fileload = matchcapture[1];
                  type = "requirefile";
              }
              else if(/<{(.*?)}\/>/.test(Import[1])){
                  fileload = Import[1];
                  type = "requirecomponent";
              }
              else
                  fileload = Import[3];

              if(Import[3] !== undefined && Import[2] !== "from")
                  return;

              extension = path.extname(fileload);

              if(fileload !== undefined && /<{(.*?)}\/>/i.test(fileload)){

                  fileload = fileload.replace(/<{(.*?)}\/>/i, (x, y) =>{
                      /\w+\-\w+/i.test(y) ? type = "vue" : y[0] === y[0].toUpperCase() ? type = "react" : console.log('undefined type');
                      return `${y}`;
                  });
                  requirefile = requirecomponente(fileload, _config)[type][fileload];

              }

              else {
                  if(extension === ".html" || extension === ".pug" || extension === ".jade" || extension === ".vue" || extension === ".react"){

                      (requirefile = requirecomponente(fileload, _config))

                      requirefile.vue.length > 0 ? type = "vue" : requirefile.react.length > 0 ? type = "react" : null;
                      requirefile = requirefile[type][fileload.replace(extension, "")];
                  }
                  else
                      requirefile = fs.readFileSync(_path + "/" + fileload, "utf8");
              }
              var extra = '';
              if(type === "requiremodule")
                  extra  =`var process = module.exports = {};\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\nprocess.version = '';\n`;

              file_result = file_result.replace(Import.join(" "), (x, y) =>{

                  if(type !== "react" && type !== "requirefile" && type !== "requirecomponent"){
                    if(type == "vue")
                        requirefile = `module.exports = ${requirefile}`;
                    functionmodule = `function __getModule${Import[3].replace(/[^a-zA-Z ]/g, "_")}(){\nvar module = {};\n${extra}\n/*scope of module imported*/\n${requirefile}\nreturn module.exports;\n}\nvar ${Import[1]} = __getModule${Import[3].replace(/[^a-zA-Z ]/g, "_")}();`;

                    return functionmodule;
                  }
                  return requirefile;
              });
          });
       }
  });
  patternImportsMatch.map(regex =>{

      regex.test(file_result) ? (file_result = importmodules(file_result, 2, _config)) : null;

  });

  if(file_result !== undefined && file_result !== null)
      return file_result;
  return "";
}

module.exports = importmodules;
